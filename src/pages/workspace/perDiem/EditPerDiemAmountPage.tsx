import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import AmountWithoutCurrencyForm from '@components/AmountWithoutCurrencyForm';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToBackendAmount, convertToFrontendAmountAsString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getPerDiemCustomUnit} from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as PerDiem from '@userActions/Policy/PerDiem';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspacePerDiemForm';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type EditPerDiemAmountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.PER_DIEM_EDIT_AMOUNT>;

function EditPerDiemAmountPage({route}: EditPerDiemAmountPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = route.params.policyID;
    const rateID = route.params.rateID;
    const subRateID = route.params.subRateID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    const customUnit = getPerDiemCustomUnit(policy);

    const selectedRate = customUnit?.rates?.[rateID];
    const selectedSubrate = selectedRate?.subRates?.find((subRate) => subRate.id === subRateID);

    const defaultAmount = selectedSubrate?.rate ? convertToFrontendAmountAsString(Number(selectedSubrate.rate)) : undefined;

    const {inputCallbackRef} = useAutoFocusInput();

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_PER_DIEM_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_PER_DIEM_FORM> => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_PER_DIEM_FORM> = {};

            const newAmount = values.amount.trim();
            const backendAmount = newAmount ? convertToBackendAmount(Number(newAmount)) : 0;

            if (backendAmount === 0) {
                errors.amount = translate('common.error.fieldRequired');
            }

            return errors;
        },
        [translate],
    );

    const editAmount = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_PER_DIEM_FORM>) => {
            const newAmount = values.amount.trim();
            const backendAmount = newAmount ? convertToBackendAmount(Number(newAmount)) : 0;
            if (backendAmount !== Number(selectedSubrate?.rate)) {
                PerDiem.editPerDiemRateAmount(policyID, rateID, subRateID, customUnit, backendAmount);
            }
            Navigation.goBack(ROUTES.WORKSPACE_PER_DIEM_DETAILS.getRoute(policyID, rateID, subRateID));
        },
        [selectedSubrate?.rate, policyID, rateID, subRateID, customUnit],
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED}
            shouldBeBlocked={!policyID || !rateID || isEmptyObject(selectedRate) || isEmptyObject(selectedSubrate)}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom
                style={[styles.defaultModalContainer]}
                testID={EditPerDiemAmountPage.displayName}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.perDiem.amount')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_PER_DIEM_DETAILS.getRoute(policyID, rateID, subRateID))}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.WORKSPACE_PER_DIEM_FORM}
                    validate={validate}
                    onSubmit={editAmount}
                    submitButtonText={translate('common.save')}
                    style={[styles.mh5, styles.flex1]}
                    enabledWhenOffline
                >
                    <InputWrapper
                        ref={inputCallbackRef}
                        InputComponent={AmountWithoutCurrencyForm}
                        defaultValue={defaultAmount}
                        label={translate('workspace.perDiem.amount')}
                        accessibilityLabel={translate('workspace.perDiem.amount')}
                        inputID={INPUT_IDS.AMOUNT}
                        role={CONST.ROLE.PRESENTATION}
                        shouldAllowNegative
                    />
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

EditPerDiemAmountPage.displayName = 'EditPerDiemAmountPage';

export default EditPerDiemAmountPage;
