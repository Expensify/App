import type {StackScreenProps} from '@react-navigation/stack';
import React, {useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CardUtils from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import * as CompanyCards from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceCompanyCardsSettingsPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_SETTINGS>;

function WorkspaceCompanyCardsSettingsPage({
    route: {
        params: {policyID},
    },
}: WorkspaceCompanyCardsSettingsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policy = usePolicy(policyID);
    const workspaceAccountID = policy?.workspaceAccountID ?? -1;
    const [deleteCompanyCardConfirmModalVisible, setDeleteCompanyCardConfirmModalVisible] = useState(false);

    const [cardFeeds] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`);
    const [lastSelectedFeed] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`);
    const selectedFeed = CardUtils.getSelectedFeed(lastSelectedFeed, cardFeeds);
    const feedName = cardFeeds?.settings?.companyCardNicknames?.[selectedFeed] ?? '';
    const liabilityType = cardFeeds?.settings?.companyCards?.[selectedFeed]?.liabilityType;
    const isPersonal = liabilityType === CONST.COMPANY_CARDS.DELETE_TRANSACTIONS.ALLOW;

    const navigateToChangeFeedName = () => {
        Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_SETTINGS_FEED_NAME.getRoute(policyID));
    };

    const deleteCompanyCardFeed = () => {
        CompanyCards.deleteWorkspaceCompanyCardFeed(policyID, workspaceAccountID, selectedFeed);
        setDeleteCompanyCardConfirmModalVisible(false);
        Navigation.setNavigationActionToMicrotaskQueue(Navigation.goBack);
    };

    const onToggleLiability = (isOn: boolean) => {
        CompanyCards.setWorkspaceCompanyCardTransactionLiability(
            workspaceAccountID,
            policyID,
            selectedFeed,
            isOn ? CONST.COMPANY_CARDS.DELETE_TRANSACTIONS.ALLOW : CONST.COMPANY_CARDS.DELETE_TRANSACTIONS.RESTRICT,
        );
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
        >
            <ScreenWrapper
                testID={WorkspaceCompanyCardsSettingsPage.displayName}
                style={styles.defaultModalContainer}
            >
                <ScrollView contentContainerStyle={styles.flexGrow1}>
                    <HeaderWithBackButton title={translate('common.settings')} />
                    <View style={styles.flex1}>
                        <MenuItemWithTopDescription
                            shouldShowRightIcon
                            title={feedName}
                            description={translate('workspace.moreFeatures.companyCards.cardFeedName')}
                            style={[styles.moneyRequestMenuItem]}
                            titleStyle={styles.flex1}
                            onPress={navigateToChangeFeedName}
                        />
                        <View style={[styles.mv3, styles.mh5]}>
                            <ToggleSettingOptionRow
                                title={translate('workspace.moreFeatures.companyCards.personal')}
                                switchAccessibilityLabel={translate('workspace.moreFeatures.companyCards.personal')}
                                onToggle={onToggleLiability}
                                isActive={isPersonal}
                            />
                            <Text style={[styles.mutedTextLabel, styles.mt2]}>{translate('workspace.moreFeatures.companyCards.setTransactionLiabilityDescription')}</Text>
                        </View>
                        <MenuItem
                            icon={Expensicons.Trashcan}
                            title={translate('workspace.moreFeatures.companyCards.removeCardFeed')}
                            onPress={() => setDeleteCompanyCardConfirmModalVisible(true)}
                        />
                    </View>
                    <ConfirmModal
                        isVisible={deleteCompanyCardConfirmModalVisible}
                        onConfirm={deleteCompanyCardFeed}
                        onCancel={() => setDeleteCompanyCardConfirmModalVisible(false)}
                        title={translate('workspace.moreFeatures.companyCards.removeCardFeedTitle', {feedName})}
                        prompt={translate('workspace.moreFeatures.companyCards.removeCardFeedDescription')}
                        confirmText={translate('common.delete')}
                        cancelText={translate('common.cancel')}
                        danger
                    />
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceCompanyCardsSettingsPage.displayName = 'WorkspaceCompanyCardsSettingsPage';

export default WorkspaceCompanyCardsSettingsPage;
