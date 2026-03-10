import React, {useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import PaymentCardDetails from '@components/PaymentCardDetails';
import ConfirmModal from '@components/ConfirmModal';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import SectionSubtitleHTML from '@components/SectionSubtitleHTML';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import Navigation from '@libs/Navigation/Navigation';
import {getCardForSubscriptionBilling} from '@libs/SubscriptionUtils';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {updatePersonalKarma} from '@userActions/Subscription';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import useSaveTheWorldSectionIllustration from './useSaveTheWorldSectionIllustration';

function SaveTheWorldPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const waitForNavigate = useWaitForNavigation();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const theme = useTheme();
    const {isActingAsDelegate} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const illustrations = useMemoizedLazyIllustrations(['TeachersUnite']);
    const [personalOffsetsEnabled = false] = useOnyx(ONYXKEYS.NVP_PERSONAL_OFFSETS);
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID);
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);
    const [isDisablePersonalKarmaModalVisible, setIsDisablePersonalKarmaModalVisible] = useState(false);
    const [isAddPaymentCardModalVisible, setIsAddPaymentCardModalVisible] = useState(false);
    const shouldRevertPersonalKarmaOnAddCardModalHideRef = useRef(false);
    const saveTheWorldIllustration = useSaveTheWorldSectionIllustration();
    const personalKarmaTitle = translate('teachersUnitePage.personalKarma.title');
    const personalKarmaDescription = translate('teachersUnitePage.personalKarma.description');
    const personalKarmaAddPaymentCardPrompt = translate('teachersUnitePage.personalKarma.addPaymentCardPrompt');
    const personalKarmaStopDonationsPrompt = translate('teachersUnitePage.personalKarma.stopDonationsPrompt');
    const billingCard = useMemo(() => {
        const userBillingCard = userBillingFundID ? fundList?.[`${userBillingFundID}`] : undefined;
        if (userBillingCard?.accountData) {
            return userBillingCard;
        }

        return getCardForSubscriptionBilling(fundList);
    }, [fundList, userBillingFundID]);
    const menuItems = useMemo(() => {
        const baseMenuItems = [
            {
                translationKey: 'teachersUnitePage.iKnowATeacher',
                action: waitForNavigate(() => Navigation.navigate(ROUTES.I_KNOW_A_TEACHER)),
                sentryLabel: CONST.SENTRY_LABEL.SETTINGS_TEACHERS_UNITE.I_KNOW_A_TEACHER,
            },
            {
                translationKey: 'teachersUnitePage.iAmATeacher',
                action: waitForNavigate(() => Navigation.navigate(ROUTES.I_AM_A_TEACHER)),
                sentryLabel: CONST.SENTRY_LABEL.SETTINGS_TEACHERS_UNITE.I_AM_A_TEACHER,
            },
        ];

        return baseMenuItems.map((item) => ({
            key: item.translationKey,
            title: translate(item.translationKey as TranslationPaths),
            onPress: item.action,
            shouldShowRightIcon: true,
            link: '',
            wrapperStyle: [styles.sectionMenuItemTopDescription],
            sentryLabel: item.sentryLabel,
        }));
    }, [translate, waitForNavigate, styles]);

    const handleDisablePersonalKarma = () => {
        setIsDisablePersonalKarmaModalVisible(false);
        updatePersonalKarma(false);
    };

    const openAddPaymentCardPage = () => {
        shouldRevertPersonalKarmaOnAddCardModalHideRef.current = false;
        setIsAddPaymentCardModalVisible(false);
        Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_ADD_PAYMENT_CARD);
    };

    const closeAddPaymentCardModal = () => {
        setIsAddPaymentCardModalVisible(false);
    };

    const handleAddPaymentCardModalHide = () => {
        if (!shouldRevertPersonalKarmaOnAddCardModalHideRef.current) {
            return;
        }
        shouldRevertPersonalKarmaOnAddCardModalHideRef.current = false;
        updatePersonalKarma(false);
    };

    const handlePersonalKarmaToggle = () => {
        if (isActingAsDelegate) {
            showDelegateNoAccessModal();
            return;
        }
        if (personalOffsetsEnabled) {
            setIsDisablePersonalKarmaModalVisible(true);
            return;
        }

        updatePersonalKarma(true);
        if (!billingCard) {
            shouldRevertPersonalKarmaOnAddCardModalHideRef.current = true;
            setIsAddPaymentCardModalVisible(true);
        }
    };

    return (
        <ScreenWrapper
            testID="SaveTheWorldPage"
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                title={translate('sidebarScreen.saveTheWorld')}
                shouldShowBackButton={shouldUseNarrowLayout}
                shouldDisplaySearchRouter
                shouldDisplayHelpButton
                onBackButtonPress={Navigation.goBack}
                icon={illustrations.TeachersUnite}
                shouldUseHeadlineHeader
            />
            <ScrollView contentContainerStyle={styles.pt3}>
                <View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <Section
                        title={translate('teachersUnitePage.teachersUnite')}
                        subtitle={translate('teachersUnitePage.joinExpensifyOrg')}
                        isCentralPane
                        subtitleMuted
                        illustrationContainerStyle={styles.cardSectionIllustrationContainer}
                        illustrationBackgroundColor={theme.PAGE_THEMES[SCREENS.SAVE_THE_WORLD.ROOT].backgroundColor}
                        titleStyles={styles.accountSettingsSectionTitle}
                        childrenStyles={styles.pt5}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...saveTheWorldIllustration}
                    >
                        <MenuItemList
                            menuItems={menuItems}
                            shouldUseSingleExecution
                        />
                    </Section>
                    <Section
                        title={personalKarmaTitle}
                        subtitleMuted
                        renderSubtitle={() => (
                            <SectionSubtitleHTML
                                html={`${personalKarmaDescription} <a href="${CONST.PERSONAL_AND_CORPORATE_KARMA_HELP_URL}">${translate('common.learnMore')}</a>.`}
                                subtitleMuted
                            />
                        )}
                        isCentralPane
                        titleStyles={styles.accountSettingsSectionTitle}
                    >
                        <ToggleSettingOptionRow
                            title={personalKarmaTitle}
                            switchAccessibilityLabel={personalKarmaTitle}
                            onToggle={handlePersonalKarmaToggle}
                            isActive={personalOffsetsEnabled}
                            wrapperStyle={styles.mt8}
                        />
                        {personalOffsetsEnabled && (
                            <PaymentCardDetails
                                card={billingCard}
                                wrapperStyle={styles.mt8}
                            />
                        )}
                    </Section>
                </View>
            </ScrollView>
            <ConfirmModal
                title={personalKarmaTitle}
                isVisible={isAddPaymentCardModalVisible}
                onConfirm={openAddPaymentCardPage}
                onCancel={closeAddPaymentCardModal}
                onModalHide={handleAddPaymentCardModalHide}
                prompt={personalKarmaAddPaymentCardPrompt}
                confirmText={translate('subscription.cardSection.addCardButton')}
                cancelText={translate('common.cancel')}
            />
            <ConfirmModal
                title={personalKarmaTitle}
                isVisible={isDisablePersonalKarmaModalVisible}
                onConfirm={handleDisablePersonalKarma}
                onCancel={() => setIsDisablePersonalKarmaModalVisible(false)}
                prompt={personalKarmaStopDonationsPrompt}
                confirmText={translate('common.disable')}
                cancelText={translate('common.cancel')}
                danger
            />
        </ScreenWrapper>
    );
}

export default SaveTheWorldPage;
