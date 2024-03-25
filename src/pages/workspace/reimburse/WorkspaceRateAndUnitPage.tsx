import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect} from 'react';
import {Keyboard, View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Picker from '@components/Picker';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import getPermittedDecimalSeparator from '@libs/getPermittedDecimalSeparator';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as NumberUtils from '@libs/NumberUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import * as BankAccounts from '@userActions/BankAccounts';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Unit} from '@src/types/onyx/Policy';

type WorkspaceRateAndUnitPageProps = WithPolicyProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RATE_AND_UNIT>;

type ValidationError = {rate?: TranslationPaths | undefined};

function WorkspaceRateAndUnitPage({policy, route}: WorkspaceRateAndUnitPageProps) {
    const {translate, toLocaleDigit} = useLocalize();
    const styles = useThemeStyles();

    useEffect(() => {
        if ((policy?.customUnits ?? []).length !== 0) {
            return;
        }

        BankAccounts.setReimbursementAccountLoading(true);
        Policy.openWorkspaceReimburseView(policy?.id ?? '');
    }, [policy?.customUnits, policy?.id]);

    const unitItems = [
        {label: translate('common.kilometers'), value: CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS},
        {label: translate('common.miles'), value: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES},
    ];

    const saveUnitAndRate = (unit: Unit, rate: string) => {
        const distanceCustomUnit = Object.values(policy?.customUnits ?? {}).find((customUnit) => customUnit.name === CONST.CUSTOM_UNITS.NAME_DISTANCE);
        if (!distanceCustomUnit) {
            return;
        }
        const currentCustomUnitRate = Object.values(distanceCustomUnit?.rates ?? {}).find((r) => r.name === CONST.CUSTOM_UNITS.DEFAULT_RATE);
        const unitID = distanceCustomUnit.customUnitID ?? '';
        const unitName = distanceCustomUnit.name ?? '';
        const rateNumValue = PolicyUtils.getNumericValue(rate, toLocaleDigit);

        const newCustomUnit: Policy.NewCustomUnit = {
            customUnitID: unitID,
            name: unitName,
            attributes: {unit},
            rates: {
                ...currentCustomUnitRate,
                rate: Number(rateNumValue) * CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET,
            },
        };

        Policy.updateWorkspaceCustomUnitAndRate(policy?.id ?? '', distanceCustomUnit, newCustomUnit, policy?.lastModified);
    };

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_RATE_AND_UNIT_FORM>) => {
        saveUnitAndRate(values.unit as Unit, values.rate);
        Keyboard.dismiss();
        Navigation.goBack(ROUTES.WORKSPACE_REIMBURSE.getRoute(policy?.id ?? ''));
    };

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_RATE_AND_UNIT_FORM>): ValidationError => {
        const errors: ValidationError = {};
        const decimalSeparator = toLocaleDigit('.');
        const outputCurrency = policy?.outputCurrency ?? CONST.CURRENCY.USD;
        // Allow one more decimal place for accuracy
        const rateValueRegex = RegExp(String.raw`^-?\d{0,8}([${getPermittedDecimalSeparator(decimalSeparator)}]\d{1,${CurrencyUtils.getCurrencyDecimals(outputCurrency) + 1}})?$`, 'i');
        if (!rateValueRegex.test(values.rate) || values.rate === '') {
            errors.rate = 'workspace.reimburse.invalidRateError';
        } else if (NumberUtils.parseFloatAnyLocale(values.rate) <= 0) {
            errors.rate = 'workspace.reimburse.lowRateError';
        }
        return errors;
    };

    const distanceCustomUnit = Object.values(policy?.customUnits ?? {}).find((unit) => unit.name === CONST.CUSTOM_UNITS.NAME_DISTANCE);
    const distanceCustomRate = Object.values(distanceCustomUnit?.rates ?? {}).find((rate) => rate.name === CONST.CUSTOM_UNITS.DEFAULT_RATE);

    return (
        <WorkspacePageWithSections
            headerText={translate('workspace.reimburse.trackDistance')}
            route={route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_REIMBURSE}
            shouldSkipVBBACall
            backButtonRoute={ROUTES.WORKSPACE_REIMBURSE.getRoute(policy?.id ?? '')}
            shouldShowLoading={false}
        >
            {() => (
                <FormProvider
                    formID={ONYXKEYS.FORMS.WORKSPACE_RATE_AND_UNIT_FORM}
                    submitButtonText={translate('common.save')}
                    style={[styles.mh5, styles.flexGrow1]}
                    scrollContextEnabled
                    validate={validate}
                    onSubmit={submit}
                    enabledWhenOffline
                >
                    <OfflineWithFeedback
                        errors={{
                            ...(distanceCustomUnit?.errors ?? {}),
                            ...(distanceCustomRate?.errors ?? {}),
                        }}
                        pendingAction={distanceCustomUnit?.pendingAction ?? distanceCustomRate?.pendingAction}
                        onClose={() => Policy.clearCustomUnitErrors(policy?.id ?? '', distanceCustomUnit?.customUnitID ?? '', distanceCustomRate?.customUnitRateID ?? '')}
                    >
                        <InputWrapper
                            InputComponent={TextInput}
                            role={CONST.ROLE.PRESENTATION}
                            inputID="rate"
                            containerStyles={styles.mt4}
                            defaultValue={PolicyUtils.getUnitRateValue(toLocaleDigit, distanceCustomRate)}
                            label={translate('workspace.reimburse.trackDistanceRate')}
                            aria-label={translate('workspace.reimburse.trackDistanceRate')}
                            placeholder={policy?.outputCurrency ?? CONST.CURRENCY.USD}
                            autoCompleteType="off"
                            autoCorrect={false}
                            inputMode={CONST.INPUT_MODE.DECIMAL}
                            maxLength={12}
                        />

                        <View style={styles.mt4}>
                            <InputWrapper
                                InputComponent={Picker}
                                inputID="unit"
                                label={translate('workspace.reimburse.trackDistanceUnit')}
                                items={unitItems}
                                defaultValue={distanceCustomUnit?.attributes.unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES}
                            />
                        </View>
                    </OfflineWithFeedback>
                </FormProvider>
            )}
        </WorkspacePageWithSections>
    );
}

WorkspaceRateAndUnitPage.displayName = 'WorkspaceRateAndUnitPage';

export default withPolicy(WorkspaceRateAndUnitPage);
