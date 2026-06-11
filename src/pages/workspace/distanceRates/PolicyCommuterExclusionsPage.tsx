import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
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
    footerContent?: React.ReactNode;
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
        existingMethod === CONST.POLICY.COMMUTER_EXCLUSION_METHOD.FIXED_DISTANCE ? CONST.POLICY.COMMUTER_EXCLUSION_METHOD.FIXED_DISTANCE : CONST.POLICY.COMMUTER_EXCLUSION_TYPE.DISABLED,
    );
    const [fixedDistanceInput, setFixedDistanceInput] = useState<string>(() => (existingCommuterExclusions?.fixedDistance != null ? String(existingCommuterExclusions.fixedDistance) : ''));
    const [inlineError, setInlineError] = useState<string>('');

    // Lowercased to match design copy ("miles" / "kilometers"); the existing translation keys are already lowercase.
    const unitLabel = translate(getUnitTranslationKey(workspaceUnit));

    const goBackToSettings = useCallback(() => {
        Navigation.goBack(ROUTES.WORKSPACE_DISTANCE_RATES_SETTINGS.getRoute(policyID));
    }, [policyID]);

    const onSelectRow = (item: ExclusionOption) => {
        if (item.keyForList === selectedKey) {
            return;
        }
        setSelectedKey(item.keyForList);
        setInlineError('');

        if (item.keyForList === CONST.POLICY.COMMUTER_EXCLUSION_TYPE.DISABLED && existingMethod) {
            disablePolicyCommuterExclusions(policyID, existingCommuterExclusions);
            goBackToSettings();
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
            goBackToSettings();
            return;
        }

        setPolicyCommuterExclusions(policyID, CONST.POLICY.COMMUTER_EXCLUSION_METHOD.FIXED_DISTANCE, numeric, workspaceUnit, existingCommuterExclusions);
        goBackToSettings();
    };

    const isFixedDistanceSelected = selectedKey === CONST.POLICY.COMMUTER_EXCLUSION_METHOD.FIXED_DISTANCE;

    // Renders the distance input right below the fixed-distance option so the form reads naturally
    // (matches the existing footerContent pattern used by WorkspaceAutoReportingFrequencyPage).
    const fixedDistanceFooter = (
        <View style={[styles.ph5, styles.pt3, styles.pb3]}>
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
                suffixStyle={styles.colorMuted}
                role={CONST.ROLE.PRESENTATION}
                autoFocus={existingMethod !== CONST.POLICY.COMMUTER_EXCLUSION_METHOD.FIXED_DISTANCE}
            />
            {!!inlineError && <FormHelpMessage message={inlineError} />}
        </View>
    );

    const options: ExclusionOption[] = [
        {
            text: translate('workspace.distanceRates.commuterExclusions.optionDisabledTitle'),
            alternateText: translate('workspace.distanceRates.commuterExclusions.optionDisabledHelp'),
            keyForList: CONST.POLICY.COMMUTER_EXCLUSION_TYPE.DISABLED,
            isSelected: selectedKey === CONST.POLICY.COMMUTER_EXCLUSION_TYPE.DISABLED,
        },
        {
            text: translate('workspace.distanceRates.commuterExclusions.optionFixedDistanceTitle'),
            alternateText: translate('workspace.distanceRates.commuterExclusions.optionFixedDistanceHelp'),
            keyForList: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.FIXED_DISTANCE,
            isSelected: isFixedDistanceSelected,
            footerContent: isFixedDistanceSelected ? fixedDistanceFooter : null,
        },
    ];

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
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.distanceRates.commuterExclusions.title')}
                    onBackButtonPress={goBackToSettings}
                />
                <OfflineWithFeedback
                    errors={getLatestErrorField(policy ?? {}, 'commuterExclusions')}
                    pendingAction={policy?.pendingFields?.commuterExclusions}
                    errorRowStyles={styles.mh5}
                    onClose={() => clearPolicyCommuterExclusionsErrors(policyID)}
                    style={styles.flex1}
                    contentContainerStyle={styles.flex1}
                >
                    <SelectionList
                        ListItem={SingleSelectListItem}
                        data={options}
                        onSelectRow={onSelectRow}
                        initiallyFocusedItemKey={selectedKey}
                        shouldSingleExecuteRowSelect
                        shouldUpdateFocusedIndex
                    />
                </OfflineWithFeedback>
                {isFixedDistanceSelected && (
                    <FixedFooter addBottomSafeAreaPadding>
                        <Button
                            success
                            large
                            text={translate('common.save')}
                            onPress={onSave}
                        />
                    </FixedFooter>
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default PolicyCommuterExclusionsPage;
