import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import axios from 'axios';

const ExpenseDetailComponent = () => {
  const { expenseId } = useParams();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const history = useHistory();

  useEffect(() => {
    const fetchExpenseDetail = async () => {
      try {
        const response = await axios.get(`/api/expenses/${expenseId}`);
        setExpense(response.data);
      } catch (err) {
        setError('Failed to load expense details');
      } finally {
        setLoading(false);
      }
    };
    fetchExpenseDetail();
  }, [expenseId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!expense) {
    return <div>No expense found</div>;
  }

  return (
    <div>
      <h1>Expense Details</h1>
      <p><strong>Amount:</strong> ${expense.amount}</p>
      <p><strong>Description:</strong> {expense.description}</p>
      <p><strong>Category:</strong> {expense.category}</p>
      <button onClick={() => history.push('/expenses')}>Back to Expenses</button>
    </div>
  );
};

export default ExpenseDetailComponent;