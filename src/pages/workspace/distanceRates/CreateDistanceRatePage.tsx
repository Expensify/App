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
import {setMoneyRequestDistanceRate} from '@libs/actions/IOU';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getOptimisticRateName, validateRateValue} from '@libs/PolicyDistanceRatesUtils';
import {getDistanceRateCustomUnit} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {createPolicyDistanceRate} from '@userActions/Policy/DistanceRate';
import {generateCustomUnitID} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/PolicyCreateDistanceRateForm';
import type {Rate} from '@src/types/onyx/Policy';

type CreateDistanceRatePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CREATE_DISTANCE_RATE>;

function CreateDistanceRatePage({
    route: {
        params: {policyID, transactionID, reportID},
    },
}: CreateDistanceRatePageProps) {
    const styles = useThemeStyles();
    const {translate, toLocaleDigit} = useLocalize();
    const policy = usePolicy(policyID);
    const currency = policy?.outputCurrency ?? CONST.CURRENCY.USD;
    const customUnit = getDistanceRateCustomUnit(policy);
    const customUnitID = customUnit?.customUnitID;
    const customUnitRateID = generateCustomUnitID();
    const {inputCallbackRef} = useAutoFocusInput();
    const isDistanceRateUpgrade = transactionID && reportID;

    const FullPageBlockingView = !customUnitID ? FullPageOfflineBlockingView : View;

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.POLICY_CREATE_DISTANCE_RATE_FORM>) => validateRateValue(values, toLocaleDigit, translate),
        [toLocaleDigit, translate],
    );

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.POLICY_CREATE_DISTANCE_RATE_FORM>) => {
        // A blocking view is shown when customUnitID is undefined, so this function should never be called
        if (!customUnitID) {
            return;
        }

        const newRate: Rate = {
            currency,
            name: getOptimisticRateName(customUnit?.rates ?? {}),
            rate: parseFloat(values.rate) * CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET,
            customUnitRateID,
            enabled: true,
        };

        createPolicyDistanceRate(policyID, customUnitID, newRate);
        if (isDistanceRateUpgrade) {
            setMoneyRequestDistanceRate(transactionID, customUnitRateID, policy, true);
            Navigation.goBack(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, transactionID, reportID), {compareParams: false});
            return;
        }
        Navigation.goBack();
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="CreateDistanceRatePage"
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton title={isDistanceRateUpgrade ? translate('common.rate') : translate('workspace.distanceRates.addRate')} />
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
                        addBottomSafeAreaPadding
                    >
                        <InputWrapperWithRef
                            InputComponent={AmountForm}
                            inputID={INPUT_IDS.RATE}
                            decimals={CONST.MAX_TAX_RATE_DECIMAL_PLACES}
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

export default CreateDistanceRatePage;
