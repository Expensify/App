import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import CustomUnitDefaultCategorySelector from '@components/CustomUnitDefaultCategorySelector';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Switch from '@components/Switch';
import Text from '@components/Text';

import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {hasEnabledOptions} from '@libs/OptionsListUtils';
import {getGovernmentRateCountryPhraseTranslationKey, isCommuterExclusionEnabled, isCurrencySupportedForAutoUpdate, isMapOrGPSRequired} from '@libs/PolicyDistanceRatesUtils';
import {getDistanceRateCustomUnit, isControlPolicy} from '@libs/PolicyUtils';
import {getUnitTranslationKey} from '@libs/WorkspacesSettingsUtils';

import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import {
    clearPolicyCommuterExclusionsErrors,
    clearPolicyDistanceRatesErrorFields,
    clearPolicyRequireMapOrGPSErrors,
    clearWorkspaceDistanceAutoUpdateErrors,
    openPolicyDistanceRatesPage,
    setPolicyRequireMapOrGPS,
    setWorkspaceDistanceAutoUpdate,
} from '@userActions/Policy/DistanceRate';
import {enableDistanceRequestTax} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {CommuterExclusions, CustomUnit} from '@src/types/onyx/Policy';

import {Str} from 'expensify-common';
import React, {useEffect} from 'react';
import {View} from 'react-native';

type PolicyDistanceRatesSettingsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DISTANCE_RATES_SETTINGS>;

function getCommuterExclusionsSummary(commuterExclusions: CommuterExclusions | undefined, defaultUnit: string | undefined, translate: ReturnType<typeof useLocalize>['translate']): string {
    if (commuterExclusions?.method === CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE) {
        return translate('workspace.distanceRates.commuterExclusions.summaryHomeAndOffice');
    }
    if (commuterExclusions?.method === CONST.POLICY.COMMUTER_EXCLUSION_METHOD.FIXED_DISTANCE && commuterExclusions?.fixedDistance != null) {
        return translate('workspace.distanceRates.commuterExclusions.summaryFixedDistance', {
            distance: commuterExclusions.fixedDistance,
            unit: commuterExclusions.fixedDistanceUnit ?? defaultUnit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
        });
    }
    return translate('workspace.distanceRates.commuterExclusions.summaryDisabled');
}

function PolicyDistanceRatesSettingsPage({route}: PolicyDistanceRatesSettingsPageProps) {
    const policyID = route.params.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const [governmentMileageRates] = useOnyx(ONYXKEYS.GOVERNMENT_MILEAGE_RATES);

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const {showConfirmModal} = useConfirmModal();
    const isCommuterExclusionsEnabled = isBetaEnabled(CONST.BETAS.COMMUTER_EXCLUSIONS);
    const customUnit = getDistanceRateCustomUnit(policy);
    const {canWrite: canWriteDistanceRates, withReadOnlyFallback} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.DISTANCE_RATES);
    const isDistanceTrackTaxEnabled = !!customUnit?.attributes?.taxEnabled;
    const isPolicyTrackTaxEnabled = !!policy?.tax?.trackingEnabled;

    const defaultCategory = customUnit?.defaultCategory;
    const defaultUnit = customUnit?.attributes?.unit;
    const errorFields = customUnit?.errorFields;

    const FullPageBlockingView = !customUnit ? FullPageOfflineBlockingView : View;

    const clearErrorFields = (fieldName: keyof CustomUnit) => {
        if (!customUnit?.customUnitID) {
            return;
        }

        clearPolicyDistanceRatesErrorFields(policyID, customUnit.customUnitID, {...errorFields, [fieldName]: null});
    };

    const countryPhraseTranslationKey = getGovernmentRateCountryPhraseTranslationKey(policy?.outputCurrency);
    const isAutoUpdateSupported = isCurrencySupportedForAutoUpdate(policy?.outputCurrency) && !!customUnit && !!countryPhraseTranslationKey;

    const navigateToUpgrade = () => {
        Navigation.navigate(
            ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.governmentDistanceRates.alias, ROUTES.WORKSPACE_DISTANCE_RATES_SETTINGS.getRoute(policyID)),
        );
    };

    // Loads the government reference rates the toggle copies optimistically, since this page can be opened without the list page
    const fetchDistanceRates = () => {
        openPolicyDistanceRatesPage(policyID);
    };

    useNetwork({onReconnect: fetchDistanceRates});

    useEffect(() => {
        fetchDistanceRates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleAutoUpdateGovernmentRate = (isOn: boolean) => {
        if (!customUnit) {
            return;
        }

        // Only Control can auto-update government rates, so turning it on anywhere else goes to the upgrade flow instead of erroring on the server
        if (isOn && !isControlPolicy(policy)) {
            navigateToUpgrade();
            return;
        }

        setWorkspaceDistanceAutoUpdate(policyID, customUnit, isOn, governmentMileageRates ?? [], policy?.outputCurrency);
    };

    // Commuter exclusions are computed from the mapped route, so they enforce the requirement on their own. The
    // toggle is shown on and locked in that case, and the stored setting is left untouched so the admin's own
    // choice comes back if they stop excluding commutes.
    const isRequirementLockedByCommuterExclusions = isCommuterExclusionEnabled(policy);
    const isRequired = isMapOrGPSRequired(policy);

    const showRequirementLockedModal = () => {
        showConfirmModal({
            title: translate('distance.error.mapOrGpsDistanceRequired.title'),
            prompt: translate('workspace.distanceRates.requireMapOrGPSLockedByCommuterExclusions'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    };

    const onToggleTrackTax = (isOn: boolean) => {
        if (!customUnit?.attributes) {
            return;
        }
        const attributes = {...customUnit?.attributes, taxEnabled: isOn};
        enableDistanceRequestTax(policyID, customUnit.name, customUnit.customUnitID, attributes, customUnit.attributes);
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.DISTANCE_RATES}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="PolicyDistanceRatesSettingsPage"
            >
                <HeaderWithBackButton title={translate('workspace.common.settings')} />
                <FullPageBlockingView style={customUnit ? styles.flexGrow1 : []}>
                    <ScrollView
                        contentContainerStyle={styles.flexGrow1}
                        keyboardShouldPersistTaps="always"
                        addBottomSafeAreaPadding
                    >
                        <View>
                            {!!defaultUnit && (
                                <OfflineWithFeedback
                                    errors={getLatestErrorField(customUnit ?? {}, 'attributes')}
                                    pendingAction={customUnit?.pendingFields?.attributes}
                                    errorRowStyles={styles.mh5}
                                    onClose={() => clearErrorFields('attributes')}
                                >
                                    <MenuItemWithTopDescription
                                        shouldShowRightIcon={canWriteDistanceRates}
                                        title={defaultUnit ? Str.recapitalize(translate(getUnitTranslationKey(defaultUnit))) : ''}
                                        description={translate('workspace.distanceRates.unit')}
                                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_DISTANCE_RATES_UNIT.getRoute(policyID))}
                                        interactive={canWriteDistanceRates}
                                        wrapperStyle={[styles.ph5, styles.mt3]}
                                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.DISTANCE_RATES.UNIT_SELECTOR}
                                    />
                                </OfflineWithFeedback>
                            )}
                            {!!policy?.areCategoriesEnabled && hasEnabledOptions(policyCategories ?? {}) && !!customUnit?.customUnitID && (
                                <OfflineWithFeedback
                                    errors={getLatestErrorField(customUnit ?? {}, 'defaultCategory')}
                                    pendingAction={customUnit?.pendingFields?.defaultCategory}
                                    errorRowStyles={styles.mh5}
                                    onClose={() => clearErrorFields('defaultCategory')}
                                >
                                    <CustomUnitDefaultCategorySelector
                                        label={translate('workspace.common.defaultCategory')}
                                        defaultValue={defaultCategory}
                                        wrapperStyle={[styles.ph5, styles.mt3]}
                                        customUnitID={customUnit.customUnitID}
                                        interactive={canWriteDistanceRates}
                                    />
                                </OfflineWithFeedback>
                            )}
                            {isAutoUpdateSupported && (
                                <OfflineWithFeedback
                                    errors={getLatestErrorField(policy ?? {}, 'shouldAutoUpdateGovernmentDistanceRates')}
                                    errorRowStyles={styles.mh5}
                                    pendingAction={policy?.pendingFields?.shouldAutoUpdateGovernmentDistanceRates}
                                    onClose={() => clearWorkspaceDistanceAutoUpdateErrors(policyID)}
                                >
                                    <View style={[styles.mt2, styles.mb5, styles.mh5]}>
                                        <View style={[styles.flexRow, styles.mb2, styles.mr2, styles.alignItemsCenter, styles.justifyContentBetween]}>
                                            <Text
                                                style={[styles.textNormal, styles.colorMuted]}
                                                accessible={false}
                                                aria-hidden
                                            >
                                                {translate('workspace.distanceRates.autoUpdateGovernmentRate')}
                                            </Text>
                                            <Switch
                                                isOn={!!policy?.shouldAutoUpdateGovernmentDistanceRates}
                                                accessibilityLabel={translate('workspace.distanceRates.autoUpdateGovernmentRate')}
                                                onToggle={toggleAutoUpdateGovernmentRate}
                                                disabled={!canWriteDistanceRates}
                                                disabledAction={withReadOnlyFallback()}
                                                showLockIcon={!canWriteDistanceRates}
                                            />
                                        </View>
                                        <Text style={[styles.textLabel, styles.colorMuted]}>
                                            {translate('workspace.distanceRates.autoUpdateGovernmentRateDescription', translate(countryPhraseTranslationKey))}
                                        </Text>
                                    </View>
                                </OfflineWithFeedback>
                            )}
                            <ToggleSettingOptionRow
                                title={translate('distance.error.mapOrGpsDistanceRequired.title')}
                                subtitle={translate('workspace.distanceRates.requireMapOrGPSDescription')}
                                switchAccessibilityLabel={translate('distance.error.mapOrGpsDistanceRequired.title')}
                                shouldPlaceSubtitleBelowSwitch
                                shouldUseCompactSubtitleSpacing
                                wrapperStyle={[styles.mt2, styles.mh5]}
                                isActive={isRequired}
                                onToggle={(isOn) => setPolicyRequireMapOrGPS(policyID, isOn, policy?.requireMapOrGPS)}
                                disabled={!canWriteDistanceRates || isRequirementLockedByCommuterExclusions}
                                disabledAction={withReadOnlyFallback(isRequirementLockedByCommuterExclusions ? showRequirementLockedModal : undefined)}
                                showLockIcon={!canWriteDistanceRates || isRequirementLockedByCommuterExclusions}
                                pendingAction={policy?.pendingFields?.requireMapOrGPS}
                                errors={getLatestErrorField(policy ?? {}, 'requireMapOrGPS')}
                                onCloseError={() => clearPolicyRequireMapOrGPSErrors(policyID)}
                            />
                            {isCommuterExclusionsEnabled && (
                                <OfflineWithFeedback
                                    errors={getLatestErrorField(policy ?? {}, 'commuterExclusions')}
                                    pendingAction={policy?.pendingFields?.commuterExclusions}
                                    errorRowStyles={styles.mh5}
                                    onClose={() => clearPolicyCommuterExclusionsErrors(policyID)}
                                >
                                    <MenuItemWithTopDescription
                                        shouldShowRightIcon
                                        title={getCommuterExclusionsSummary(policy?.commuterExclusions, defaultUnit, translate)}
                                        description={translate('workspace.distanceRates.commuterExclusions.title')}
                                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_DISTANCE_RATES_COMMUTER_EXCLUSIONS.getRoute(policyID))}
                                        wrapperStyle={[styles.ph5, styles.mt3]}
                                    />
                                </OfflineWithFeedback>
                            )}
                            <OfflineWithFeedback
                                errors={getLatestErrorField(customUnit ?? {}, 'taxEnabled')}
                                errorRowStyles={styles.mh5}
                                pendingAction={customUnit?.pendingFields?.taxEnabled}
                            >
                                <View style={[styles.mt2, styles.mh5]}>
                                    <View style={[styles.flexRow, styles.mb2, styles.mr2, styles.alignItemsCenter, styles.justifyContentBetween]}>
                                        <Text
                                            style={[styles.textNormal, styles.colorMuted]}
                                            accessible={false}
                                            aria-hidden
                                        >
                                            {translate('workspace.distanceRates.trackTax')}
                                        </Text>
                                        <Switch
                                            isOn={isDistanceTrackTaxEnabled && isPolicyTrackTaxEnabled}
                                            accessibilityLabel={translate('workspace.distanceRates.trackTax')}
                                            onToggle={onToggleTrackTax}
                                            disabled={!canWriteDistanceRates || !isPolicyTrackTaxEnabled}
                                            disabledAction={withReadOnlyFallback()}
                                            showLockIcon={!canWriteDistanceRates}
                                        />
                                    </View>
                                </View>
                                {!isPolicyTrackTaxEnabled && (
                                    <View style={[styles.mh5]}>
                                        <RenderHTML
                                            html={translate('workspace.distanceRates.taxFeatureNotEnabledMessage')}
                                            onLinkPress={() => {
                                                Navigation.dismissModal();
                                                Navigation.isNavigationReady().then(() => {
                                                    Navigation.goBack(ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID));
                                                });
                                            }}
                                        />
                                    </View>
                                )}
                            </OfflineWithFeedback>
                        </View>
                    </ScrollView>
                </FullPageBlockingView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default PolicyDistanceRatesSettingsPage;
