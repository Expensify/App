import React, {useEffect} from 'react';
import {View} from 'react-native';
import AccountManagerBookCallButton from '@components/AccountManagerBookCallButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsPaidPolicyAdmin from '@hooks/useIsPaidPolicyAdmin';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useOpenConciergeAnywhere from '@hooks/useOpenConciergeAnywhere';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import {openHelpPage} from '@libs/actions/Help';
import {openExternalLink} from '@libs/actions/Link';
import {navigateToAndOpenReportWithAccountIDs} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {hasSeenTourSelector} from '@src/selectors/Onboarding';

function HelpPage() {
    const icons = useMemoizedLazyExpensifyIcons(['ConciergeAvatar', 'NewWindow', 'Monitor']);
    const illustrations = useMemoizedLazyIllustrations(['Chalkboard', 'LifeRing', 'TopiaryDollarSign']);
    const themeIllustrations = useThemeIllustrations();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const isPaidPolicyAdmin = useIsPaidPolicyAdmin();
    const isApprovedAccountant = !!account?.isApprovedAccountant;
    const accountManagerDetails = account?.accountManagerAccountID ? personalDetails?.[account.accountManagerAccountID] : null;
    const partnerManagerDetails = account?.partnerManagerAccountID ? personalDetails?.[account.partnerManagerAccountID] : null;
    const guideDetails = account?.guideDetails?.email ? getPersonalDetailByEmail(account.guideDetails.email) : null;
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const {openConciergeAnywhere} = useOpenConciergeAnywhere();

    const partnerManagerItem = partnerManagerDetails
        ? {
              key: partnerManagerDetails.login,
              title: partnerManagerDetails.displayName,
              description: isApprovedAccountant ? translate('initialSettingsPage.helpPage.partnerManagerDescription') : undefined,
              icon: partnerManagerDetails.avatar,
              iconType: CONST.ICON_TYPE_AVATAR,
              onPress: () => navigateToAndOpenReportWithAccountIDs([partnerManagerDetails.accountID], currentUserAccountID, introSelected, isSelfTourViewed, betas, personalDetails),
              shouldShowRightIcon: true,
              wrapperStyle: [styles.sectionMenuItemTopDescription],
              sentryLabel: CONST.SENTRY_LABEL.SETTINGS_HELP.PARTNER_MANAGER,
          }
        : null;

    const guideItem = guideDetails
        ? {
              key: guideDetails.login,
              title: guideDetails.displayName,
              description: isApprovedAccountant ? translate('initialSettingsPage.helpPage.accountExecutiveDescription') : undefined,
              icon: guideDetails.avatar,
              iconType: CONST.ICON_TYPE_AVATAR,
              onPress: () => navigateToAndOpenReportWithAccountIDs([guideDetails.accountID], currentUserAccountID, introSelected, isSelfTourViewed, betas, personalDetails),
              shouldShowRightIcon: true,
              wrapperStyle: [styles.sectionMenuItemTopDescription],
              sentryLabel: CONST.SENTRY_LABEL.SETTINGS_HELP.GUIDE,
          }
        : null;

    const accountManagerCalendarLink = account?.accountManagerCalendarLink;
    const accountManagerItem = accountManagerDetails
        ? {
              key: accountManagerDetails.login,
              title: accountManagerDetails.displayName,
              description: isApprovedAccountant ? translate('initialSettingsPage.helpPage.accountManagerDescription') : undefined,
              icon: accountManagerDetails.avatar,
              iconType: CONST.ICON_TYPE_AVATAR,
              onPress: () => navigateToAndOpenReportWithAccountIDs([accountManagerDetails.accountID], currentUserAccountID, introSelected, isSelfTourViewed, betas, personalDetails),
              shouldShowRightIcon: !accountManagerCalendarLink,
              shouldShowRightComponent: !!accountManagerCalendarLink,
              rightComponent: accountManagerCalendarLink ? <AccountManagerBookCallButton calendarLink={accountManagerCalendarLink} /> : undefined,
              wrapperStyle: [styles.sectionMenuItemTopDescription],
              sentryLabel: CONST.SENTRY_LABEL.SETTINGS_HELP.ACCOUNT_MANAGER,
          }
        : null;

    const hasActiveItem = !!partnerManagerItem || !!guideItem || !!accountManagerItem;

    const conciergeItem = {
        key: 'initialSettingsPage.helpPage.conciergeChat',
        title: translate('initialSettingsPage.helpPage.conciergeChat'),
        description: hasActiveItem ? undefined : translate('initialSettingsPage.helpPage.conciergeChatDescription'),
        icon: icons.ConciergeAvatar,
        iconType: CONST.ICON_TYPE_AVATAR,
        onPress: openConciergeAnywhere,
        shouldShowRightIcon: true,
        wrapperStyle: [styles.sectionMenuItemTopDescription],
        sentryLabel: CONST.SENTRY_LABEL.SETTINGS_HELP.CONCIERGE_CHAT,
    };

    const helpSiteItem = {
        key: 'initialSettingsPage.helpPage.helpSite',
        title: translate('initialSettingsPage.helpPage.helpSite'),
        description: translate('initialSettingsPage.helpPage.helpSiteDescription'),
        icon: illustrations.Chalkboard,
        iconType: CONST.ICON_TYPE_AVATAR,
        iconRight: icons.NewWindow,
        onPress: () => openExternalLink(CONST.NEWHELP_URL),
        shouldShowRightIcon: true,
        wrapperStyle: [styles.sectionMenuItemTopDescription],
        link: CONST.NEWHELP_URL,
        sentryLabel: CONST.SENTRY_LABEL.SETTINGS_HELP.HELP_DOCS,
    };

    const moreResourcesItems = hasActiveItem ? [helpSiteItem] : [conciergeItem, helpSiteItem];

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
                        title={translate(isApprovedAccountant ? 'initialSettingsPage.helpPage.approvedPartnerTeamTitle' : 'initialSettingsPage.helpPage.title')}
                        subtitle={translate(isApprovedAccountant ? 'initialSettingsPage.helpPage.approvedPartnerTeamDescription' : 'initialSettingsPage.helpPage.description')}
                        titleStyles={styles.accountSettingsSectionTitle}
                        subtitleMuted
                        isCentralPane
                        illustrationContainerStyle={styles.cardSectionIllustrationContainer}
                        illustrationBackgroundColor={colors.ice800}
                        illustration={isApprovedAccountant ? themeIllustrations.ExpensifyApprovedBadge : illustrations.TopiaryDollarSign}
                        illustrationStyle={styles.helpStaticIllustration}
                    >
                        {isApprovedAccountant ? (
                            <>
                                <View style={[styles.flex1, styles.mt8, styles.gap5]}>
                                    {hasActiveItem && (
                                        <View>
                                            <Text style={[styles.textLabelSupportingNormal]}>{translate('initialSettingsPage.helpPage.conciergeChatDescription')}</Text>
                                            <MenuItemList
                                                menuItems={[conciergeItem]}
                                                shouldUseSingleExecution
                                            />
                                        </View>
                                    )}
                                    {!!partnerManagerItem && (
                                        <View>
                                            <Text style={[styles.textLabelSupportingNormal, styles.mb2]}>{translate('initialSettingsPage.helpPage.partnerManager')}</Text>
                                            <MenuItemList
                                                menuItems={[partnerManagerItem]}
                                                shouldUseSingleExecution
                                            />
                                        </View>
                                    )}
                                    {!!guideItem && (
                                        <View>
                                            <Text style={[styles.textLabelSupportingNormal, styles.mb2]}>{translate('initialSettingsPage.helpPage.accountExecutive')}</Text>
                                            <MenuItemList
                                                menuItems={[guideItem]}
                                                shouldUseSingleExecution
                                            />
                                        </View>
                                    )}
                                    {!!accountManagerItem && (
                                        <View>
                                            <Text style={[styles.textLabelSupportingNormal, styles.mb2]}>{translate('initialSettingsPage.helpPage.accountManager')}</Text>
                                            <MenuItemList
                                                menuItems={[accountManagerItem]}
                                                shouldUseSingleExecution
                                            />
                                        </View>
                                    )}
                                </View>
                                {hasActiveItem && <Text style={[styles.textLabelSupportingNormal, styles.mt5, styles.mb2]}>{translate('initialSettingsPage.helpPage.moreResources')}</Text>}
                                <MenuItemList
                                    menuItems={moreResourcesItems}
                                    shouldUseSingleExecution
                                />
                            </>
                        ) : (
                            <>
                                <View style={[styles.flex1, styles.mt8, styles.gap5]}>
                                    {hasActiveItem && (
                                        <View>
                                            <Text style={[styles.textLabelSupportingNormal]}>{translate('initialSettingsPage.helpPage.conciergeChatDescription')}</Text>
                                            <MenuItemList
                                                menuItems={[conciergeItem]}
                                                shouldUseSingleExecution
                                            />
                                        </View>
                                    )}
                                    {!!partnerManagerItem && isPaidPolicyAdmin && (
                                        <View>
                                            <Text style={[styles.textLabelSupportingNormal]}>{translate('initialSettingsPage.helpPage.yourPartnerManager')}</Text>
                                            <MenuItemList
                                                menuItems={[partnerManagerItem]}
                                                shouldUseSingleExecution
                                            />
                                        </View>
                                    )}
                                    {!!guideItem && isPaidPolicyAdmin && (
                                        <View>
                                            <Text style={[styles.textLabelSupportingNormal]}>{translate('initialSettingsPage.helpPage.guideDescription')}</Text>
                                            <MenuItemList
                                                menuItems={[guideItem]}
                                                shouldUseSingleExecution
                                            />
                                        </View>
                                    )}
                                    {!!accountManagerItem && isPaidPolicyAdmin && (
                                        <View>
                                            <Text style={[styles.textLabelSupportingNormal]}>{translate('initialSettingsPage.helpPage.yourAccountManager')}</Text>
                                            <MenuItemList
                                                menuItems={[accountManagerItem]}
                                                shouldUseSingleExecution
                                            />
                                        </View>
                                    )}
                                </View>
                                {hasActiveItem && <Text style={[styles.textLabelSupportingNormal, styles.mt5, styles.mb2]}>{translate('initialSettingsPage.helpPage.moreResources')}</Text>}
                                <MenuItemList
                                    menuItems={moreResourcesItems}
                                    shouldUseSingleExecution
                                />
                            </>
                        )}
                    </Section>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default HelpPage;
