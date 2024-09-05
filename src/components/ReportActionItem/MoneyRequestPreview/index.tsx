import lodashIsEmpty from 'lodash/isEmpty';
import React from 'react';
import {useOnyx} from 'react-native-onyx';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import MoneyRequestPreviewContent from './MoneyRequestPreviewContent';
import type {MoneyRequestPreviewOnyxProps, MoneyRequestPreviewProps} from './types';

function MoneyRequestPreview(props: MoneyRequestPreviewProps) {
    // We should not render the component if there is no iouReport and it's not a split or track expense.
    // Moved outside of the component scope to allow for easier use of hooks in the main component.
    // eslint-disable-next-line react/jsx-props-no-spreading
    return lodashIsEmpty(props.iouReport) && !(props.isBillSplit || props.isTrackExpense) ? null : <MoneyRequestPreviewContent {...props} />;
}

MoneyRequestPreview.displayName = 'MoneyRequestPreview';

export default function ComponentWithOnyx(props: Omit<MoneyRequestPreviewProps, keyof MoneyRequestPreviewOnyxProps>) {
    const [personalDetails, personalDetailsMetadata] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [chatReport, chatReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${props.chatReportID}`);
    const [iouReport, iouReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${props.iouReportID}`);
    const [session, sessionMetadata] = useOnyx(ONYXKEYS.SESSION);

    const reportAction = props.action;
    const isMoneyRequestAction = ReportActionsUtils.isMoneyRequestAction(reportAction);
    const transactionID = isMoneyRequestAction ? ReportActionsUtils.getOriginalMessage(reportAction)?.IOUTransactionID : 0;
    const [transaction, transactionMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);

    const [walletTerms, walletTermsMetadata] = useOnyx(ONYXKEYS.WALLET_TERMS);
    const [transactionViolations, transactionViolationsMetadata] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);

    if (isLoadingOnyxValue(personalDetailsMetadata, chatReportMetadata, iouReportMetadata, sessionMetadata, transactionMetadata, walletTermsMetadata, transactionViolationsMetadata)) {
        return null;
    }

    return (
        <MoneyRequestPreview
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            personalDetails={personalDetails}
            chatReport={chatReport}
            iouReport={iouReport}
            session={session}
            transaction={transaction}
            walletTerms={walletTerms}
            transactionViolations={transactionViolations}
        />
    );
}
