import {useIsFocused} from '@react-navigation/native';
import {hasSeenTourSelector} from '@selectors/Onboarding';
import React, {useCallback, useImperativeHandle, useMemo, useRef} from 'react';
import {View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {MenuItemProps} from '@components/MenuItem';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useArchivedReportsIdSet from '@hooks/useArchivedReportsIdSet';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnboardingMessages from '@hooks/useOnboardingMessages';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {navigateAfterOnboardingWithMicrotaskQueue} from '@libs/navigateAfterOnboarding';
import Navigation from '@libs/Navigation/Navigation';
import OnboardingRefManager from '@libs/OnboardingRefManager';
import type {TOnboardingRef} from '@libs/OnboardingRefManager';
import {isPaidGroupPolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import variables from '@styles/variables';
import {createWorkspace, generatePolicyID} from '@userActions/Policy/Policy';
import {completeOnboarding} from '@userActions/Report';
import {setOnboardingAdminsChatReportID, setOnboardingErrorMessage, setOnboardingPolicyID, setOnboardingPurposeSelected} from '@userActions/Welcome';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {OnboardingPurpose} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import type {BaseOnboardingPurposeProps} from './types';

const selectableOnboardingChoices = Object.values(CONST.SELECTABLE_ONBOARDING_CHOICES);

function getOnboardingChoices(customChoices: OnboardingPurpose[]) {
    if (customChoices.length === 0) {
        return selectableOnboardingChoices;
    }

    return selectableOnboardingChoices.filter((choice) => customChoices.includes(choice));
}

function BaseOnboardingPurpose({shouldUseNativeStyles, shouldEnableMaxHeight, route}: BaseOnboardingPurposeProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Abacus', 'Binoculars', 'ReceiptUpload', 'PiggyBank', 'SplitBill']);

    const menuIcons = useMemo(
        () => ({
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: illustrations.ReceiptUpload,
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: illustrations.Abacus,
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: illustrations.PiggyBank,
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: illustrations.SplitBill,
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: illustrations.Binoculars,
        }),
        [illustrations.Abacus, illustrations.Binoculars, illustrations.ReceiptUpload, illustrations.PiggyBank, illustrations.SplitBill],
    );
    // We need to use isSmallScreenWidth, see navigateAfterOnboarding function comment
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {onboardingIsMediumOrLargerScreenWidth, isSmallScreenWidth} = useResponsiveLayout();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const {onboardingMessages} = useOnboardingMessages();

    const isPrivateDomainAndHasAccessiblePolicies = !account?.isFromPublicDomain && !!account?.hasAccessibleDomainPolicies;

    const theme = useTheme();
    const [onboardingErrorMessage, onboardingErrorMessageResult] = useOnyx(ONYXKEYS.ONBOARDING_ERROR_MESSAGE_TRANSLATION_KEY);
    const [onboardingPolicyID] = useOnyx(ONYXKEYS.ONBOARDING_POLICY_ID);
    const [onboardingAdminsChatReportID] = useOnyx(ONYXKEYS.ONBOARDING_ADMINS_CHAT_REPORT_ID);
    const [personalDetailsForm] = useOnyx(ONYXKEYS.FORMS.ONBOARDING_PERSONAL_DETAILS_FORM);
    const [onboardingCompanySize] = useOnyx(ONYXKEYS.ONBOARDING_COMPANY_SIZE);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [conciergeChatReportID = ''] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [onboardingValues] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const archivedReportsIdSet = useArchivedReportsIdSet();
    const {isBetaEnabled} = usePermissions();
    const mergedAccountConciergeReportID = !onboardingValues?.shouldRedirectToClassicAfterMerge && onboardingValues?.shouldValidate ? conciergeChatReportID : undefined;
    const paddingHorizontal = onboardingIsMediumOrLargerScreenWidth ? styles.ph8 : styles.ph5;

    const [customChoices = getEmptyArray<OnboardingPurpose>()] = useOnyx(ONYXKEYS.ONBOARDING_CUSTOM_CHOICES);

    const onboardingChoices = getOnboardingChoices(customChoices);

    const menuItems: MenuItemProps[] = onboardingChoices.map((choice) => {
        const translationKey = `onboarding.purpose.${choice}` as const;
        return {
            key: translationKey,
            title: translate(translationKey),
            icon: menuIcons[choice],
            displayInDefaultIconColor: true,
            iconWidth: variables.menuIconSize,
            iconHeight: variables.menuIconSize,
            iconStyles: [styles.mh3],
            wrapperStyle: [styles.purposeMenuItem],
            numberOfLinesTitle: 0,
            sentryLabel: CONST.SENTRY_LABEL.ONBOARDING.PURPOSE_ITEM,
            onPress: () => {
                setOnboardingPurposeSelected(choice);
                setOnboardingErrorMessage(null);
                if (choice === CONST.ONBOARDING_CHOICES.MANAGE_TEAM) {
                    Navigation.navigate(ROUTES.ONBOARDING_EMPLOYEES.getRoute(route.params?.backTo));
                    return;
                }

                if (isPrivateDomainAndHasAccessiblePolicies && personalDetailsForm?.firstName) {
                    if (choice === CONST.ONBOARDING_CHOICES.PERSONAL_SPEND) {
                        const paidGroupPolicy = Object.values(allPolicies ?? {}).find((policy) => isPaidGroupPolicy(policy) && isPolicyAdmin(policy, session?.email));
                        const shouldCreateWorkspace = !onboardingPolicyID && !paidGroupPolicy;

                        const {adminsChatReportID: newAdminsChatReportID, policyID: newPolicyID} = shouldCreateWorkspace
                            ? createWorkspace({
                                  policyOwnerEmail: undefined,
                                  makeMeAdmin: true,
                                  policyName: `${personalDetailsForm.firstName}'s Workspace`,
                                  policyID: generatePolicyID(),
                                  engagementChoice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE,
                                  currency: currentUserPersonalDetails.localCurrencyCode ?? CONST.CURRENCY.USD,
                                  file: undefined,
                                  shouldAddOnboardingTasks: false,
                                  introSelected,
                                  activePolicyID,
                                  currentUserAccountIDParam: session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                                  currentUserEmailParam: session?.email ?? '',
                                  shouldAddGuideWelcomeMessage: false,
                                  onboardingPurposeSelected: choice,
                                  isSelfTourViewed,
                              })
                            : {adminsChatReportID: onboardingAdminsChatReportID, policyID: onboardingPolicyID};

                        completeOnboarding({
                            engagementChoice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE,
                            onboardingMessage: onboardingMessages[CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE],
                            firstName: personalDetailsForm.firstName,
                            lastName: personalDetailsForm.lastName,
                            adminsChatReportID: newAdminsChatReportID,
                            onboardingPolicyID: newPolicyID,
                            introSelected,
                            isSelfTourViewed,
                            betas,
                        });

                        setOnboardingAdminsChatReportID();
                        setOnboardingPolicyID();

                        navigateAfterOnboardingWithMicrotaskQueue(
                            isSmallScreenWidth,
                            isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS),
                            conciergeChatReportID,
                            archivedReportsIdSet,
                            newPolicyID,
                            mergedAccountConciergeReportID,
                            false,
                        );
                        return;
                    }
                    completeOnboarding({
                        engagementChoice: choice,
                        onboardingMessage: onboardingMessages[choice],
                        firstName: personalDetailsForm.firstName,
                        lastName: personalDetailsForm.lastName,
                        adminsChatReportID: onboardingAdminsChatReportID ?? undefined,
                        onboardingPolicyID,
                        companySize: onboardingCompanySize,
                        introSelected,
                        isSelfTourViewed,
                        betas,
                    });

                    return;
                }

                Navigation.navigate(ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute(route.params?.backTo));
            },
        };
    });
    const isFocused = useIsFocused();

    const handleOuterClick = useCallback(() => {
        setOnboardingErrorMessage('onboarding.errorSelection');
    }, []);

    const onboardingLocalRef = useRef<TOnboardingRef>(null);
    useImperativeHandle(isFocused ? OnboardingRefManager.ref : onboardingLocalRef, () => ({handleOuterClick}), [handleOuterClick]);

    if (isLoadingOnyxValue(onboardingErrorMessageResult)) {
        return null;
    }
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID="BaseOnboardingPurpose"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
            shouldEnableMaxHeight={shouldEnableMaxHeight}
        >
            <View style={onboardingIsMediumOrLargerScreenWidth && styles.mh3}>
                <HeaderWithBackButton
                    shouldShowBackButton={false}
                    iconFill={theme.iconColorfulBackground}
                    progressBarPercentage={isPrivateDomainAndHasAccessiblePolicies ? 60 : 20}
                    shouldDisplayHelpButton={false}
                />
            </View>
            <ScrollView style={[styles.flex1, styles.flexGrow1, onboardingIsMediumOrLargerScreenWidth && styles.mt5, paddingHorizontal]}>
                <View style={styles.flex1}>
                    <View style={[onboardingIsMediumOrLargerScreenWidth ? styles.flexRow : styles.flexColumn, styles.mb5]}>
                        <Text
                            style={styles.textHeadlineH1}
                            accessibilityRole={CONST.ROLE.HEADER}
                        >
                            {translate('onboarding.purpose.title')}
                        </Text>
                    </View>
                    <MenuItemList
                        menuItems={menuItems}
                        shouldUseSingleExecution
                    />
                </View>
            </ScrollView>
            <View style={[styles.w100, styles.mb5, styles.mh0, paddingHorizontal]}>
                <FormHelpMessage message={onboardingErrorMessage ? translate(onboardingErrorMessage) : undefined} />
            </View>
        </ScreenWrapper>
    );
}

export default BaseOnboardingPurpose;
