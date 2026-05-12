import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemList from '@components/MenuItemList';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import PaymentCardDetails from '@components/PaymentCardDetails';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import SectionSubtitleHTML from '@components/SectionSubtitleHTML';
import useConfirmModal from '@hooks/useConfirmModal';
import useDocumentTitle from '@hooks/useDocumentTitle';
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
import {openSaveTheWorldPage, updatePersonalKarma} from '@userActions/Subscription';
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
    useDocumentTitle(translate('sidebarScreen.saveTheWorld'));
    const theme = useTheme();
    const {isActingAsDelegate} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const illustrations = useMemoizedLazyIllustrations(['TeachersUnite']);
    const [personalOffsetsEnabled = false] = useOnyx(ONYXKEYS.NVP_PERSONAL_OFFSETS);
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID);
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);
    const [isPendingUpdatePersonalKarma = false] = useOnyx(ONYXKEYS.IS_PENDING_UPDATE_PERSONAL_KARMA);
    const {showConfirmModal} = useConfirmModal();
    const pendingPersonalKarmaEnableRef = useRef(false);
    const saveTheWorldIllustration = useSaveTheWorldSectionIllustration();
    const personalKarmaTitle = translate('teachersUnitePage.personalKarma.title');
    const personalKarmaDescription = translate('teachersUnitePage.personalKarma.description');
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

    useEffect(() => {
        openSaveTheWorldPage();
    }, []);

    const isFocused = useIsFocused();

    useEffect(() => {
        if (!isFocused || !pendingPersonalKarmaEnableRef.current) {
            return;
        }

        pendingPersonalKarmaEnableRef.current = false;

        if (billingCard) {
            updatePersonalKarma(true);
        }
    }, [isFocused, billingCard]);

    const handlePersonalKarmaToggle = () => {
        if (isActingAsDelegate) {
            showDelegateNoAccessModal();
            return;
        }
        if (personalOffsetsEnabled) {
            showConfirmModal({
                title: personalKarmaTitle,
                prompt: personalKarmaStopDonationsPrompt,
                confirmText: translate('common.disable'),
                cancelText: translate('common.cancel'),
                danger: true,
            }).then(({action}) => {
                if (action !== ModalActions.CONFIRM) {
                    return;
                }
                updatePersonalKarma(false);
            });
            return;
        }

        if (!billingCard) {
            pendingPersonalKarmaEnableRef.current = true;
            Navigation.navigate(ROUTES.SETTINGS_SAVE_THE_WORLD_ADD_PAYMENT_CARD);
            return;
        }
        updatePersonalKarma(true);
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
                            pendingAction={isPendingUpdatePersonalKarma ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : undefined}
                            disabled={isPendingUpdatePersonalKarma}
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
        </ScreenWrapper>
    );
}

export default SaveTheWorldPage;
