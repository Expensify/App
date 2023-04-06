import React from 'react';
import MoneyRequestModal from './MoneyRequestModal';

// eslint-disable-next-line react/jsx-props-no-spreading
const IOUBillPage = props => <MoneyRequestModal {...props} hasMultipleParticipants />;
IOUBillPage.displayName = 'IOUBillPage';
export default IOUBillPage;
