import React from 'react';
import MoneyRequestModal from './MoneyRequestModal';

function IOURequestPage(props) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <MoneyRequestModal {...props} />;
}
IOURequestPage.displayName = 'IOURequestPage';
export default IOURequestPage;
