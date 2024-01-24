// We should not render the component if there is no iouReport and it's not a split.
// Moved outside of the component scope to allow memoization of values later.
import lodashIsEmpty from 'lodash/isEmpty';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import MoneyRequestPreview from './MoneyRequestPreview';
import MoneyRequestPreviewPropTypes from './moneyRequestPreviewPropTypes';

// We should not render the component if there is no iouReport and it's not a split.
// Moved outside of the component scope to allow for easier use of hooks in the main component.
function MoneyRequestPreviewWrapper(props) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return lodashIsEmpty(props.iouReport) && !props.isBillSplit ? null : <MoneyRequestPreview {...props} />;
}

MoneyRequestPreviewWrapper.propTypes = MoneyRequestPreviewPropTypes.propTypes;
MoneyRequestPreviewWrapper.defaultProps = MoneyRequestPreviewPropTypes.defaultProps;
MoneyRequestPreviewWrapper.displayName = 'MoneyRequestPreviewWrapper';

export default withOnyx({
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    },
    chatReport: {
        key: ({chatReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`,
    },
    iouReport: {
        key: ({iouReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`,
    },
    session: {
        key: ONYXKEYS.SESSION,
    },
    transaction: {
        key: ({action}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${(action && action.originalMessage && action.originalMessage.IOUTransactionID) || 0}`,
    },
    walletTerms: {
        key: ONYXKEYS.WALLET_TERMS,
    },
    transactionViolations: {
        key: ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
    },
})(MoneyRequestPreviewWrapper);
