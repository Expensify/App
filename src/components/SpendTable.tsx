import React from 'react';
import { useSpendData } from '../hooks/useSpendData';
import { Table } from 'react-bootstrap';

export const SpendTable: React.FC = () => {
  const { spendItems } = useSpendData();

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          {/* Updated column header from "Date" to "Created" */}
          <th>Created</th>
          <th>Description</th>
          <th>Amount</th>
          <th>Category</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {spendItems.map((item) => (
          <tr key={item.id}>
            <td>{new Date(item.createdAt).toLocaleDateString()}</td>
            <td>{item.description}</td>
            <td>{item.amount}</td>
            <td>{item.category}</td>
            <td>
              {/* action buttons */}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
