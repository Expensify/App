import lodashIsEmpty from 'lodash/isEmpty';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import MoneyRequestPreviewContent from './MoneyRequestPreviewContent';
import type {MoneyRequestPreviewOnyxProps, MoneyRequestPreviewProps} from './types';

function MoneyRequestPreview(props: MoneyRequestPreviewProps) {
    // We should not render the component if there is no iouReport and it's not a split or track expense.
    // Moved outside of the component scope to allow for easier use of hooks in the main component.
    // eslint-disable-next-line react/jsx-props-no-spreading
    return lodashIsEmpty(props.iouReport) && !(props.isBillSplit || props.isTrackExpense) ? null : <MoneyRequestPreviewContent {...props} />;
}

MoneyRequestPreview.displayName = 'MoneyRequestPreview';

export default withOnyx<MoneyRequestPreviewProps, MoneyRequestPreviewOnyxProps>({
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
        key: ({action}) => {
            const isMoneyRequestAction = ReportActionsUtils.isMoneyRequestAction(action);
            const transactionID = isMoneyRequestAction ? ReportActionsUtils.getOriginalMessage(action)?.IOUTransactionID : 0;
            return `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`;
        },
    },
    walletTerms: {
        key: ONYXKEYS.WALLET_TERMS,
    },
    transactionViolations: {
        key: ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
    },
})(MoneyRequestPreview);
