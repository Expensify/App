import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import AmountForm from '@components/AmountForm';
import FormProvider from '@components/Form/FormProvider';
import InputWrapperWithRef from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import getPermittedDecimalSeparator from '@libs/getPermittedDecimalSeparator';
import * as MoneyRequestUtils from '@libs/MoneyRequestUtils';
import * as NumberUtils from '@libs/NumberUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import {createPolicyDistanceRate, generateCustomUnitID} from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/PolicyCreateDistanceRateForm';
import type {Rate} from '@src/types/onyx/Policy';
import type Policy from '@src/types/onyx/Policy';

type CreateDistanceRatePageOnyxProps = {
    policy: OnyxEntry<Policy>;
};

type CreateDistanceRatePageProps = CreateDistanceRatePageOnyxProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CREATE_DISTANCE_RATE>;

function CreateDistanceRatePage({policy, route}: CreateDistanceRatePageProps) {
    const styles = useThemeStyles();
    const {translate, toLocaleDigit} = useLocalize();
    const currency = policy !== null ? policy?.outputCurrency : CONST.CURRENCY.USD;
    const customUnits = policy?.customUnits ?? {};
    const customUnitID = customUnits[Object.keys(customUnits)[0]]?.customUnitID ?? '';
    const customUnitRateID = generateCustomUnitID();

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.POLICY_CREATE_DISTANCE_RATE_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.POLICY_CREATE_DISTANCE_RATE_FORM> => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.POLICY_CREATE_DISTANCE_RATE_FORM> = {};
        const rate = values.rate;
        const parsedRate = MoneyRequestUtils.replaceAllDigits(rate, toLocaleDigit);
        const decimalSeparator = toLocaleDigit('.');

        // Allow one more decimal place for accuracy
        const rateValueRegex = RegExp(String.raw`^-?\d{0,8}([${getPermittedDecimalSeparator(decimalSeparator)}]\d{1,${CurrencyUtils.getCurrencyDecimals(currency) + 1}})?$`, 'i');
        if (!rateValueRegex.test(parsedRate) || parsedRate === '') {
            errors.rate = 'workspace.reimburse.invalidRateError';
        } else if (NumberUtils.parseFloatAnyLocale(parsedRate) <= 0) {
            errors.rate = 'workspace.reimburse.lowRateError';
        }
        return errors;
    };

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.POLICY_CREATE_DISTANCE_RATE_FORM>) => {
        const newRate: Rate = {
            currency,
            name: CONST.CUSTOM_UNITS.DEFAULT_RATE,
            rate: parseFloat(values.rate) * CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET,
            customUnitRateID,
            enabled: true,
        };

        createPolicyDistanceRate(route.params.policyID, customUnitID, newRate);
        Navigation.goBack();
    };

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
                <ScreenWrapper
                    includeSafeAreaPaddingBottom={false}
                    style={[styles.defaultModalContainer]}
                    testID={CreateDistanceRatePage.displayName}
                >
                    <HeaderWithBackButton title={translate('workspace.distanceRates.addRate')} />
                    <FormProvider
                        formID={ONYXKEYS.FORMS.POLICY_CREATE_DISTANCE_RATE_FORM}
                        submitButtonText={translate('common.save')}
                        onSubmit={submit}
                        validate={validate}
                        enabledWhenOffline
                        style={[styles.flexGrow1]}
                        shouldHideFixErrorsAlert
                        submitFlexEnabled={false}
                        submitButtonStyles={[styles.mh5, styles.mt0]}
                    >
                        <InputWrapperWithRef
                            InputComponent={AmountForm}
                            inputID={INPUT_IDS.RATE}
                            extraDecimals={1}
                            isCurrencyPressable={false}
                            currency={currency}
                        />
                    </FormProvider>
                </ScreenWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

CreateDistanceRatePage.displayName = 'CreateDistanceRatePage';

export default withOnyx<CreateDistanceRatePageProps, CreateDistanceRatePageOnyxProps>({
    policy: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY}${route.params.policyID}`,
    },
})(CreateDistanceRatePage);
