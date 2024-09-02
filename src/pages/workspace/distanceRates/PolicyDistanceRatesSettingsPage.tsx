import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import type {ListItem} from '@components/SelectionList/types';
import Switch from '@components/Switch';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import type {UnitItemType} from '@components/UnitPicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as Category from '@userActions/Policy/Category';
import * as DistanceRate from '@userActions/Policy/DistanceRate';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {CustomUnit} from '@src/types/onyx/Policy';
import CategorySelector from './CategorySelector';
import UnitSelector from './UnitSelector';

type PolicyDistanceRatesSettingsPageOnyxProps = {
    /** Policy details */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Policy categories */
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
};

type PolicyDistanceRatesSettingsPageProps = PolicyDistanceRatesSettingsPageOnyxProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DISTANCE_RATES_SETTINGS>;

function PolicyDistanceRatesSettingsPage({policy, policyCategories, route}: PolicyDistanceRatesSettingsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = route.params.policyID;
    const customUnits = policy?.customUnits ?? {};
    const customUnit = customUnits[Object.keys(customUnits)[0]];
    const customUnitID = customUnit?.customUnitID ?? '';
    const isDistanceTrackTaxEnabled = !!customUnit?.attributes?.taxEnabled;
    const isPolicyTrackTaxEnabled = !!policy?.tax?.trackingEnabled;

    const defaultCategory = customUnits[customUnitID]?.defaultCategory;
    const defaultUnit = customUnits[customUnitID]?.attributes?.unit;
    const errorFields = customUnits[customUnitID]?.errorFields;

    const FullPageBlockingView = !customUnit ? FullPageOfflineBlockingView : View;

    const setNewUnit = (unit: UnitItemType) => {
        const attributes = {...customUnits[customUnitID].attributes, unit: unit.value};
        DistanceRate.setPolicyDistanceRatesUnit(policyID, customUnit, {...customUnit, attributes});
    };

    const setNewCategory = (category: ListItem) => {
        if (!category.searchText) {
            return;
        }

        Category.setPolicyDistanceRatesDefaultCategory(policyID, customUnit, {
            ...customUnit,
            defaultCategory: defaultCategory === category.searchText ? '' : category.searchText,
        });
    };

    const clearErrorFields = (fieldName: keyof CustomUnit) => {
        DistanceRate.clearPolicyDistanceRatesErrorFields(policyID, customUnitID, {...errorFields, [fieldName]: null});
    };

    const onToggleTrackTax = (isOn: boolean) => {
        const attributes = {...customUnits[customUnitID].attributes, taxEnabled: isOn};
        Policy.enableDistanceRequestTax(policyID, customUnit?.name, customUnitID, attributes);
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
                testID={PolicyDistanceRatesSettingsPage.displayName}
            >
                <HeaderWithBackButton title={translate('workspace.common.settings')} />
                <FullPageBlockingView style={customUnit ? styles.flexGrow1 : []}>
                    <ScrollView contentContainerStyle={styles.flexGrow1}>
                        <View>
                            {defaultUnit && (
                                <OfflineWithFeedback
                                    errors={ErrorUtils.getLatestErrorField(customUnits[customUnitID] ?? {}, 'attributes')}
                                    pendingAction={customUnits[customUnitID]?.pendingFields?.attributes}
                                    errorRowStyles={styles.mh5}
                                    onClose={() => clearErrorFields('attributes')}
                                >
                                    <UnitSelector
                                        label={translate('workspace.distanceRates.unit')}
                                        defaultValue={defaultUnit}
                                        wrapperStyle={[styles.ph5, styles.mt3]}
                                        setNewUnit={setNewUnit}
                                    />
                                </OfflineWithFeedback>
                            )}
                            {policy?.areCategoriesEnabled && OptionsListUtils.hasEnabledOptions(policyCategories ?? {}) && (
                                <OfflineWithFeedback
                                    errors={ErrorUtils.getLatestErrorField(customUnits[customUnitID] ?? {}, 'defaultCategory')}
                                    pendingAction={customUnits[customUnitID]?.pendingFields?.defaultCategory}
                                    errorRowStyles={styles.mh5}
                                    onClose={() => clearErrorFields('defaultCategory')}
                                >
                                    <CategorySelector
                                        policyID={policyID}
                                        label={translate('workspace.distanceRates.defaultCategory')}
                                        defaultValue={defaultCategory}
                                        wrapperStyle={[styles.ph5, styles.mt3]}
                                        setNewCategory={setNewCategory}
                                    />
                                </OfflineWithFeedback>
                            )}
                            <OfflineWithFeedback
                                errors={ErrorUtils.getLatestErrorField(customUnits[customUnitID] ?? {}, 'taxEnabled')}
                                errorRowStyles={styles.mh5}
                                pendingAction={customUnits[customUnitID]?.pendingFields?.taxEnabled}
                            >
                                <View style={[styles.mt2, styles.mh5]}>
                                    <View style={[styles.flexRow, styles.mb2, styles.mr2, styles.alignItemsCenter, styles.justifyContentBetween]}>
                                        <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.distanceRates.trackTax')}</Text>
                                        <Switch
                                            isOn={isDistanceTrackTaxEnabled && isPolicyTrackTaxEnabled}
                                            accessibilityLabel={translate('workspace.distanceRates.trackTax')}
                                            onToggle={onToggleTrackTax}
                                            disabled={!isPolicyTrackTaxEnabled}
                                        />
                                    </View>
                                </View>
                                {!isPolicyTrackTaxEnabled && (
                                    <View style={[styles.mh5]}>
                                        <Text style={styles.colorMuted}>
                                            {translate('workspace.distanceRates.taxFeatureNotEnabledMessage')}
                                            <TextLink
                                                onPress={() => {
                                                    Navigation.dismissModal();
                                                    Navigation.goBack(ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID));
                                                }}
                                            >
                                                {translate('workspace.common.moreFeatures')}
                                            </TextLink>
                                            {translate('workspace.distanceRates.changePromptMessage')}
                                        </Text>
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

PolicyDistanceRatesSettingsPage.displayName = 'PolicyDistanceRatesSettingsPage';

export default withOnyx<PolicyDistanceRatesSettingsPageProps, PolicyDistanceRatesSettingsPageOnyxProps>({
    policy: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY}${route.params.policyID}`,
    },
    policyCategories: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${route.params.policyID}`,
    },
})(PolicyDistanceRatesSettingsPage);
