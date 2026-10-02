import Button from '@components/Button';
import Checkbox from '@components/Checkbox';
import FixedFooter from '@components/FixedFooter';
import Icon from '@components/Icon';
import OnboardingHeader from '@components/OnboardingHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';

import useCompleteOnboarding from '@hooks/useCompleteOnboarding';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {
    setOnboardingAccountingEnabled,
    setOnboardingAdminsChatReportID,
    setOnboardingInterestedFeaturesMap,
    setOnboardingPolicyID,
    setOnboardingUserReportedIntegration,
} from '@libs/actions/Welcome';
import {ONBOARDING_FEATURES} from '@libs/actions/Welcome/OnboardingFeatures';
import type {OnboardingFeatureMapItem} from '@libs/actions/Welcome/OnboardingFeatures';
import Navigation from '@libs/Navigation/Navigation';
import {isGroupPolicy, isPolicyAdmin} from '@libs/PolicyUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';

import type {BaseOnboardingInterestedFeaturesProps, Feature, SectionObject} from './types';

function BaseOnboardingInterestedFeatures({shouldUseNativeStyles}: BaseOnboardingInterestedFeaturesProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['FolderOpen', 'Accounting', 'CompanyCard', 'Workflows', 'Rules', 'Car', 'Tag', 'PerDiem', 'HandCard', 'Luggage', 'Clock']);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Checkmark']);

    // We need to use isSmallScreenWidth, see navigateAfterOnboarding function comment
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {onboardingIsMediumOrLargerScreenWidth, isSmallScreenWidth} = useResponsiveLayout();
    const [onboardingPolicyID] = useOnyx(ONYXKEYS.ONBOARDING_POLICY_ID);
    const [onboardingInterestedFeaturesMap] = useOnyx(ONYXKEYS.ONBOARDING_INTERESTED_FEATURES_MAP);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [session] = useOnyx(ONYXKEYS.SESSION);

    const groupPolicy = Object.values(allPolicies ?? {}).find((policy) => isGroupPolicy(policy) && isPolicyAdmin(policy, session?.email));
    const {isOffline} = useNetwork();
    const {completeOnboardingFlow, isLoading} = useCompleteOnboarding();

    const features: Feature[] = useMemo(() => {
        return ONBOARDING_FEATURES.map((feature) => {
            switch (feature.id) {
                case CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED:
                    return {...feature, title: translate('workspace.moreFeatures.categories.title'), icon: illustrations.FolderOpen};
                case CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED:
                    return {...feature, title: translate('workspace.moreFeatures.connections.title'), icon: illustrations.Accounting};
                case CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED:
                    return {...feature, title: translate('workspace.moreFeatures.companyCards.title'), icon: illustrations.CompanyCard};
                case CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED:
                    return {...feature, title: translate('workspace.moreFeatures.workflows.title'), icon: illustrations.Workflows};
                case CONST.POLICY.MORE_FEATURES.IS_TRAVEL_ENABLED:
                    return {...feature, title: translate('workspace.moreFeatures.travel.title'), subtitle: translate('workspace.moreFeatures.travel.subtitle'), icon: illustrations.Luggage};
                case CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED:
                    return {...feature, title: translate('workspace.moreFeatures.rules.title'), subtitle: translate('workspace.moreFeatures.rules.subtitle'), icon: illustrations.Rules};
                case CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED:
                    return {
                        ...feature,
                        title: translate('workspace.moreFeatures.distanceRates.title'),
                        subtitle: translate('workspace.moreFeatures.distanceRates.subtitle'),
                        icon: illustrations.Car,
                    };
                case CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED:
                    return {
                        ...feature,
                        title: translate('workspace.moreFeatures.expensifyCard.title'),
                        subtitle: translate('workspace.moreFeatures.expensifyCard.subtitle'),
                        icon: illustrations.HandCard,
                    };
                case CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED:
                    return {...feature, title: translate('workspace.moreFeatures.tags.title'), subtitle: translate('workspace.moreFeatures.tags.subtitle'), icon: illustrations.Tag};
                case CONST.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED:
                    return {
                        ...feature,
                        title: translate('workspace.moreFeatures.perDiem.title'),
                        subtitle: translate('workspace.moreFeatures.perDiem.subtitle'),
                        icon: illustrations.PerDiem,
                    };
                case CONST.POLICY.MORE_FEATURES.IS_TIME_TRACKING_ENABLED:
                    return {
                        ...feature,
                        title: translate('workspace.moreFeatures.timeTracking.title'),
                        subtitle: translate('workspace.moreFeatures.timeTracking.subtitle'),
                        icon: illustrations.Clock,
                    };
                default:
                    return {...feature, title: feature.id, icon: illustrations.FolderOpen};
            }
        });
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
        illustrations.Clock,
        translate,
    ]);

    const defaultSelectedFeatures = useMemo(() => features.filter((feature) => !!feature.enabledByDefault).map((feature) => feature.id), [features]);
    const persistedSelectedFeatures = useMemo(() => onboardingInterestedFeaturesMap?.filter((feature) => feature.enabled).map((feature) => feature.id), [onboardingInterestedFeaturesMap]);
    const [selectedFeatureIDs, setSelectedFeatureIDs] = useState<Set<string>>();

    const selectedFeatures = useMemo(() => {
        return Array.from(selectedFeatureIDs ?? new Set(persistedSelectedFeatures ?? defaultSelectedFeatures));
    }, [defaultSelectedFeatures, persistedSelectedFeatures, selectedFeatureIDs]);
    const isAccountingEnabled = selectedFeatures.includes(CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED);

    // Set onboardingPolicyID and onboardingAdminsChatReportID if a workspace is created by the backend for OD signup
    useEffect(() => {
        if (!groupPolicy || onboardingPolicyID) {
            return;
        }
        setOnboardingAdminsChatReportID(groupPolicy.chatReportIDAdmins?.toString());
        setOnboardingPolicyID(groupPolicy.id);
    }, [groupPolicy, onboardingPolicyID]);

    const submitInterestedFeatures = useCallback(async () => {
        const featuresMap: OnboardingFeatureMapItem[] = features.map((feature) => ({
            id: feature.id,
            enabled: selectedFeatures.includes(feature.id),
            enabledByDefault: feature.enabledByDefault,
            requiresUpdate: feature.requiresUpdate,
        }));

        setOnboardingAccountingEnabled(isAccountingEnabled);
        setOnboardingInterestedFeaturesMap(featuresMap);

        if (isAccountingEnabled) {
            setOnboardingUserReportedIntegration(null);
            Navigation.navigate(ROUTES.ONBOARDING_ACCOUNTING.getRoute());
            return;
        }

        setOnboardingUserReportedIntegration(null);
        await completeOnboardingFlow({featuresMap});
    }, [completeOnboardingFlow, features, isAccountingEnabled, selectedFeatures]);

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

    const handleFeatureSelect = useCallback(
        (featureId: string) => {
            setSelectedFeatureIDs((prev) => {
                const newSet = new Set(prev ?? persistedSelectedFeatures ?? defaultSelectedFeatures);
                if (newSet.has(featureId)) {
                    newSet.delete(featureId);
                } else {
                    newSet.add(featureId);
                }
                return newSet;
            });
        },
        [defaultSelectedFeatures, persistedSelectedFeatures],
    );

    const renderItem = useCallback(
        (item: Feature) => {
            const isSelected = selectedFeatures.includes(item.id);
            const accessibilityLabel = item.subtitle ? `${item.title}. ${item.subtitle}` : item.title;
            return (
                <Checkbox
                    key={item.id}
                    accessibilityLabel={accessibilityLabel}
                    isChecked={isSelected}
                    onPress={() => handleFeatureSelect(item.id)}
                    wrapperStyle={[
                        styles.onboardingInterestedFeaturesItemWrapper,
                        isSmallScreenWidth ? styles.onboardingInterestedFeaturesItemNarrow : styles.onboardingInterestedFeaturesItemWide,
                    ]}
                    style={[styles.onboardingInterestedFeaturesItem, isSelected && styles.onboardingInterestedFeaturesItemSelected]}
                    sentryLabel={CONST.SENTRY_LABEL.ONBOARDING.INTERESTED_FEATURES_ITEM}
                >
                    <View style={[styles.onboardingInterestedFeaturesItemContent, styles.gap3]}>
                        <Icon
                            src={item.icon}
                            width={48}
                            height={48}
                        />
                        <View style={styles.onboardingInterestedFeaturesItemText}>
                            <Text style={[styles.textStrong, styles.textAlignCenter]}>{item.title}</Text>
                            {!!item.subtitle && <Text style={[styles.textSmall, styles.textAlignCenter, styles.mt1]}>{item.subtitle}</Text>}
                        </View>
                    </View>
                    <View
                        style={[
                            StyleUtils.getSelectionButtonContainerStyle(20, variables.componentBorderRadiusSmall),
                            styles.onboardingInterestedFeaturesSelectionButton,
                            isSelected && styles.checkedContainer,
                            isSelected && styles.borderColorFocus,
                        ]}
                    >
                        {isSelected && (
                            <Icon
                                src={expensifyIcons.Checkmark}
                                fill={theme.textLight}
                                height={14}
                                width={14}
                            />
                        )}
                    </View>
                </Checkbox>
            );
        },
        [StyleUtils, expensifyIcons.Checkmark, handleFeatureSelect, isSmallScreenWidth, selectedFeatures, styles, theme.textLight],
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
            <OnboardingHeader onBackButtonPress={() => Navigation.goBack(ROUTES.ONBOARDING_EMPLOYEES.getRoute())} />
            <View style={[onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}>
                <Text
                    style={[styles.textHeadlineH1, styles.mb5]}
                    accessibilityRole={CONST.ROLE.HEADER}
                >
                    {translate('onboarding.interestedFeatures.title')}
                </Text>
            </View>

            <ScrollView style={[onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}>{sections.map(renderSection)}</ScrollView>

            <FixedFooter style={[styles.pt3, styles.ph5]}>
                <Button
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    size={CONST.BUTTON_SIZE.LARGE}
                    onPress={submitInterestedFeatures}
                    isDisabled={isOffline && !isAccountingEnabled}
                    isLoading={isLoading}
                    sentryLabel={CONST.SENTRY_LABEL.ONBOARDING.CONTINUE}
                >
                    <Button.KeyboardShortcut />
                    <Button.Text>{translate('common.continue')}</Button.Text>
                </Button>
            </FixedFooter>
        </ScreenWrapper>
    );
}

export default BaseOnboardingInterestedFeatures;
