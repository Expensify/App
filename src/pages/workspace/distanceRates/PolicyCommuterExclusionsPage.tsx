import {Str} from 'expensify-common';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getDistanceRateCustomUnit} from '@libs/PolicyUtils';
import {getUnitTranslationKey} from '@libs/WorkspacesSettingsUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {clearPolicyCommuterExclusionsErrors, disablePolicyCommuterExclusions, setPolicyCommuterExclusions} from '@userActions/Policy/DistanceRate';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type PolicyCommuterExclusionsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DISTANCE_RATES_COMMUTER_EXCLUSIONS>;

type ExclusionOptionKey = 'disabled' | typeof CONST.POLICY.COMMUTER_EXCLUSION_METHOD.FIXED_DISTANCE;

type ExclusionOption = {
    text: string;
    alternateText: string;
    keyForList: ExclusionOptionKey;
    isSelected: boolean;
};

function PolicyCommuterExclusionsPage({route}: PolicyCommuterExclusionsPageProps) {
    const policyID = route.params.policyID;
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const customUnit = getDistanceRateCustomUnit(policy);
    const workspaceUnit = customUnit?.attributes?.unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES;

    const existingCommuterExclusions = policy?.commuterExclusions;
    const existingMethod = existingCommuterExclusions?.method;

    const [selectedKey, setSelectedKey] = useState<ExclusionOptionKey>(
        existingMethod === CONST.POLICY.COMMUTER_EXCLUSION_METHOD.FIXED_DISTANCE ? CONST.POLICY.COMMUTER_EXCLUSION_METHOD.FIXED_DISTANCE : 'disabled',
    );
    const [fixedDistanceInput, setFixedDistanceInput] = useState<string>(existingCommuterExclusions?.fixedDistance != null ? String(existingCommuterExclusions.fixedDistance) : '');
    const [inlineError, setInlineError] = useState<string>('');

    const unitLabel = useMemo(() => Str.recapitalize(translate(getUnitTranslationKey(workspaceUnit))), [translate, workspaceUnit]);

    const options: ExclusionOption[] = [
        {
            text: translate('workspace.distanceRates.commuterExclusions.optionDisabledTitle'),
            alternateText: translate('workspace.distanceRates.commuterExclusions.optionDisabledHelp'),
            keyForList: 'disabled',
            isSelected: selectedKey === 'disabled',
        },
        {
            text: translate('workspace.distanceRates.commuterExclusions.optionFixedDistanceTitle'),
            alternateText: translate('workspace.distanceRates.commuterExclusions.optionFixedDistanceHelp'),
            keyForList: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.FIXED_DISTANCE,
            isSelected: selectedKey === CONST.POLICY.COMMUTER_EXCLUSION_METHOD.FIXED_DISTANCE,
        },
    ];

    const onSelectRow = (item: ExclusionOption) => {
        setSelectedKey(item.keyForList);
        setInlineError('');

        if (item.keyForList === 'disabled' && existingMethod) {
            disablePolicyCommuterExclusions(policyID, existingCommuterExclusions);
            Navigation.goBack(ROUTES.WORKSPACE_DISTANCE_RATES_SETTINGS.getRoute(policyID));
        }
    };

    const onSave = () => {
        const trimmed = fixedDistanceInput.trim();
        const numeric = Number(trimmed);

        if (!trimmed || Number.isNaN(numeric) || numeric <= 0) {
            setInlineError(translate('workspace.distanceRates.commuterExclusions.errors.distanceMustBePositive'));
            return;
        }

        // No-op when nothing changed - matches the server-side idempotency check.
        if (existingMethod === CONST.POLICY.COMMUTER_EXCLUSION_METHOD.FIXED_DISTANCE && existingCommuterExclusions?.fixedDistance === numeric) {
            Navigation.goBack(ROUTES.WORKSPACE_DISTANCE_RATES_SETTINGS.getRoute(policyID));
            return;
        }

        setPolicyCommuterExclusions(policyID, CONST.POLICY.COMMUTER_EXCLUSION_METHOD.FIXED_DISTANCE, numeric, workspaceUnit, existingCommuterExclusions);
        Navigation.goBack(ROUTES.WORKSPACE_DISTANCE_RATES_SETTINGS.getRoute(policyID));
    };

    const showFixedDistanceForm = selectedKey === CONST.POLICY.COMMUTER_EXCLUSION_METHOD.FIXED_DISTANCE;

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="PolicyCommuterExclusionsPage"
            >
                <HeaderWithBackButton
                    title={translate('workspace.distanceRates.commuterExclusions.title')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_DISTANCE_RATES_SETTINGS.getRoute(policyID))}
                />
                <OfflineWithFeedback
                    errors={getLatestErrorField(policy ?? {}, 'commuterExclusions')}
                    pendingAction={policy?.pendingFields?.commuterExclusions}
                    errorRowStyles={styles.mh5}
                    onClose={() => clearPolicyCommuterExclusionsErrors(policyID)}
                    style={styles.flex1}
                    contentContainerStyle={styles.flex1}
                >
                    <ScrollView
                        contentContainerStyle={styles.flexGrow1}
                        keyboardShouldPersistTaps="always"
                        addBottomSafeAreaPadding
                    >
                        <SelectionList
                            ListItem={SingleSelectListItem}
                            data={options}
                            onSelectRow={onSelectRow}
                            initiallyFocusedItemKey={selectedKey}
                            shouldSingleExecuteRowSelect
                            shouldUpdateFocusedIndex
                        />
                        {showFixedDistanceForm && (
                            <View style={[styles.mh5, styles.mt3]}>
                                <TextInput
                                    label={translate('workspace.distanceRates.commuterExclusions.distanceLabel')}
                                    accessibilityLabel={translate('workspace.distanceRates.commuterExclusions.distanceLabel')}
                                    value={fixedDistanceInput}
                                    onChangeText={(value) => {
                                        setFixedDistanceInput(value);
                                        if (inlineError) {
                                            setInlineError('');
                                        }
                                    }}
                                    keyboardType={CONST.KEYBOARD_TYPE.DECIMAL_PAD}
                                    suffixCharacter={unitLabel}
                                    role={CONST.ROLE.PRESENTATION}
                                    autoFocus={existingMethod !== CONST.POLICY.COMMUTER_EXCLUSION_METHOD.FIXED_DISTANCE}
                                />
                                {!!inlineError && <FormHelpMessage message={inlineError} />}
                                <Button
                                    success
                                    large
                                    style={styles.mt3}
                                    text={translate('common.save')}
                                    onPress={onSave}
                                />
                            </View>
                        )}
                    </ScrollView>
                </OfflineWithFeedback>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default PolicyCommuterExclusionsPage;
