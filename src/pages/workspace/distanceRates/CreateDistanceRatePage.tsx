import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import AmountForm from '@components/AmountForm';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import FormProvider from '@components/Form/FormProvider';
import InputWrapperWithRef from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {getOptimisticRateName, validateRateValue} from '@libs/PolicyDistanceRatesUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {createPolicyDistanceRate} from '@userActions/Policy/DistanceRate';
import {generateCustomUnitID} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/PolicyCreateDistanceRateForm';
import type {Rate} from '@src/types/onyx/Policy';

type CreateDistanceRatePageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CREATE_DISTANCE_RATE>;

function CreateDistanceRatePage({route}: CreateDistanceRatePageProps) {
    const styles = useThemeStyles();
    const {translate, toLocaleDigit} = useLocalize();
    const policyID = route.params.policyID;
    const policy = usePolicy(policyID);
    const currency = policy?.outputCurrency ?? CONST.CURRENCY.USD;
    const customUnits = policy?.customUnits ?? {};
    const customUnitID = customUnits[Object.keys(customUnits)[0]]?.customUnitID ?? '';
    const customUnitRateID = generateCustomUnitID();
    const {inputCallbackRef} = useAutoFocusInput();

    const FullPageBlockingView = !customUnitID ? FullPageOfflineBlockingView : View;

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.POLICY_CREATE_DISTANCE_RATE_FORM>) => validateRateValue(values, currency, toLocaleDigit),
        [currency, toLocaleDigit],
    );

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.POLICY_CREATE_DISTANCE_RATE_FORM>) => {
        const newRate: Rate = {
            currency,
            name: getOptimisticRateName(customUnits[customUnitID]?.rates),
            rate: parseFloat(values.rate) * CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET,
            customUnitRateID,
            enabled: true,
        };

        createPolicyDistanceRate(policyID, customUnitID, newRate);
        Navigation.goBack();
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
                testID={CreateDistanceRatePage.displayName}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton title={translate('workspace.distanceRates.addRate')} />
                <FullPageBlockingView style={[styles.flexGrow1]}>
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
                            fixedDecimals={CONST.MAX_TAX_RATE_DECIMAL_PLACES}
                            isCurrencyPressable={false}
                            currency={currency}
                            ref={inputCallbackRef}
                        />
                    </FormProvider>
                </FullPageBlockingView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

CreateDistanceRatePage.displayName = 'CreateDistanceRatePage';

export default CreateDistanceRatePage;
