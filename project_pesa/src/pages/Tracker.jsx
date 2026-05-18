import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';

function Tracker() {
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState(0);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [usdRate, setUsdRate] = useState(null);
  const navigate = useNavigate();

  // get exchange rate from api
  const getExchangeRate = useCallback(async () => {
    try {
      const res = await fetch('https://api.exchangerate-api.com/v4/latest/KES');
      const data = await res.json();
      setUsdRate(data.rates.USD);
    } catch (err) {
      console.error('exchange rate error:', err);
    }
  }, []);

  // get expenses from firestore
  const getExpenses = useCallback(async (uid) => {
    const q = query(collection(db, 'expenses'), where('userId', '==', uid));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((expenseDoc) => ({ id: expenseDoc.id, ...expenseDoc.data() }));
    setExpenses(data);
  }, []);

  const getBudget = useCallback(async (uid) => {
    const budgetSnapshot = await getDoc(doc(db, 'budgets', uid));
    if (budgetSnapshot.exists()) {
      setBudget(budgetSnapshot.data().amount || 0);
    }
  }, []);

  // check if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        getExpenses(currentUser.uid);
        getBudget(currentUser.uid);
        getExchangeRate();
      } else {
        navigate('/login');
      }
    });

    return unsubscribe;
  }, [getBudget, getExchangeRate, getExpenses, navigate]);

  const saveBudget = async (e) => {
    e.preventDefault();
    if (!user) return;

    await setDoc(doc(db, 'budgets', user.uid), {
      amount: budget,
      userId: user.uid,
      updatedAt: new Date().toISOString()
    });
  };

  // add new expense
  const addExpense = async (e) => {
    e.preventDefault();
    if (!amount || !description) return;

    const newExpense = {
      userId: user.uid,
      description,
      amount: parseFloat(amount),
      category,
      date: new Date().toISOString()
    };

    await addDoc(collection(db, 'expenses'), newExpense);
    setDescription('');
    setAmount('');
    setCategory('Food');
    getExpenses(user.uid);
  };

  // delete expense
  const deleteExpense = async (id) => {
    await deleteDoc(doc(db, 'expenses', id));
    getExpenses(user.uid);
  };

  // calculate totals
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remaining = Math.max(budget - totalSpent, 0);
  const percent = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;

  // alert messages
  let alertClass = 'alert-info';
  let alertMsg = 'Set a budget to start tracking your spending.';
  if (budget > 0) {
    if (totalSpent >= budget) {
      alertClass = 'alert-error';
      alertMsg = 'You have exceeded your budget!';
    } else if (totalSpent >= budget * 0.85) {
      alertClass = 'alert-warning';
      alertMsg = 'Warning: You are close to your budget limit.';
    } else if (totalSpent > 0) {
      alertMsg = 'Your spending is on track. Keep it up!';
    } else {
      alertMsg = 'Add your first expense to see your totals.';
    }
  }

  const usdValue = budget > 0 && usdRate ? (budget * usdRate).toFixed(2) : null;

  const logout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  if (!user) return <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
        <button onClick={logout} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }}>
          Logout
        </button>
      </div>

      <div className="tracker-grid">
        <div className="card">
          <h2 style={{ fontSize: '22px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid var(--light-blue)' }}>
            Set Your Budget
          </h2>
          <form onSubmit={saveBudget}>
            <div className="form-group">
              <label>Monthly Budget (KSH)</label>
              <input 
                type="number" 
                value={budget || ''} 
                onChange={(e) => setBudget(parseFloat(e.target.value) || 0)} 
                placeholder="e.g. 5000"
              />
            </div>
            <button type="submit" className="btn btn-primary">Set Budget</button>
          </form>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '22px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid var(--light-blue)' }}>
            Add Expense
          </h2>
          <form onSubmit={addExpense}>
            <div className="form-group">
              <label>Description</label>
              <input 
                type="text" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="e.g. Lunch at cafeteria"
                required
              />
            </div>
            <div className="form-group">
              <label>Amount (KSH)</label>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                placeholder="e.g. 200"
                required
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option>Food</option>
                <option>Transport</option>
                <option>Entertainment</option>
                <option>Subscriptions</option>
                <option>Other</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Add Expense</button>
          </form>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '22px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid var(--light-blue)' }}>
            Your Summary
          </h2>
          
          <div className="stat-row">
            <span>Budget:</span>
            <strong>KSH {budget.toLocaleString()}</strong>
          </div>
          <div className="stat-row">
            <span>Spent:</span>
            <strong>KSH {totalSpent.toLocaleString()}</strong>
          </div>
          <div className="stat-row">
            <span>Remaining:</span>
            <strong>KSH {remaining.toLocaleString()}</strong>
          </div>

          <div className="stat-row" style={{ background: '#fff9c4' }}>
            <span>In USD:</span>
            <strong>{usdValue ? `$${usdValue}` : 'Set budget first'}</strong>
          </div>

          <div className="progress-bg" style={{ marginTop: '15px' }}>
            <div 
              className="progress-fill" 
              style={{ 
                width: `${percent}%`,
                background: percent >= 100 ? 'linear-gradient(90deg, #e74c3c, #c0392b)' : 
                           percent >= 85 ? 'linear-gradient(90deg, #f39c12, #e67e22)' : 
                           'linear-gradient(90deg, #8eea9f, #5b7fff)'
              }}
            ></div>
          </div>

          <div className={`alert ${alertClass}`} style={{ marginTop: '15px' }}>
            {alertMsg}
          </div>
        </div>
      </div>

      <div className="table-container">
        <h2 style={{ fontSize: '22px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid var(--light-blue)', color: 'var(--dark-blue)' }}>
          Recent Expenses
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
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.slice().reverse().map((exp) => (
                <tr key={exp.id}>
                  <td>{new Date(exp.date).toLocaleDateString('en-GB')}</td>
                  <td>{exp.description}</td>
                  <td>{exp.category}</td>
                  <td><strong>KSH {exp.amount.toLocaleString()}</strong></td>
                  <td>
                    <button onClick={() => deleteExpense(exp.id)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Tracker;
