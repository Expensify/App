import {useFocusEffect} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import * as Illustrations from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import type {FullScreenNavigatorParamList} from '@libs/Navigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import WorkspaceExpensifyCardListPage from './WorkspaceExpensifyCardListPage';
import WorkspaceExpensifyCardPageEmptyState from './WorkspaceExpensifyCardPageEmptyState';

type WorkspaceExpensifyCardPageProps = StackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD>;

function WorkspaceExpensifyCardPage({route}: WorkspaceExpensifyCardPageProps) {
    const policyID = route.params.policyID ?? '-1';
    const workspaceAccountID = PolicyUtils.getWorkspaceAccountID(policyID);

    const {translate} = useLocalize();
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}`);
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`);

    const fetchExpensifyCards = useCallback(() => {
        Policy.openPolicyExpensifyCardsPage(policyID, workspaceAccountID);
    }, [policyID, workspaceAccountID]);

    const {isOffline} = useNetwork({onReconnect: fetchExpensifyCards});

    useFocusEffect(fetchExpensifyCards);

    const paymentBankAccountID = cardSettings?.paymentBankAccountID ?? 0;
    const isLoading = !isOffline && (!cardSettings || (cardSettings.isLoading && Object.keys(cardSettings).length === 1));

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
        >
            <WorkspacePageWithSections
                shouldUseScrollView
                icon={Illustrations.HandCard}
                headerText={translate('workspace.common.expensifyCard')}
                route={route}
                guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_EXPENSIFY_CARD}
                shouldShowOfflineIndicatorInWideScreen
                isLoading={isLoading}
            >
                {!!paymentBankAccountID && !isLoading && (
                    <WorkspaceExpensifyCardListPage
                        cardsList={cardsList}
                        route={route}
                    />
                )}
                {!paymentBankAccountID && !isLoading && <WorkspaceExpensifyCardPageEmptyState route={route} />}
            </WorkspacePageWithSections>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceExpensifyCardPage.displayName = 'WorkspaceExpensifyCardPage';

export default WorkspaceExpensifyCardPage;
