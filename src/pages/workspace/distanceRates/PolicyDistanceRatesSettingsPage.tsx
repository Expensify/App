import React, {useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import CategorySelector from '@components/CategorySelector';
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
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import {getDistanceRateCustomUnit} from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as Category from '@userActions/Policy/Category';
import * as DistanceRate from '@userActions/Policy/DistanceRate';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {CustomUnit} from '@src/types/onyx/Policy';
import UnitSelector from './UnitSelector';

type PolicyDistanceRatesSettingsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DISTANCE_RATES_SETTINGS>;

function PolicyDistanceRatesSettingsPage({route}: PolicyDistanceRatesSettingsPageProps) {
    const policyID = route.params.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);

    const styles = useThemeStyles();
    const [isCategoryPickerVisible, setIsCategoryPickerVisible] = useState(false);
    const {translate} = useLocalize();
    const customUnit = getDistanceRateCustomUnit(policy);
    const customUnitID = customUnit?.customUnitID ?? '';
    const isDistanceTrackTaxEnabled = !!customUnit?.attributes?.taxEnabled;
    const isPolicyTrackTaxEnabled = !!policy?.tax?.trackingEnabled;

    const defaultCategory = customUnit?.defaultCategory;
    const defaultUnit = customUnit?.attributes?.unit;
    const errorFields = customUnit?.errorFields;

    const FullPageBlockingView = !customUnit ? FullPageOfflineBlockingView : View;

    const setNewUnit = (unit: UnitItemType) => {
        if (!customUnit) {
            return;
        }
        const attributes = {...customUnit?.attributes, unit: unit.value};
        DistanceRate.setPolicyDistanceRatesUnit(policyID, customUnit, {...customUnit, attributes});
    };

    const setNewCategory = (category: ListItem) => {
        if (!category.searchText || !customUnit || defaultCategory === category.searchText) {
            return;
        }

        Category.setPolicyCustomUnitDefaultCategory(policyID, customUnitID, customUnit.defaultCategory, category.searchText);
    };

    const clearErrorFields = (fieldName: keyof CustomUnit) => {
        DistanceRate.clearPolicyDistanceRatesErrorFields(policyID, customUnitID, {...errorFields, [fieldName]: null});
    };

    const onToggleTrackTax = (isOn: boolean) => {
        if (!customUnit || !customUnit.attributes) {
            return;
        }
        const attributes = {...customUnit?.attributes, taxEnabled: isOn};
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
                    <ScrollView
                        contentContainerStyle={styles.flexGrow1}
                        keyboardShouldPersistTaps="always"
                    >
                        <View>
                            {!!defaultUnit && (
                                <OfflineWithFeedback
                                    errors={ErrorUtils.getLatestErrorField(customUnit ?? {}, 'attributes')}
                                    pendingAction={customUnit?.pendingFields?.attributes}
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
                            {!!policy?.areCategoriesEnabled && OptionsListUtils.hasEnabledOptions(policyCategories ?? {}) && (
                                <OfflineWithFeedback
                                    errors={ErrorUtils.getLatestErrorField(customUnit ?? {}, 'defaultCategory')}
                                    pendingAction={customUnit?.pendingFields?.defaultCategory}
                                    errorRowStyles={styles.mh5}
                                    onClose={() => clearErrorFields('defaultCategory')}
                                >
                                    <CategorySelector
                                        policyID={policyID}
                                        label={translate('workspace.common.defaultCategory')}
                                        defaultValue={defaultCategory}
                                        wrapperStyle={[styles.ph5, styles.mt3]}
                                        setNewCategory={setNewCategory}
                                        isPickerVisible={isCategoryPickerVisible}
                                        showPickerModal={() => setIsCategoryPickerVisible(true)}
                                        hidePickerModal={() => setIsCategoryPickerVisible(false)}
                                    />
                                </OfflineWithFeedback>
                            )}
                            <OfflineWithFeedback
                                errors={ErrorUtils.getLatestErrorField(customUnit ?? {}, 'taxEnabled')}
                                errorRowStyles={styles.mh5}
                                pendingAction={customUnit?.pendingFields?.taxEnabled}
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

export default PolicyDistanceRatesSettingsPage;
