import MenuItem from '@components/MenuItem';
import Section from '@components/Section';

import useBankLinkedPersonalCards from '@hooks/useBankLinkedPersonalCards';
import useCardFeedsForActivePolicies from '@hooks/useCardFeedsForActivePolicies';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {hasDisplayableAssignedCards, isDirectFeed} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
// eslint-disable-next-line no-restricted-imports -- the personal card limit is a paid-plan (Collect/Control) entitlement, so this is a billing check
import {getActiveAdminWorkspaces, isPaidGroupPolicy} from '@libs/PolicyUtils';

import PaymentMethodList from '@pages/settings/Wallet/PaymentMethodList';

import {enableCompanyCards} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

import useAssignedCardThreeDotsMenu from './useAssignedCardThreeDotsMenu';

function WalletAssignedCardsSection() {
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['Plus', 'Table']);
    const illustrations = useMemoizedLazyIllustrations(['VerticalCreditCards']);
    const personalCardList = useBankLinkedPersonalCards();
    const {cardFeedsByPolicy} = useCardFeedsForActivePolicies();
    const {cardThreeDotsMenuItems, onAssignedCardPress} = useAssignedCardThreeDotsMenu(allPolicies);

    const hasAssignedCard = hasDisplayableAssignedCards(cardList);
    const paidGroupPolicy = Object.values(allPolicies ?? {}).find(isPaidGroupPolicy);
    const activeAdminPolicies = getActiveAdminWorkspaces(allPolicies, currentUserLogin).sort((a, b) => localeCompare(a.name || '', b.name || ''));
    const sectionRowStyle = shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8;
    const menuItemWrapperStyle = [styles.paymentMethod, shouldUseNarrowLayout ? styles.ph5 : styles.ph8];

    const onAddPersonalCardPress = () => {
        if (!paidGroupPolicy && Object.keys(personalCardList).length >= 2) {
            Navigation.navigate(ROUTES.SETTINGS_WALLET_PERSONAL_CARD_UPGRADE);
            return;
        }
        const hasDirectFeed = Object.values(cardFeedsByPolicy).some((feeds) => feeds.some((feed) => isDirectFeed(feed.feed)));
        if (hasDirectFeed) {
            Navigation.navigate(ROUTES.SETTINGS_WALLET_PERSONAL_CARD_WARNING);
            return;
        }
        Navigation.navigate(ROUTES.SETTINGS_WALLET_PERSONAL_CARD_ADD_NEW);
    };

    const openCompanyCardFlow = () => {
        if (activeAdminPolicies.length === 1) {
            const policy = activeAdminPolicies.at(0);
            const policyID = policy?.id;
            if (!policyID) {
                return;
            }
            if (!policy?.areCompanyCardsEnabled) {
                enableCompanyCards(policyID, true, false);
            }
            Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID));
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACES_LIST.route);
    };

    return (
        <Section
            subtitle={translate('walletPage.assignedCardsDescription')}
            title={translate('walletPage.assignedCards')}
            isCentralPane
            subtitleMuted
            titleStyles={styles.accountSettingsSectionTitle}
        >
            <>
                <PaymentMethodList
                    shouldShowAddBankAccount={false}
                    shouldShowAssignedCards
                    onPress={onAssignedCardPress}
                    threeDotsMenuItems={cardThreeDotsMenuItems}
                    style={[styles.mt5, [sectionRowStyle]]}
                    listItemStyle={shouldUseNarrowLayout ? styles.ph5 : styles.ph8}
                    shouldShowConnectionStatus
                />
                <View style={sectionRowStyle}>
                    <MenuItem
                        onPress={onAddPersonalCardPress}
                        title={translate('personalCard.addPersonalCard')}
                        icon={icons.Plus}
                        wrapperStyle={menuItemWrapperStyle}
                        sentryLabel={CONST.SENTRY_LABEL.SETTINGS_WALLET.ADD_PERSONAL_CARD}
                    />
                </View>
            </>
            <View style={[sectionRowStyle]}>
                <MenuItem
                    title={translate('workspace.companyCards.importTransactions.importButton')}
                    icon={icons.Table}
                    shouldShowRightIcon
                    onPress={() => Navigation.navigate(ROUTES.SETTINGS_WALLET_IMPORT_TRANSACTIONS)}
                    wrapperStyle={menuItemWrapperStyle}
                    sentryLabel={CONST.SENTRY_LABEL.SETTINGS_WALLET.IMPORT_TRANSACTIONS}
                />
            </View>
            {!hasAssignedCard && (
                <View style={[sectionRowStyle]}>
                    <MenuItem
                        iconHeight={40}
                        iconWidth={40}
                        shouldShowRightIcon
                        icon={illustrations.VerticalCreditCards}
                        displayInDefaultIconColor
                        wrapperStyle={menuItemWrapperStyle}
                        title={translate('personalCard.lookingForCompanyCards')}
                        description={translate('personalCard.lookingForCompanyCardsDescription')}
                        titleStyle={styles.textStrong}
                        onPress={openCompanyCardFlow}
                    />
                </View>
            )}
        </Section>
    );
}

export default WalletAssignedCardsSection;
