import React from 'react';
import IOUModal from './IOUModal';

// eslint-disable-next-line react/jsx-props-no-spreading
const IOUBillPage = props => <IOUModal {...props} hasMultipleParticipants />;
IOUBillPage.displayName = 'IOUBillPage';
export default IOUBillPage;
