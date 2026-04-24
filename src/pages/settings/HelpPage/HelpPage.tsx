import React, {useEffect} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsPaidPolicyAdmin from '@hooks/useIsPaidPolicyAdmin';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanelActions from '@hooks/useSidePanelActions';
import useThemeStyles from '@hooks/useThemeStyles';
import {openHelpPage} from '@libs/actions/Help';
import {openExternalLink} from '@libs/actions/Link';
import {navigateToAndOpenReportWithAccountIDs, navigateToConciergeChat} from '@libs/actions/Report';
import getPlatform from '@libs/getPlatform';
import Navigation from '@libs/Navigation/Navigation';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {hasSeenTourSelector} from '@src/selectors/Onboarding';

const isWeb = getPlatform() === CONST.PLATFORM.WEB;

function HelpPage() {
    const icons = useMemoizedLazyExpensifyIcons(['ConciergeAvatar', 'NewWindow', 'Monitor']);
    const illustrations = useMemoizedLazyIllustrations(['Chalkboard', 'LifeRing', 'TopiaryDollarSign']);
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const isPaidPolicyAdmin = useIsPaidPolicyAdmin();
    const accountManagerDetails = account?.accountManagerAccountID ? personalDetails?.[account.accountManagerAccountID] : null;
    const partnerManagerDetails = account?.partnerManagerAccountID ? personalDetails?.[account.partnerManagerAccountID] : null;
    const guideDetails = account?.guideDetails?.email ? getPersonalDetailByEmail(account.guideDetails.email) : null;
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const {openSidePanel} = useSidePanelActions();

    const menuItems = [
        {
            key: 'initialSettingsPage.helpPage.conciergeChat',
            title: translate('initialSettingsPage.helpPage.conciergeChat'),
            description: translate('initialSettingsPage.helpPage.conciergeChatDescription'),
            icon: icons.ConciergeAvatar,
            iconType: CONST.ICON_TYPE_AVATAR,
            onPress: () => (isWeb ? openSidePanel() : navigateToConciergeChat(conciergeReportID, introSelected, currentUserAccountID, isSelfTourViewed, betas)),
            shouldShowRightIcon: true,
            wrapperStyle: [styles.sectionMenuItemTopDescription],
            sentryLabel: CONST.SENTRY_LABEL.SETTINGS_HELP.CONCIERGE_CHAT,
        },
        ...(accountManagerDetails && isPaidPolicyAdmin
            ? [
                  {
                      key: accountManagerDetails.login,
                      title: accountManagerDetails.displayName,
                      description: translate('initialSettingsPage.helpPage.accountManagerDescription'),
                      icon: accountManagerDetails.avatar,
                      iconType: CONST.ICON_TYPE_AVATAR,
                      onPress: () => navigateToAndOpenReportWithAccountIDs([accountManagerDetails.accountID], currentUserAccountID, introSelected, isSelfTourViewed, betas),
                      shouldShowRightIcon: true,
                      wrapperStyle: [styles.sectionMenuItemTopDescription],
                      sentryLabel: CONST.SENTRY_LABEL.SETTINGS_HELP.ACCOUNT_MANAGER,
                  },
              ]
            : []),
        ...(partnerManagerDetails && isPaidPolicyAdmin
            ? [
                  {
                      key: partnerManagerDetails.login,
                      title: partnerManagerDetails.displayName,
                      description: translate('initialSettingsPage.helpPage.partnerManagerDescription'),
                      icon: partnerManagerDetails.avatar,
                      iconType: CONST.ICON_TYPE_AVATAR,
                      onPress: () => navigateToAndOpenReportWithAccountIDs([partnerManagerDetails.accountID], currentUserAccountID, introSelected, isSelfTourViewed, betas),
                      shouldShowRightIcon: true,
                      wrapperStyle: [styles.sectionMenuItemTopDescription],
                      sentryLabel: CONST.SENTRY_LABEL.SETTINGS_HELP.PARTNER_MANAGER,
                  },
              ]
            : []),
        ...(guideDetails && isPaidPolicyAdmin
            ? [
                  {
                      key: guideDetails.login,
                      title: guideDetails.displayName,
                      description: translate('initialSettingsPage.helpPage.guideDescription'),
                      icon: guideDetails.avatar,
                      iconType: CONST.ICON_TYPE_AVATAR,
                      onPress: () => navigateToAndOpenReportWithAccountIDs([guideDetails.accountID], currentUserAccountID, introSelected, isSelfTourViewed, betas),
                      shouldShowRightIcon: true,
                      wrapperStyle: [styles.sectionMenuItemTopDescription],
                      sentryLabel: CONST.SENTRY_LABEL.SETTINGS_HELP.GUIDE,
                  },
              ]
            : []),
        {
            key: 'initialSettingsPage.helpPage.helpSite',
            title: translate('initialSettingsPage.helpPage.helpSite'),
            icon: illustrations.Chalkboard,
            iconType: CONST.ICON_TYPE_AVATAR,
            iconRight: icons.NewWindow,
            onPress: () => openExternalLink(CONST.NEWHELP_URL),
            shouldShowRightIcon: true,
            wrapperStyle: [styles.sectionMenuItemTopDescription],
            link: CONST.NEWHELP_URL,
            sentryLabel: CONST.SENTRY_LABEL.SETTINGS_HELP.HELP_DOCS,
        },
    ];

    useEffect(() => {
        openHelpPage();
    }, []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
            testID="HelpPage"
        >
            <HeaderWithBackButton
                title={translate('common.help')}
                icon={illustrations.LifeRing}
                shouldUseHeadlineHeader
                shouldShowBackButton={shouldUseNarrowLayout}
                shouldDisplaySearchRouter
                shouldDisplayHelpButton
                onBackButtonPress={Navigation.goBack}
            />
            <ScrollView contentContainerStyle={styles.pt3}>
                <View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <Section
                        title={translate('initialSettingsPage.helpPage.title')}
                        subtitle={translate('initialSettingsPage.helpPage.description')}
                        titleStyles={styles.accountSettingsSectionTitle}
                        subtitleMuted
                        isCentralPane
                        illustrationContainerStyle={styles.cardSectionIllustrationContainer}
                        illustrationBackgroundColor={colors.ice800}
                        illustration={illustrations.TopiaryDollarSign}
                        illustrationStyle={styles.helpStaticIllustration}
                    >
                        <View style={[styles.flex1, styles.mt5]}>
                            <MenuItemList
                                menuItems={menuItems}
                                shouldUseSingleExecution
                            />
                        </View>
                    </Section>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default HelpPage;
