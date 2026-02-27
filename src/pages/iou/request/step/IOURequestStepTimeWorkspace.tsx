import React from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {setTransactionReport} from '@libs/actions/Transaction';
import {shouldUseTransactionDraft} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import {getActivePoliciesWithExpenseChatAndTimeEnabled, getDefaultTimeTrackingRate} from '@libs/PolicyUtils';
import {getPolicyExpenseChat} from '@libs/ReportUtils';
import {setMoneyRequestParticipantsFromReport, setMoneyRequestTimeRate} from '@userActions/IOU';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import BaseRequestStepWorkspace from './BaseRequestStepWorkspace';

type IOURequestStepTimeWorkspaceProps = PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.CREATE>;

function IOURequestStepTimeWorkspace({route, navigation}: IOURequestStepTimeWorkspaceProps) {
    const {
        params: {action, iouType, transactionID},
    } = route;

    const {accountID} = useCurrentUserPersonalDetails();
    const isTransactionDraft = shouldUseTransactionDraft(action);

    return (
        <BaseRequestStepWorkspace
            route={route}
            navigation={navigation}
            getPolicies={getActivePoliciesWithExpenseChatAndTimeEnabled}
            onSelectWorkspace={(policy) => {
                const policyExpenseChat = getPolicyExpenseChat(accountID, policy?.id);
                if (!policyExpenseChat) {
                    console.error(`Couldn't find policy expense chat for policyID: ${policy?.id}`);
                    return;
                }

                setTransactionReport(transactionID, {reportID: policyExpenseChat.reportID}, isTransactionDraft);
                setMoneyRequestParticipantsFromReport(transactionID, policyExpenseChat, accountID);

                const defaultRate = getDefaultTimeTrackingRate(policy);
                if (defaultRate) {
                    setMoneyRequestTimeRate(transactionID, defaultRate, isTransactionDraft);
                }

                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_HOURS.getRoute(action, iouType, transactionID, policyExpenseChat.reportID));
            }}
        />
    );
}

export default IOURequestStepTimeWorkspace;
