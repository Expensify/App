import React from 'react';
import MoneyRequestModal from './MoneyRequestModal';

// eslint-disable-next-line react/jsx-props-no-spreading
function IOURequestPage(props) {
    return <MoneyRequestModal {...props} />;
}
IOURequestPage.displayName = 'IOURequestPage';
export default IOURequestPage;
