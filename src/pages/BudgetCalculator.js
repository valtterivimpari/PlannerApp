import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BudgetCalculator.css';

const BudgetCalculator = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  
  // Start with an empty expense list
  const [expenses, setExpenses] = useState([]);
  const [currency, setCurrency] = useState('EUR'); // default currency
  const [message, setMessage] = useState('');

  // Calculate total from expense amounts
  const calculateTotal = () => {
    return expenses.reduce((acc, expense) => acc + (parseFloat(expense.amount) || 0), 0);
  };
  const totalBudget = calculateTotal();

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/trips/${tripId}/budget`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data) {
          if (response.data.expenses) {
            setExpenses(response.data.expenses);
          }
          if (response.data.currency) {
            setCurrency(response.data.currency);
          }
        }
      } catch (error) {
        console.error("Error fetching budget:", error);
      }
    };
    fetchBudget();
  }, [tripId]);

  const handleExpenseChange = (index, field, value) => {
    const updatedExpenses = [...expenses];
    updatedExpenses[index] = { ...updatedExpenses[index], [field]: value };
    setExpenses(updatedExpenses);
  };

  const addExpenseItem = () => {
    setExpenses([...expenses, { category: '', amount: '' }]);
  };

  const removeExpenseItem = (index) => {
    const updatedExpenses = expenses.filter((_, i) => i !== index);
    setExpenses(updatedExpenses);
  };

  const handleSaveBudget = async () => {
    try {
      const token = localStorage.getItem('token');
      const payload = { totalBudget, expenses, currency };
      await axios.put(`http://localhost:5000/api/trips/${tripId}/budget`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Budget saved successfully!");
    } catch (error) {
      console.error("Error saving budget:", error);
      setMessage("Failed to save budget.");
    }
  };

  return (
    <div className="budget-container">
      <h1>Budget Calculator</h1>
      <div className="budget-form">
        <div className="currency-selector">
          <label htmlFor="currency">Currency:</label>
          <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
            <option value="GBP">GBP (£)</option>
            <option value="JPY">JPY (¥)</option>
            {/* Add more currencies as needed */}
          </select>
        </div>

        <h2>Expenses</h2>
        {expenses.length === 0 && (
          <p>No expenses added. Click "Add Expense" to begin.</p>
        )}
        {expenses.map((expense, index) => (
          <div key={index} className="expense-item">
            <input 
              type="text" 
              value={expense.category} 
              onChange={(e) => handleExpenseChange(index, 'category', e.target.value)}
              placeholder="Expense category (e.g., Accommodation)" 
            />
            <input 
              type="number" 
              value={expense.amount} 
              onChange={(e) => handleExpenseChange(index, 'amount', e.target.value)} 
              placeholder="Amount" 
            />
            <button onClick={() => removeExpenseItem(index)} className="remove-expense-button">
              Remove
            </button>
          </div>
        ))}
        <button onClick={addExpenseItem} className="add-expense-button">Add Expense</button>

        <div className="total-budget">
          <strong>Total Budget: </strong>
          <span>{totalBudget} {currency}</span>
        </div>

        <button onClick={handleSaveBudget} className="save-budget-button">Save Budget</button>
        {message && <p className="message">{message}</p>}
      </div>
      <button onClick={() => navigate(-1)} className="back-button">Back to Trip Info</button>
    </div>
  );
};

export default BudgetCalculator;

  