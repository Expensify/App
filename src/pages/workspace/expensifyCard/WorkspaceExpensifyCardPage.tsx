import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {ActivityIndicator} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
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
    const styles = useThemeStyles();
    const theme = useTheme();
    const defaultFundID = useDefaultFundID(policyID);

    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${defaultFundID}`);
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${defaultFundID}_${CONST.EXPENSIFY_CARD.BANK}`, {selector: filterInactiveCards});

    const fetchExpensifyCards = useCallback(() => {
        openPolicyExpensifyCardsPage(policyID, defaultFundID);
    }, [policyID, defaultFundID]);

    const {isOffline} = useNetwork({onReconnect: fetchExpensifyCards});

    useFocusEffect(fetchExpensifyCards);

    const paymentBankAccountID = cardSettings?.paymentBankAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const isLoading = !isOffline && (!cardSettings || cardSettings.isLoading);

    const renderContent = () => {
        if (!!isLoading && !paymentBankAccountID && !defaultFundID) {
            return (
                <ActivityIndicator
                    size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                    style={styles.flex1}
                    color={theme.spinner}
                />
            );
        }
        if (!!paymentBankAccountID || defaultFundID) {
            return (
                <WorkspaceExpensifyCardListPage
                    cardsList={cardsList}
                    fundID={defaultFundID}
                    route={route}
                />
            );
        }
        if (!paymentBankAccountID && !isLoading) {
            return <WorkspaceExpensifyCardPageEmptyState route={route} />;
        }
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
        >
            {renderContent()}
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceExpensifyCardPage.displayName = 'WorkspaceExpensifyCardPage';

export default WorkspaceExpensifyCardPage;
