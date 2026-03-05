import {hasSeenTourSelector} from '@selectors/Onboarding';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useArchivedReportsIdSet from '@hooks/useArchivedReportsIdSet';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnboardingMessages from '@hooks/useOnboardingMessages';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {navigateAfterOnboardingWithMicrotaskQueue} from '@libs/navigateAfterOnboarding';
import Navigation from '@libs/Navigation/Navigation';
import {isPaidGroupPolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import {createWorkspace, generateDefaultWorkspaceName, generatePolicyID} from '@userActions/Policy/Policy';
import {completeOnboarding as completeOnboardingReport} from '@userActions/Report';
import {setOnboardingAdminsChatReportID, setOnboardingErrorMessage, setOnboardingPolicyID} from '@userActions/Welcome';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type IconAsset from '@src/types/utils/IconAsset';
import type {BaseOnboardingWorkspaceOptionalProps} from './types';

type Item = {
    icon: IconAsset;
    titleTranslationKey: TranslationPaths;
};

function BaseOnboardingWorkspaceOptional({shouldUseNativeStyles}: BaseOnboardingWorkspaceOptionalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [onboardingValues] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const [onboardingPurposeSelected] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED);
    const [onboardingPolicyID] = useOnyx(ONYXKEYS.ONBOARDING_POLICY_ID);
    const [onboardingAdminsChatReportID] = useOnyx(ONYXKEYS.ONBOARDING_ADMINS_CHAT_REPORT_ID);
    const [conciergeChatReportID = ''] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const archivedReportsIdSet = useArchivedReportsIdSet();
    const {onboardingMessages} = useOnboardingMessages();
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const {isRestrictedPolicyCreation} = usePreferredPolicy();
    // When we merge public email with work email, we now want to navigate to the
    // concierge chat report of the new work email and not the last accessed report.
    const mergedAccountConciergeReportID = !onboardingValues?.shouldRedirectToClassicAfterMerge && onboardingValues?.shouldValidate ? conciergeChatReportID : undefined;
    // We need to use isSmallScreenWidth, see navigateAfterOnboarding function comment
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {onboardingIsMediumOrLargerScreenWidth, isSmallScreenWidth} = useResponsiveLayout();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const ICON_SIZE = 48;
    const illustrations = useMemoizedLazyIllustrations(['MoneyReceipts', 'Tag', 'ReportReceipt']);

    const processedHelperText = `<comment><muted-text-label>${translate('onboarding.workspace.price')}</muted-text-label></comment>`;

    useEffect(() => {
        setOnboardingErrorMessage(null);
    }, []);

    const section: Item[] = [
        {
            icon: illustrations.MoneyReceipts,
            titleTranslationKey: 'onboarding.workspace.explanationModal.descriptionOne',
        },
        {
            icon: illustrations.Tag,
            titleTranslationKey: 'onboarding.workspace.explanationModal.descriptionTwo',
        },
        {
            icon: illustrations.ReportReceipt,
            titleTranslationKey: 'onboarding.workspace.explanationModal.descriptionThree',
        },
    ];

    const completeOnboarding = useCallback(() => {
        if (!onboardingPurposeSelected) {
            return;
        }

        completeOnboardingReport({
            engagementChoice: onboardingPurposeSelected,
            onboardingMessage: onboardingMessages[onboardingPurposeSelected],
            firstName: currentUserPersonalDetails.firstName,
            lastName: currentUserPersonalDetails.lastName,
            adminsChatReportID: onboardingAdminsChatReportID,
            onboardingPolicyID,
            shouldSkipTestDriveModal: (!!onboardingPolicyID && !onboardingAdminsChatReportID) || onboardingPurposeSelected === CONST.ONBOARDING_CHOICES.PERSONAL_SPEND,
            introSelected,
            betas,
        });

        setOnboardingAdminsChatReportID();
        setOnboardingPolicyID();

        navigateAfterOnboardingWithMicrotaskQueue(
            isSmallScreenWidth,
            isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS),
            conciergeChatReportID,
            archivedReportsIdSet,
            onboardingPolicyID,
            mergedAccountConciergeReportID,
            false,
        );
    }, [
        onboardingPurposeSelected,
        currentUserPersonalDetails.firstName,
        currentUserPersonalDetails.lastName,
        onboardingAdminsChatReportID,
        onboardingMessages,
        onboardingPolicyID,
        archivedReportsIdSet,
        isSmallScreenWidth,
        isBetaEnabled,
        mergedAccountConciergeReportID,
        introSelected,
        conciergeChatReportID,
        betas,
    ]);

    const createWorkspaceAndCompleteOnboarding = useCallback(() => {
        if (!onboardingPurposeSelected) {
            return;
        }

        const paidGroupPolicy = Object.values(allPolicies ?? {}).find((policy) => isPaidGroupPolicy(policy) && isPolicyAdmin(policy, session?.email));
        const shouldCreateWorkspace = !onboardingPolicyID && !paidGroupPolicy;

        const {adminsChatReportID, policyID} = shouldCreateWorkspace
            ? createWorkspace({
                  policyOwnerEmail: undefined,
                  makeMeAdmin: true,
                  policyName: generateDefaultWorkspaceName(session?.email),
                  policyID: generatePolicyID(),
                  engagementChoice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE,
                  currency: currentUserPersonalDetails.localCurrencyCode ?? CONST.CURRENCY.USD,
                  file: undefined,
                  shouldAddOnboardingTasks: false,
                  introSelected,
                  activePolicyID,
                  currentUserAccountIDParam: currentUserPersonalDetails.accountID,
                  currentUserEmailParam: currentUserPersonalDetails.email ?? '',
                  shouldAddGuideWelcomeMessage: false,
                  onboardingPurposeSelected,
                  isSelfTourViewed,
              })
            : {adminsChatReportID: onboardingAdminsChatReportID, policyID: onboardingPolicyID};

        completeOnboardingReport({
            engagementChoice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE,
            onboardingMessage: onboardingMessages[CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE],
            firstName: currentUserPersonalDetails.firstName,
            lastName: currentUserPersonalDetails.lastName,
            adminsChatReportID,
            onboardingPolicyID: policyID,
            shouldSkipTestDriveModal: !!policyID && !adminsChatReportID,
            introSelected,
            betas,
        });

        setOnboardingAdminsChatReportID();
        setOnboardingPolicyID();

        navigateAfterOnboardingWithMicrotaskQueue(
            isSmallScreenWidth,
            isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS),
            conciergeChatReportID,
            archivedReportsIdSet,
            policyID,
            mergedAccountConciergeReportID,
            false,
        );
    }, [
        onboardingPurposeSelected,
        allPolicies,
        session?.email,
        onboardingPolicyID,
        onboardingAdminsChatReportID,
        currentUserPersonalDetails.localCurrencyCode,
        currentUserPersonalDetails.accountID,
        currentUserPersonalDetails.email,
        currentUserPersonalDetails.firstName,
        currentUserPersonalDetails.lastName,
        introSelected,
        activePolicyID,
        isSelfTourViewed,
        onboardingMessages,
        betas,
        isSmallScreenWidth,
        isBetaEnabled,
        conciergeChatReportID,
        archivedReportsIdSet,
        mergedAccountConciergeReportID,
    ]);

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            testID="BaseOnboardingWorkspaceOptional"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
        >
            <HeaderWithBackButton
                progressBarPercentage={100}
                shouldDisplayHelpButton={false}
            />
            <View style={[styles.flexGrow1, onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}>
                <View style={[onboardingIsMediumOrLargerScreenWidth ? styles.flexRow : styles.flexColumn, styles.mb3]}>
                    <Text
                        style={styles.textHeadlineH1}
                        accessibilityRole={CONST.ROLE.HEADER}
                    >
                        {translate('onboarding.workspace.title')}
                    </Text>
                </View>
                <View style={styles.mb2}>
                    <Text style={[styles.textNormal, styles.colorMuted]}>{translate('onboarding.workspace.subtitle')}</Text>
                </View>
                <View>
                    {section.map((item) => {
                        return (
                            <View
                                key={item.titleTranslationKey}
                                style={[styles.mt2, styles.mb3, styles.flexRow]}
                            >
                                <View style={[styles.flexRow, styles.alignItemsCenter, styles.flex1]}>
                                    <Icon
                                        src={item.icon}
                                        height={ICON_SIZE}
                                        width={ICON_SIZE}
                                        additionalStyles={[styles.mr3]}
                                    />
                                    <View style={[styles.flexColumn, styles.flex1]}>
                                        <Text style={[styles.textStrong, styles.lh20]}>{translate(item.titleTranslationKey)}</Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                </View>
            </View>
            <View style={[onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5, styles.pb5]}>
                <View style={[styles.flexRow, styles.renderHTML, styles.pb5]}>
                    <RenderHTML html={processedHelperText} />
                </View>
                <View style={styles.mb2}>
                    <Button
                        large
                        text={translate('common.skip')}
                        onPress={() => completeOnboarding()}
                        sentryLabel={CONST.SENTRY_LABEL.ONBOARDING.SKIP}
                    />
                </View>
                {!isRestrictedPolicyCreation && (
                    <View>
                        <Button
                            success
                            large
                            text={translate('onboarding.workspace.createWorkspace')}
                            onPress={() => {
                                setOnboardingErrorMessage(null);
                                if (onboardingPurposeSelected === CONST.ONBOARDING_CHOICES.PERSONAL_SPEND) {
                                    createWorkspaceAndCompleteOnboarding();
                                    return;
                                }
                                Navigation.navigate(ROUTES.ONBOARDING_WORKSPACE_CONFIRMATION.getRoute());
                            }}
                            sentryLabel={CONST.SENTRY_LABEL.ONBOARDING.CREATE_WORKSPACE}
                        />
                    </View>
                )}
            </View>
        </ScreenWrapper>
    );
}

export default BaseOnboardingWorkspaceOptional;
