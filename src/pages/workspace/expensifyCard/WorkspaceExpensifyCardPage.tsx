import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {ActivityIndicator} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {FullScreenNavigatorParamList} from '@libs/Navigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import WorkspaceExpensifyCardListPage from './WorkspaceExpensifyCardListPage';
import WorkspaceExpensifyCardPageEmptyState from './WorkspaceExpensifyCardPageEmptyState';

type WorkspaceExpensifyCardPageProps = PlatformStackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD>;

function WorkspaceExpensifyCardPage({route}: WorkspaceExpensifyCardPageProps) {
    const policyID = route.params.policyID ?? '-1';
    const workspaceAccountID = PolicyUtils.getWorkspaceAccountID(policyID);

    const styles = useThemeStyles();
    const theme = useTheme();
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}`);
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`);

    const fetchExpensifyCards = useCallback(() => {
        Policy.openPolicyExpensifyCardsPage(policyID, workspaceAccountID);
    }, [policyID, workspaceAccountID]);

    const {isOffline} = useNetwork({onReconnect: fetchExpensifyCards});

    useFocusEffect(fetchExpensifyCards);

    const paymentBankAccountID = cardSettings?.paymentBankAccountID ?? 0;
    const isLoading = !isOffline && (!cardSettings || (cardSettings.isLoading && !cardsList));

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
        >
            {isLoading && (
                <ActivityIndicator
                    size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                    style={styles.flex1}
                    color={theme.spinner}
                />
            )}
            {!!paymentBankAccountID && !isLoading && (
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
