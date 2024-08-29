import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Policy from '@libs/actions/Policy/Policy';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
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

    // TODO: use data form onyx instead of mocked one when API is implemented
    const [cardFeeds] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`);
    // const [lastSelectedFeed] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`);
    const lastSelectedFeed = 'cdfbmo';
    const feedName = cardFeeds?.companyCardNicknames[lastSelectedFeed] ?? '';
    const liabilityType = cardFeeds?.companyCards[lastSelectedFeed]?.liabilityType;
    const isPersonal = liabilityType === CONST.COMPANY_CARDS.DELETE_TRANSACTIONS.ALLOW;
    const liabilityTypeTitle = isPersonal ? translate('workspace.moreFeatures.companyCards.personal') : translate('workspace.moreFeatures.companyCards.corporate');

    const menuItems = useMemo(
        () => [
            {
                title: feedName,
                description: translate('workspace.moreFeatures.companyCards.cardFeedName'),
                action: () => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_SETTINGS_FEED_NAME.getRoute(policyID)),
            },
            {
                title: !liabilityType ? undefined : liabilityTypeTitle,
                description: translate('workspace.moreFeatures.companyCards.cardFeedTransaction'),
                action: () => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_SETTINGS_TRANSACTION_LIABILITY.getRoute(policyID)),
            },
        ],
        [feedName, translate, liabilityType, liabilityTypeTitle, policyID],
    );

    const deleteCompanyCardFeed = () => {
        Policy.deleteWorkspaceCompanyCardFeed(policyID, workspaceAccountID, lastSelectedFeed);
        Navigation.goBack();
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
                        {menuItems.map((item) => (
                            <MenuItemWithTopDescription
                                key={item.description}
                                shouldShowRightIcon
                                title={item.title}
                                description={item.description}
                                style={[styles.moneyRequestMenuItem]}
                                titleStyle={styles.flex1}
                                onPress={item.action}
                            />
                        ))}
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
