import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

function Dashboard() {
  return <h1>Dashboard</h1>;
}

function AddExpense() {
  return <h1>Add Expense</h1>;
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add" element={<AddExpense />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;