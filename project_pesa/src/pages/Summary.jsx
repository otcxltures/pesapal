import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

function Summary() {
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState(0);
  const navigate = useNavigate();

  const getData = useCallback(async (uid) => {
    const q = query(collection(db, 'expenses'), where('userId', '==', uid));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((expenseDoc) => ({ id: expenseDoc.id, ...expenseDoc.data() }));
    setExpenses(data);

    const budgetSnapshot = await getDoc(doc(db, 'budgets', uid));
    setBudget(budgetSnapshot.exists() ? budgetSnapshot.data().amount || 0 : 0);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        getData(currentUser.uid);
      } else {
        navigate('/login');
      }
    });

    return unsubscribe;
  }, [getData, navigate]);

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remaining = Math.max(budget - totalSpent, 0);

  // group expenses by category
  const categoryTotals = {};
  for (let i = 0; i < expenses.length; i++) {
    const cat = expenses[i].category;
    if (categoryTotals[cat]) {
      categoryTotals[cat] += expenses[i].amount;
    } else {
      categoryTotals[cat] = expenses[i].amount;
    }
  }

  // get recent expenses (last 5)
  const recent = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  if (!user) return <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="container">
      {/* stat cards */}
      <div className="stats-row">
        <div className="stat-card" style={{ borderTop: '4px solid #7c3aed' }}>
          <p className="stat-label">TOTAL BUDGET</p>
          <h3 className="stat-value">KSH {budget.toLocaleString()}</h3>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid #ef4444' }}>
          <p className="stat-label">TOTAL SPENT</p>
          <h3 className="stat-value" style={{ color: '#ef4444' }}>KSH {totalSpent.toLocaleString()}</h3>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid #10b981' }}>
          <p className="stat-label">REMAINING</p>
          <h3 className="stat-value" style={{ color: '#10b981' }}>KSH {remaining.toLocaleString()}</h3>
        </div>
      </div>

      {/* two column layout */}
      <div className="summary-grid">
        <div className="card">
          <h2 style={{ fontSize: '22px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid var(--light-blue)', color: 'var(--dark-blue)' }}>
            Spending by Category
          </h2>
          {Object.keys(categoryTotals).length === 0 ? (
            <p className="empty-message">No expenses to show</p>
          ) : (
            <div>
              {Object.entries(categoryTotals).map(([cat, amount]) => (
                <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e1e8ed' }}>
                  <span style={{ color: 'var(--gray)' }}>{cat}</span>
                  <strong style={{ color: 'var(--dark-blue)' }}>KSH {amount.toLocaleString()}</strong>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 style={{ fontSize: '22px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid var(--light-blue)', color: 'var(--dark-blue)' }}>
            Recent Activity
          </h2>
          {recent.length === 0 ? (
            <p className="empty-message">No expenses to show</p>
          ) : (
            <div>
              {recent.map((exp) => (
                <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e1e8ed' }}>
                  <div>
                    <span style={{ color: 'var(--dark-blue)', fontWeight: '500' }}>{exp.description}</span>
                    <span style={{ color: 'var(--gray)', fontSize: '13px', display: 'block' }}>{exp.category}</span>
                  </div>
                  <strong style={{ color: 'var(--dark-blue)' }}>KSH {exp.amount.toLocaleString()}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* all expenses table */}
      <div className="table-container">
        <h2 style={{ fontSize: '22px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid var(--light-blue)', color: 'var(--dark-blue)' }}>
          All Expenses
        </h2>
        {expenses.length === 0 ? (
          <p className="empty-message">No expenses recorded yet</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {[...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).map((exp) => (
                <tr key={exp.id}>
                  <td>{new Date(exp.date).toLocaleDateString('en-GB')}</td>
                  <td>{exp.description}</td>
                  <td>{exp.category}</td>
                  <td><strong>KSH {exp.amount.toLocaleString()}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="footer">
        <p>PesaPal - Made for students</p>
      </div>
    </div>
  );
}

export default Summary;
