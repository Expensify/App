import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import axiosMock from 'axios';
import ExpenseDetailComponent from './ExpenseDetailComponent';

jest.mock('axios');

describe('ExpenseDetailComponent', () => {
  it('displays loading message initially', () => {
    render(
      <Router>
        <ExpenseDetailComponent />
      </Router>
    );
    expect(screen.getByText(/Loading.../)).toBeInTheDocument();
  });

  it('displays expense details after loading', async () => {
    axiosMock.get.mockResolvedValueOnce({
      data: { amount: 100, description: 'Dinner', category: 'Food' },
    });

    render(
      <Router>
        <ExpenseDetailComponent />
      </Router>
    );

    await waitFor(() => screen.getByText(/Dinner/));
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('Dinner')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
  });

  it('displays error message when fetching fails', async () => {
    axiosMock.get.mockRejectedValueOnce(new Error('Failed to load'));

    render(
      <Router>
        <ExpenseDetailComponent />
      </Router>
    );

    await waitFor(() => screen.getByText(/Failed to load expense details/));
    expect(screen.getByText('Failed to load expense details')).toBeInTheDocument();
  });
});