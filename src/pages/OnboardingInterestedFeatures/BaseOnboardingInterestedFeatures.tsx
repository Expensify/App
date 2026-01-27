import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import Button from '@components/Button';
import Checkbox from '@components/Checkbox';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import {PressableWithoutFeedback} from '@components/Pressable';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import isSidePanelReportSupported from '@components/SidePanel/isSidePanelReportSupported';
import Text from '@components/Text';
import useArchivedReportsIdSet from '@hooks/useArchivedReportsIdSet';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnboardingMessages from '@hooks/useOnboardingMessages';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {createWorkspace, generatePolicyID} from '@libs/actions/Policy/Policy';
import {completeOnboarding} from '@libs/actions/Report';
import {setOnboardingAdminsChatReportID, setOnboardingPolicyID} from '@libs/actions/Welcome';
import Log from '@libs/Log';
import {navigateAfterOnboardingWithMicrotaskQueue} from '@libs/navigateAfterOnboarding';
import Navigation from '@libs/Navigation/Navigation';
import {isPaidGroupPolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BaseOnboardingInterestedFeaturesProps, Feature, SectionObject} from './types';

function BaseOnboardingInterestedFeatures({shouldUseNativeStyles}: BaseOnboardingInterestedFeaturesProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {onboardingMessages} = useOnboardingMessages();
    const illustrations = useMemoizedLazyIllustrations(['FolderOpen', 'Accounting', 'CompanyCard', 'Workflows', 'Rules', 'Car', 'Tag', 'PerDiem', 'HandCard', 'Luggage']);

    // We need to use isSmallScreenWidth, see navigateAfterOnboarding function comment
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {onboardingIsMediumOrLargerScreenWidth, isSmallScreenWidth} = useResponsiveLayout();
    const [onboardingPurposeSelected] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, {canBeMissing: true});
    const [onboardingPolicyID] = useOnyx(ONYXKEYS.ONBOARDING_POLICY_ID, {canBeMissing: true});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});
    const [onboardingAdminsChatReportID] = useOnyx(ONYXKEYS.ONBOARDING_ADMINS_CHAT_REPORT_ID, {canBeMissing: true});
    const [onboardingCompanySize] = useOnyx(ONYXKEYS.ONBOARDING_COMPANY_SIZE, {canBeMissing: true});
    const [userReportedIntegration] = useOnyx(ONYXKEYS.ONBOARDING_USER_REPORTED_INTEGRATION, {canBeMissing: true});
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const {isBetaEnabled} = usePermissions();
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const archivedReportsIdSet = useArchivedReportsIdSet();

    const paidGroupPolicy = Object.values(allPolicies ?? {}).find((policy) => isPaidGroupPolicy(policy) && isPolicyAdmin(policy, session?.email));
    const {isOffline} = useNetwork();
    const [width, setWidth] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const features: Feature[] = useMemo(() => {
        return [
            {
                id: CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED,
                title: translate('workspace.moreFeatures.categories.title'),
                icon: illustrations.FolderOpen,
                enabledByDefault: true,
            },
            {
                id: CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED,
                title: translate('workspace.moreFeatures.connections.title'),
                icon: illustrations.Accounting,
                enabledByDefault: !!userReportedIntegration,
            },
            {
                id: CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED,
                title: translate('workspace.moreFeatures.companyCards.title'),
                icon: illustrations.CompanyCard,
                enabledByDefault: true,
            },
            {
                id: CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED,
                title: translate('workspace.moreFeatures.workflows.title'),
                icon: illustrations.Workflows,
                enabledByDefault: true,
            },
            {
                id: CONST.POLICY.MORE_FEATURES.IS_TRAVEL_ENABLED,
                title: translate('workspace.moreFeatures.travel.title'),
                icon: illustrations.Luggage,
            },
            {
                id: CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED,
                title: translate('workspace.moreFeatures.rules.title'),
                icon: illustrations.Rules,
                requiresUpdate: true,
            },
            {
                id: CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED,
                title: translate('workspace.moreFeatures.distanceRates.title'),
                icon: illustrations.Car,
            },
            {
                id: CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED,
                title: translate('workspace.moreFeatures.expensifyCard.title'),
                icon: illustrations.HandCard,
            },
            {
                id: CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED,
                title: translate('workspace.moreFeatures.tags.title'),
                icon: illustrations.Tag,
            },
            {
                id: CONST.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED,
                title: translate('workspace.moreFeatures.perDiem.title'),
                icon: illustrations.PerDiem,
                requiresUpdate: true,
            },
        ];
    }, [
        illustrations.FolderOpen,
        illustrations.Accounting,
        illustrations.CompanyCard,
        illustrations.Workflows,
        illustrations.Rules,
        illustrations.Car,
        illustrations.HandCard,
        illustrations.Tag,
        illustrations.PerDiem,
        illustrations.Luggage,
        translate,
        userReportedIntegration,
    ]);

    const [userToggledFeatures, setUserToggledFeatures] = useState<Set<string>>(new Set());

    const selectedFeatures = useMemo(() => {
        return features
            .filter((feature) => {
                if (userToggledFeatures.has(feature.id)) {
                    return !feature.enabledByDefault;
                }
                return feature.enabledByDefault;
            })
            .map((feature) => feature.id);
    }, [features, userToggledFeatures]);

    // Set onboardingPolicyID and onboardingAdminsChatReportID if a workspace is created by the backend for OD signup
    useEffect(() => {
        if (!paidGroupPolicy || onboardingPolicyID) {
            return;
        }
        setOnboardingAdminsChatReportID(paidGroupPolicy.chatReportIDAdmins?.toString());
        setOnboardingPolicyID(paidGroupPolicy.id);
    }, [paidGroupPolicy, onboardingPolicyID]);

    const handleContinue = useCallback(async () => {
        if (!onboardingPurposeSelected || !onboardingCompanySize) {
            return;
        }

        try {
            setIsLoading(true);

            const shouldCreateWorkspace = !onboardingPolicyID && !paidGroupPolicy;
            const newUserReportedIntegration = selectedFeatures.some((feature) => feature === CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED) ? userReportedIntegration : undefined;
            const featuresMap = features.map((feature) => ({
                ...feature,
                enabled: selectedFeatures.includes(feature.id),
            }));

            // We need `adminsChatReportID` for `completeOnboarding`, but at the same time, we don't want to call `createWorkspace` more than once.
            // If we have already created a workspace, we want to reuse the `onboardingAdminsChatReportID` and `onboardingPolicyID`.
            const {adminsChatReportID, policyID} = shouldCreateWorkspace
                ? createWorkspace({
                      policyOwnerEmail: undefined,
                      makeMeAdmin: true,
                      policyName: '',
                      policyID: generatePolicyID(),
                      engagementChoice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
                      currency: currentUserPersonalDetails?.localCurrencyCode ?? '',
                      file: undefined,
                      shouldAddOnboardingTasks: false,
                      companySize: onboardingCompanySize,
                      userReportedIntegration: newUserReportedIntegration,
                      featuresMap,
                      introSelected,
                      activePolicyID,
                      currentUserAccountIDParam: currentUserPersonalDetails.accountID,
                      currentUserEmailParam: currentUserPersonalDetails.email ?? '',
                      shouldAddGuideWelcomeMessage: false,
                  })
                : {adminsChatReportID: onboardingAdminsChatReportID, policyID: onboardingPolicyID};

            if (shouldCreateWorkspace) {
                setOnboardingAdminsChatReportID(adminsChatReportID);
                setOnboardingPolicyID(policyID);
            }

            await completeOnboarding({
                engagementChoice: onboardingPurposeSelected,
                onboardingMessage: onboardingMessages[onboardingPurposeSelected],
                adminsChatReportID,
                onboardingPolicyID: policyID,
                companySize: onboardingCompanySize,
                userReportedIntegration: newUserReportedIntegration,
                firstName: currentUserPersonalDetails?.firstName,
                lastName: currentUserPersonalDetails?.lastName,
                selectedInterestedFeatures: featuresMap.filter((feature) => feature.enabled).map((feature) => feature.id),
                shouldSkipTestDriveModal: !!policyID && !adminsChatReportID,
                shouldWaitForRHPVariantInitialization: isSidePanelReportSupported,
            });

            // Avoid creating new WS because onboardingPolicyID is cleared before unmounting
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.runAfterInteractions(() => {
                setOnboardingAdminsChatReportID();
                setOnboardingPolicyID();
            });

            // We need to wait the policy is created before navigating out the onboarding flow
            navigateAfterOnboardingWithMicrotaskQueue(
                isSmallScreenWidth,
                isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS),
                archivedReportsIdSet,
                policyID,
                adminsChatReportID,
                // Onboarding tasks would show in Concierge instead of admins room for testing accounts, we should open where onboarding tasks are located
                // See https://github.com/Expensify/App/issues/57167 for more details
                (session?.email ?? '').includes('+'),
            );
        } catch (error) {
            Log.warn('[BaseOnboardingInterestedFeatures] Error completing onboarding', {error});
        } finally {
            setIsLoading(false);
        }
    }, [
        isBetaEnabled,
        isSmallScreenWidth,
        archivedReportsIdSet,
        onboardingAdminsChatReportID,
        onboardingCompanySize,
        onboardingMessages,
        onboardingPolicyID,
        onboardingPurposeSelected,
        paidGroupPolicy,
        session?.email,
        userReportedIntegration,
        features,
        selectedFeatures,
        currentUserPersonalDetails?.firstName,
        currentUserPersonalDetails?.lastName,
        currentUserPersonalDetails?.localCurrencyCode,
        activePolicyID,
        currentUserPersonalDetails.accountID,
        currentUserPersonalDetails.email,
        introSelected,
    ]);

    // Create items for enabled features
    const enabledFeatures: Feature[] = features
        .filter((feature) => !!feature.enabledByDefault || feature.id === CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED)
        .map((feature) => ({
            ...feature,
        }));

    // Create items for features they may be interested in
    const mayBeInterestedFeatures: Feature[] = features
        .filter((feature) => !feature.enabledByDefault && feature.id !== CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED)
        .map((feature) => ({
            ...feature,
        }));

    // Define sections
    const sections: SectionObject[] = [
        {
            titleTranslationKey: 'onboarding.interestedFeatures.featuresAlreadyEnabled',
            items: enabledFeatures,
        },
        {
            titleTranslationKey: 'onboarding.interestedFeatures.featureYouMayBeInterestedIn',
            items: mayBeInterestedFeatures,
        },
    ];

    const handleFeatureSelect = useCallback((featureId: string) => {
        setUserToggledFeatures((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(featureId)) {
                newSet.delete(featureId);
            } else {
                newSet.add(featureId);
            }
            return newSet;
        });
    }, []);

    const gap = styles.gap3.gap;

    const renderItem = useCallback(
        (item: Feature) => {
            const isSelected = selectedFeatures.includes(item.id);
            return (
                <PressableWithoutFeedback
                    key={item.id}
                    onPress={() => {
                        handleFeatureSelect(item.id);
                    }}
                    accessibilityLabel={item.title}
                    accessible={false}
                    hoverStyle={!isSelected ? styles.hoveredComponentBG : undefined}
                    style={[styles.onboardingInterestedFeaturesItem, isSmallScreenWidth ? styles.flexBasis100 : {maxWidth: (width - gap) / 2}, isSelected && styles.activeComponentBG]}
                >
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                        <Icon
                            src={item.icon}
                            width={48}
                            height={48}
                        />
                        <Text style={[styles.textStrong]}>{item.title}</Text>
                    </View>
                    <Checkbox
                        accessibilityLabel={item.title}
                        isChecked={isSelected}
                        onPress={() => {
                            handleFeatureSelect(item.id);
                        }}
                    />
                </PressableWithoutFeedback>
            );
        },
        [styles, isSmallScreenWidth, selectedFeatures, handleFeatureSelect, width, gap],
    );

    const renderSection = useCallback(
        (section: SectionObject) => (
            <Section
                key={section.titleTranslationKey}
                containerStyles={[styles.p0, styles.mh0, styles.bgTransparent, styles.noBorderRadius]}
                childrenStyles={[styles.flexRow, styles.flexWrap, styles.gap3]}
                renderTitle={() => <Text style={[styles.mutedNormalTextLabel, styles.mb3]}>{translate(section.titleTranslationKey as TranslationPaths)}</Text>}
                subtitleMuted
            >
                {section.items.map(renderItem)}
            </Section>
        ),
        [styles, renderItem, translate],
    );

    return (
        <ScreenWrapper
            testID="BaseOnboardingInterestedFeatures"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                shouldShowBackButton
                progressBarPercentage={90}
                onBackButtonPress={() => Navigation.goBack(ROUTES.ONBOARDING_ACCOUNTING.getRoute())}
                shouldDisplayHelpButton={false}
            />
            <View style={[onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}>
                <Text style={[styles.textHeadlineH1, styles.mb5]}>{translate('onboarding.interestedFeatures.title')}</Text>
            </View>

            <ScrollView
                onLayout={(e) => {
                    setWidth(e.nativeEvent.layout.width);
                }}
                style={[onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}
            >
                {sections.map(renderSection)}
            </ScrollView>

            <FixedFooter style={[styles.pt3, styles.ph5]}>
                <Button
                    success
                    large
                    text={translate('common.continue')}
                    onPress={handleContinue}
                    isDisabled={isOffline}
                    isLoading={isLoading}
                    pressOnEnter
                />
            </FixedFooter>
        </ScreenWrapper>
    );
}

export default BaseOnboardingInterestedFeatures;
