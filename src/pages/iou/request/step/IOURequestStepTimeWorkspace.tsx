import React from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {shouldUseTransactionDraft} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import {getActivePoliciesWithExpenseChatAndTimeEnabled, getDefaultTimeTrackingRate} from '@libs/PolicyUtils';
import {setMoneyRequestParticipantAsPolicyExpenseChat, setMoneyRequestTimeRate} from '@userActions/IOU';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import BaseRequestStepWorkspace from './BaseRequestStepWorkspace';

type IOURequestStepTimeWorkspaceProps = PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.CREATE>;

function IOURequestStepTimeWorkspace({route, navigation}: IOURequestStepTimeWorkspaceProps) {
    const {
        params: {action, iouType, transactionID, reportID, reportActionID},
    } = route;

    const {accountID} = useCurrentUserPersonalDetails();
    const isTransactionDraft = shouldUseTransactionDraft(action);

    return (
        <BaseRequestStepWorkspace
            route={route}
            navigation={navigation}
            getPolicies={getActivePoliciesWithExpenseChatAndTimeEnabled}
            onSelectWorkspace={(item, allPolicies) => {
                setMoneyRequestParticipantAsPolicyExpenseChat({
                    transactionID,
                    policyID: item.value,
                    currentUserAccountID: accountID,
                    isDraft: isTransactionDraft,
                    participantsAutoAssigned: true,
                });

                const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${item.value}`];
                const defaultRate = policy ? getDefaultTimeTrackingRate(policy) : undefined;
                if (defaultRate) {
                    setMoneyRequestTimeRate(transactionID, defaultRate, isTransactionDraft);
                }

                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_HOURS.getRoute(action, iouType, transactionID, reportID, reportActionID));
            }}
        />
    );
}

export default IOURequestStepTimeWorkspace;
