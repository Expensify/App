import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {ActivityIndicator} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';
import {filterInactiveCards} from '@libs/CardUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {openPolicyExpensifyCardsPage} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import WorkspaceExpensifyCardListPage from './WorkspaceExpensifyCardListPage';
import WorkspaceExpensifyCardPageEmptyState from './WorkspaceExpensifyCardPageEmptyState';

type WorkspaceExpensifyCardPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD>;

function WorkspaceExpensifyCardPage({route}: WorkspaceExpensifyCardPageProps) {
    const policyID = route.params.policyID;
    const workspaceAccountID = useWorkspaceAccountID(policyID);

    const styles = useThemeStyles();
    const theme = useTheme();
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}`);
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`, {selector: filterInactiveCards});

    const fetchExpensifyCards = useCallback(() => {
        openPolicyExpensifyCardsPage(policyID, workspaceAccountID);
    }, [policyID, workspaceAccountID]);

    const {isOffline} = useNetwork({onReconnect: fetchExpensifyCards});

    useFocusEffect(fetchExpensifyCards);

    const paymentBankAccountID = cardSettings?.paymentBankAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const isLoading = !isOffline && (!cardSettings || cardSettings.isLoading);

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
        >
            {!!isLoading && !paymentBankAccountID && (
                <ActivityIndicator
                    size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                    style={styles.flex1}
                    color={theme.spinner}
                />
            )}
            {!!paymentBankAccountID && (
                <WorkspaceExpensifyCardListPage
                    cardsList={cardsList}
                    route={route}
                />
            )}
            {!paymentBankAccountID && !isLoading && <WorkspaceExpensifyCardPageEmptyState route={route} />}
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceExpensifyCardPage.displayName = 'WorkspaceExpensifyCardPage';

export default WorkspaceExpensifyCardPage;
