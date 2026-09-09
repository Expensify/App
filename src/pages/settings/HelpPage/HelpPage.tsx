import BookCallButton from '@components/BookCallButton';
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
import usePersonalDetailByLogin from '@hooks/usePersonalDetailByLogin';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';

import {openHelpPage} from '@libs/actions/Help';
import {openExternalLink} from '@libs/actions/Link';
import {navigateToAndOpenReportWithAccountIDs} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';

import colors from '@styles/theme/colors';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {guidedSetupAndTourStatusSelector} from '@src/selectors/Onboarding';
import type {PersonalDetails} from '@src/types/onyx';

import React, {useEffect} from 'react';
import {View} from 'react-native';

/**
 * Whether the given personal details resolve to Concierge. Concierge is already rendered as its own dedicated
 * button on the Help page, so any guide / account manager / partner manager slot that resolves to Concierge
 * should be hidden to avoid showing Concierge twice.
 */
function isConciergePersonalDetail(details: PersonalDetails | null | undefined): boolean {
    return details?.accountID === CONST.ACCOUNT_ID.CONCIERGE || details?.login?.toLowerCase() === CONST.EMAIL.CONCIERGE;
}

function HelpPage() {
    const icons = useMemoizedLazyExpensifyIcons(['ConciergeAvatar', 'NewWindow', 'Monitor']);
    const illustrations = useMemoizedLazyIllustrations(['Chalkboard', 'TopiaryDollarSign']);
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
    const guideDetails = usePersonalDetailByLogin(account?.guideDetails?.email);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [guidedSetupAndTourStatus] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: guidedSetupAndTourStatusSelector});
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const {openConciergeAnywhere} = useOpenConciergeAnywhere();

    // Remove the row's accessibility grouping so native (iOS/Android) screen readers can announce the nested
    // Book a call button as its own element; on web this prop is a no-op and the button is reached via keyboard Tab instead
    const shouldBeAccessibleWithBookCallButton = (calendarLink: string | undefined) => !calendarLink;

    const partnerManagerCalendarLink = account?.partnerManagerCalendarLink;
    const partnerManagerItem =
        partnerManagerDetails && !isConciergePersonalDetail(partnerManagerDetails)
            ? {
                  key: partnerManagerDetails.login,
                  title: partnerManagerDetails.displayName,
                  description: isApprovedAccountant ? translate('initialSettingsPage.helpPage.partnerManagerDescription') : undefined,
                  icon: partnerManagerDetails.avatar,
                  iconType: CONST.ICON_TYPE_AVATAR,
                  onPress: () =>
                      navigateToAndOpenReportWithAccountIDs(
                          [partnerManagerDetails.accountID],
                          currentUserAccountID,
                          introSelected,
                          guidedSetupAndTourStatus?.isSelfTourViewed,
                          guidedSetupAndTourStatus?.hasCompletedGuidedSetupFlow,
                          betas,
                          personalDetails,
                          conciergeChat,
                      ),
                  shouldShowRightIcon: !partnerManagerCalendarLink,
                  shouldShowRightComponent: !!partnerManagerCalendarLink,
                  shouldBeAccessible: shouldBeAccessibleWithBookCallButton(partnerManagerCalendarLink),
                  rightComponent: partnerManagerCalendarLink ? (
                      <BookCallButton
                          calendarLink={partnerManagerCalendarLink}
                          isNested
                      />
                  ) : undefined,
                  wrapperStyle: [styles.sectionMenuItemTopDescription],
                  sentryLabel: CONST.SENTRY_LABEL.SETTINGS_HELP.PARTNER_MANAGER,
              }
            : null;

    const guideCalendarLink = account?.guideDetails?.calendarLink;
    const guideItem =
        guideDetails && !isConciergePersonalDetail(guideDetails)
            ? {
                  key: guideDetails.login,
                  title: guideDetails.displayName,
                  description: isApprovedAccountant ? translate('initialSettingsPage.helpPage.accountExecutiveDescription') : undefined,
                  icon: guideDetails.avatar,
                  iconType: CONST.ICON_TYPE_AVATAR,
                  onPress: () =>
                      navigateToAndOpenReportWithAccountIDs(
                          [guideDetails.accountID],
                          currentUserAccountID,
                          introSelected,
                          guidedSetupAndTourStatus?.isSelfTourViewed,
                          guidedSetupAndTourStatus?.hasCompletedGuidedSetupFlow,
                          betas,
                          personalDetails,
                          conciergeChat,
                      ),
                  shouldShowRightIcon: !guideCalendarLink,
                  shouldShowRightComponent: !!guideCalendarLink,
                  shouldBeAccessible: shouldBeAccessibleWithBookCallButton(guideCalendarLink),
                  rightComponent: guideCalendarLink ? (
                      <BookCallButton
                          calendarLink={guideCalendarLink}
                          isNested
                      />
                  ) : undefined,
                  wrapperStyle: [styles.sectionMenuItemTopDescription],
                  sentryLabel: CONST.SENTRY_LABEL.SETTINGS_HELP.GUIDE,
              }
            : null;

    const accountManagerCalendarLink = account?.accountManagerCalendarLink;
    const accountManagerItem =
        accountManagerDetails && !isConciergePersonalDetail(accountManagerDetails)
            ? {
                  key: accountManagerDetails.login,
                  title: accountManagerDetails.displayName,
                  description: isApprovedAccountant ? translate('initialSettingsPage.helpPage.accountManagerDescription') : undefined,
                  icon: accountManagerDetails.avatar,
                  iconType: CONST.ICON_TYPE_AVATAR,
                  onPress: () =>
                      navigateToAndOpenReportWithAccountIDs(
                          [accountManagerDetails.accountID],
                          currentUserAccountID,
                          introSelected,
                          guidedSetupAndTourStatus?.isSelfTourViewed,
                          guidedSetupAndTourStatus?.hasCompletedGuidedSetupFlow,
                          betas,
                          personalDetails,
                          conciergeChat,
                      ),
                  shouldShowRightIcon: !accountManagerCalendarLink,
                  shouldShowRightComponent: !!accountManagerCalendarLink,
                  shouldBeAccessible: shouldBeAccessibleWithBookCallButton(accountManagerCalendarLink),
                  rightComponent: accountManagerCalendarLink ? (
                      <BookCallButton
                          calendarLink={accountManagerCalendarLink}
                          isNested
                      />
                  ) : undefined,
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
        onPress: () => openConciergeAnywhere(),
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
