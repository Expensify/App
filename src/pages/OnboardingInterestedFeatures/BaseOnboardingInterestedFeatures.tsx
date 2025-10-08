import React, {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import Button from '@components/Button';
import Checkbox from '@components/Checkbox';
import CustomStatusBarAndBackgroundContext from '@components/CustomStatusBarAndBackground/CustomStatusBarAndBackgroundContext';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Illustrations from '@components/Icon/Illustrations';
import {PressableWithoutFeedback} from '@components/Pressable';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnboardingMessages from '@hooks/useOnboardingMessages';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {openOldDotLink} from '@libs/actions/Link';
import {createWorkspace, generatePolicyID, updateInterestedFeatures} from '@libs/actions/Policy/Policy';
import {completeOnboarding} from '@libs/actions/Report';
import {setOnboardingAdminsChatReportID, setOnboardingPolicyID} from '@libs/actions/Welcome';
import {WRITE_COMMANDS} from '@libs/API/types';
import {navigateAfterOnboardingWithMicrotaskQueue} from '@libs/navigateAfterOnboarding';
import Navigation from '@libs/Navigation/Navigation';
import {waitForIdle} from '@libs/Network/SequentialQueue';
import {shouldOnboardingRedirectToOldDot} from '@libs/OnboardingUtils';
import {isPaidGroupPolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import {closeReactNativeApp} from '@userActions/HybridApp';
import CONFIG from '@src/CONFIG';
import CONST, {FEATURE_IDS} from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BaseOnboardingInterestedFeaturesProps, Feature, SectionObject} from './types';

function BaseOnboardingInterestedFeatures({shouldUseNativeStyles}: BaseOnboardingInterestedFeaturesProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {onboardingMessages} = useOnboardingMessages();
    const {setRootStatusBarEnabled} = useContext(CustomStatusBarAndBackgroundContext);

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

    const {isBetaEnabled} = usePermissions();
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});

    const paidGroupPolicy = Object.values(allPolicies ?? {}).find((policy) => isPaidGroupPolicy(policy) && isPolicyAdmin(policy, session?.email));
    const [onboarding] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {canBeMissing: true});
    const {isOffline} = useNetwork();
    const isLoading = onboarding?.isLoading;
    const prevIsLoading = usePrevious(isLoading);
    const [width, setWidth] = useState(0);

    const features: Feature[] = useMemo(() => {
        return [
            {
                id: FEATURE_IDS.CATEGORIES,
                title: translate('workspace.moreFeatures.categories.title'),
                icon: Illustrations.FolderOpen,
                enabledByDefault: true,
                apiEndpoint: WRITE_COMMANDS.ENABLE_POLICY_CATEGORIES,
            },
            {
                id: FEATURE_IDS.ACCOUNTING,
                title: translate('workspace.moreFeatures.connections.title'),
                icon: Illustrations.Accounting,
                enabledByDefault: !!userReportedIntegration,
                apiEndpoint: WRITE_COMMANDS.ENABLE_POLICY_CONNECTIONS,
            },
            {
                id: FEATURE_IDS.COMPANY_CARDS,
                title: translate('workspace.moreFeatures.companyCards.title'),
                icon: Illustrations.CompanyCard,
                enabledByDefault: true,
                apiEndpoint: WRITE_COMMANDS.ENABLE_POLICY_COMPANY_CARDS,
            },
            {
                id: FEATURE_IDS.WORKFLOWS,
                title: translate('workspace.moreFeatures.workflows.title'),
                icon: Illustrations.Workflows,
                enabledByDefault: true,
                apiEndpoint: WRITE_COMMANDS.ENABLE_POLICY_WORKFLOWS,
            },
            {
                id: FEATURE_IDS.INVOICES,
                title: translate('workspace.moreFeatures.invoices.title'),
                icon: Illustrations.InvoiceBlue,
                apiEndpoint: WRITE_COMMANDS.ENABLE_POLICY_INVOICING,
            },
            {
                id: FEATURE_IDS.RULES,
                title: translate('workspace.moreFeatures.rules.title'),
                icon: Illustrations.Rules,
                apiEndpoint: WRITE_COMMANDS.SET_POLICY_RULES_ENABLED,
                requiresUpdate: true,
            },
            {
                id: FEATURE_IDS.DISTANCE_RATES,
                title: translate('workspace.moreFeatures.distanceRates.title'),
                icon: Illustrations.Car,
                apiEndpoint: WRITE_COMMANDS.ENABLE_POLICY_DISTANCE_RATES,
            },
            {
                id: FEATURE_IDS.EXPENSIFY_CARD,
                title: translate('workspace.moreFeatures.expensifyCard.title'),
                icon: Illustrations.HandCard,
                apiEndpoint: WRITE_COMMANDS.ENABLE_POLICY_EXPENSIFY_CARDS,
            },
            {
                id: FEATURE_IDS.TAGS,
                title: translate('workspace.moreFeatures.tags.title'),
                icon: Illustrations.Tag,
                apiEndpoint: WRITE_COMMANDS.ENABLE_POLICY_TAGS,
            },
            {
                id: FEATURE_IDS.PER_DIEM,
                title: translate('workspace.moreFeatures.perDiem.title'),
                icon: Illustrations.PerDiem,
                apiEndpoint: WRITE_COMMANDS.TOGGLE_POLICY_PER_DIEM,
                requiresUpdate: true,
            },
        ];
    }, [translate, userReportedIntegration]);

    const [selectedFeatures, setSelectedFeatures] = useState<string[]>(() => features.filter((feature) => feature.enabledByDefault).map((feature) => feature.id));

    // Set onboardingPolicyID and onboardingAdminsChatReportID if a workspace is created by the backend for OD signup
    useEffect(() => {
        if (!paidGroupPolicy || onboardingPolicyID) {
            return;
        }
        setOnboardingAdminsChatReportID(paidGroupPolicy.chatReportIDAdmins?.toString());
        setOnboardingPolicyID(paidGroupPolicy.id);
    }, [paidGroupPolicy, onboardingPolicyID]);

    useEffect(() => {
        if (!!isLoading || !prevIsLoading) {
            return;
        }

        if (CONFIG.IS_HYBRID_APP) {
            closeReactNativeApp({shouldSetNVP: true});
            setRootStatusBarEnabled(false);
            return;
        }
        // Wait for CompleteGuidedSetup and CreateWorkspace to complete before redirecting to OldDot to prevent showing this onboarding modal again.
        waitForIdle().then(() => {
            openOldDotLink(CONST.OLDDOT_URLS.INBOX, true);
        });
    }, [isLoading, prevIsLoading, setRootStatusBarEnabled]);

    const handleContinue = useCallback(() => {
        if (!onboardingPurposeSelected || !onboardingCompanySize) {
            return;
        }

        const shouldCreateWorkspace = !onboardingPolicyID && !paidGroupPolicy;
        const newUserReportedIntegration = selectedFeatures.some((feature) => feature === 'accounting') ? userReportedIntegration : undefined;
        const featuresMap = features.map((feature) => ({
            ...feature,
            enabled: selectedFeatures.includes(feature.id),
        }));

        // We need `adminsChatReportID` for `completeOnboarding`, but at the same time, we don't want to call `createWorkspace` more than once.
        // If we have already created a workspace, we want to reuse the `onboardingAdminsChatReportID` and `onboardingPolicyID`.
        const {adminsChatReportID, policyID, type} = shouldCreateWorkspace
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
              })
            : {adminsChatReportID: onboardingAdminsChatReportID, policyID: onboardingPolicyID, type: undefined};

        if (policyID) {
            updateInterestedFeatures(featuresMap, policyID, type);
        }

        if (shouldCreateWorkspace) {
            setOnboardingAdminsChatReportID(adminsChatReportID);
            setOnboardingPolicyID(policyID);
        }

        completeOnboarding({
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
        });

        if (shouldOnboardingRedirectToOldDot(onboardingCompanySize, newUserReportedIntegration)) {
            // Do not call openOldDotLink here because it will cause a navigation loop. See https://github.com/Expensify/App/issues/61363
            return;
        }

        // Avoid creating new WS because onboardingPolicyID is cleared before unmounting
        // eslint-disable-next-line deprecation/deprecation
        InteractionManager.runAfterInteractions(() => {
            setOnboardingAdminsChatReportID();
            setOnboardingPolicyID();
        });

        // We need to wait the policy is created before navigating out the onboarding flow
        navigateAfterOnboardingWithMicrotaskQueue(
            isSmallScreenWidth,
            isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS),
            policyID,
            adminsChatReportID,
            // Onboarding tasks would show in Concierge instead of admins room for testing accounts, we should open where onboarding tasks are located
            // See https://github.com/Expensify/App/issues/57167 for more details
            (session?.email ?? '').includes('+'),
        );
    }, [
        isBetaEnabled,
        isSmallScreenWidth,
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
    ]);

    // Create items for enabled features
    const enabledFeatures: Feature[] = features
        .filter((feature) => feature.enabledByDefault)
        .map((feature) => ({
            ...feature,
        }));

    // Create items for features they may be interested in
    const mayBeInterestedFeatures: Feature[] = features
        .filter((feature) => !feature.enabledByDefault)
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
        setSelectedFeatures((prev) => {
            if (prev.includes(featureId)) {
                return prev.filter((id) => id !== featureId);
            }
            return [...prev, featureId];
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
                    isLoading={isLoading}
                    isDisabled={isOffline}
                    pressOnEnter
                />
            </FixedFooter>
        </ScreenWrapper>
    );
}

BaseOnboardingInterestedFeatures.displayName = 'BaseOnboardingInterestedFeatures';

export default BaseOnboardingInterestedFeatures;
