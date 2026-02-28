import React, {useCallback} from 'react';
import {Keyboard} from 'react-native';
import AmountForm from '@components/AmountForm';
import FormProvider from '@components/Form/FormProvider';
import InputWrapperWithRef from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {validateRateValue} from '@libs/PolicyDistanceRatesUtils';
import {getDistanceRateCustomUnit} from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {updatePolicyDistanceRateValue} from '@userActions/Policy/DistanceRate';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/PolicyDistanceRateEditForm';

type PolicyDistanceRateEditPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DISTANCE_RATE_EDIT>;

function PolicyDistanceRateEditPage({route}: PolicyDistanceRateEditPageProps) {
    const styles = useThemeStyles();
    const {translate, toLocaleDigit} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();

    const policyID = route.params.policyID;
    const rateID = route.params.rateID;
    const policy = usePolicy(policyID);
    const customUnit = getDistanceRateCustomUnit(policy);
    const rate = customUnit?.rates[rateID];
    const currency = rate?.currency ?? CONST.CURRENCY.USD;
    const currentRateValue = (parseFloat((rate?.rate ?? 0).toString()) / CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET).toFixed(CONST.MAX_TAX_RATE_DECIMAL_PLACES);

    const submitRate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.POLICY_DISTANCE_RATE_EDIT_FORM>) => {
        if (currentRateValue === values.rate) {
            Navigation.goBack();
            return;
        }
        if (!customUnit || !rate) {
            return;
        }
        updatePolicyDistanceRateValue(policyID, customUnit, [{...rate, rate: Number(values.rate) * CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET}]);
        Keyboard.dismiss();
        Navigation.goBack();
    };

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.POLICY_DISTANCE_RATE_EDIT_FORM>) => validateRateValue(values, toLocaleDigit, translate),
        [toLocaleDigit, translate],
    );

    if (!rate) {
        return <NotFoundPage />;
    }

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="PolicyDistanceRateEditPage"
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.distanceRates.rate')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.POLICY_DISTANCE_RATE_EDIT_FORM}
                    submitButtonText={translate('common.save')}
                    onSubmit={submitRate}
                    validate={validate}
                    enabledWhenOffline
                    style={[styles.flexGrow1]}
                    shouldHideFixErrorsAlert
                    submitFlexEnabled={false}
                    submitButtonStyles={[styles.mh5, styles.mt0]}
                    addBottomSafeAreaPadding
                >
                    <InputWrapperWithRef
                        InputComponent={AmountForm}
                        inputID={INPUT_IDS.RATE}
                        decimals={CONST.MAX_TAX_RATE_DECIMAL_PLACES}
                        defaultValue={currentRateValue}
                        isCurrencyPressable={false}
                        currency={currency}
                        ref={inputCallbackRef}
                    />
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default PolicyDistanceRateEditPage;
