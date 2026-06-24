import {useRoute} from '@react-navigation/native';
import React from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {setNameValuePair} from '@libs/actions/User';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {FeatureTrainingNavigatorParamList} from '@libs/Navigation/types';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {changeMoneyRequestHoldStatus} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import BaseHoldSubmitterEducationalModal from './BaseHoldSubmitterEducationalModal';

function HoldSubmitterEducationalSingleModal() {
    const route = useRoute<PlatformStackRouteProp<FeatureTrainingNavigatorParamList, typeof SCREENS.DYNAMIC_HOLD_EDUCATIONAL_ROOT>>();
    const {isOffline} = useNetwork();
    const {login: currentUserLogin, accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const {transactionThreadReportID} = route.params;

    const [threadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transactionThreadReportID)}`);
    const [parentReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(threadReport?.parentReportID)}`);
    const rawParentReportAction = threadReport?.parentReportActionID ? parentReportActions?.[threadReport.parentReportActionID] : undefined;
    const parentReportAction = isMoneyRequestAction(rawParentReportAction) ? rawParentReportAction : null;
    const iouTransactionID = parentReportAction ? getOriginalMessage(parentReportAction)?.IOUTransactionID : undefined;
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(iouTransactionID)}`);
    const [transactionViolations] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${getNonEmptyStringOnyxID(iouTransactionID)}`);

    const handleDismiss = () => {
        setNameValuePair(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION, true, false, !isOffline);

        Navigation.goBack(undefined, {
            afterTransition: () => {
                if (!parentReportAction) {
                    return;
                }
                changeMoneyRequestHoldStatus(parentReportAction, transaction, isOffline, currentUserLogin ?? '', currentUserAccountID, transactionViolations);
            },
        });
    };

    return <BaseHoldSubmitterEducationalModal onDismiss={handleDismiss} />;
}

export default HoldSubmitterEducationalSingleModal;
