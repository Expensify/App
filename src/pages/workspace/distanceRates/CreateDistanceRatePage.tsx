import AmountForm from '@components/AmountForm';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import {setMoneyRequestDistanceRate} from '@libs/actions/IOU/MoneyRequest';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getOptimisticRateName, validateCreateDistanceRateForm, validateRateValue} from '@libs/PolicyDistanceRatesUtils';
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

import React from 'react';
import {View} from 'react-native';

type CreateDistanceRatePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CREATE_DISTANCE_RATE>;

function CreateDistanceRatePage({
    route: {
        params: {policyID, transactionID, reportID, iouType, action},
    },
}: CreateDistanceRatePageProps) {
    const styles = useThemeStyles();
    const {translate, toLocaleDigit} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const isDateBoundMileageRateEnabled = isBetaEnabled(CONST.BETAS.DATE_BOUND_MILEAGE_RATE);
    const policy = usePolicy(policyID);
    const currency = policy?.outputCurrency ?? CONST.CURRENCY.USD;
    const customUnit = getDistanceRateCustomUnit(policy);
    const customUnitID = customUnit?.customUnitID;
    const distanceUnit = customUnit?.attributes?.unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES;
    const unitLabel = translate(distanceUnit === CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES ? 'common.mile' : 'common.kilometer');
    const customUnitRateID = generateCustomUnitID();
    const {inputCallbackRef} = useAutoFocusInput();
    const isDistanceRateUpgrade = transactionID && reportID;
    const [transactionDraft] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${getNonEmptyStringOnyxID(transactionID)}`);

    const existingRateNames = Object.values(customUnit?.rates ?? {}).map((r) => r.name ?? '');

    const FullPageBlockingView = !customUnitID ? FullPageOfflineBlockingView : View;

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.POLICY_CREATE_DISTANCE_RATE_FORM>) => {
        if (isDateBoundMileageRateEnabled) {
            return validateCreateDistanceRateForm(values, toLocaleDigit, translate, existingRateNames);
        }
        return validateRateValue(values, toLocaleDigit, translate);
    };

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.POLICY_CREATE_DISTANCE_RATE_FORM>) => {
        // A blocking view is shown when customUnitID is undefined, so this function should never be called
        if (!customUnitID) {
            return;
        }

        const newRate: Rate = {
            currency,
            name: isDateBoundMileageRateEnabled ? values.name.trim() : getOptimisticRateName(customUnit?.rates ?? {}),
            rate: parseFloat(values.rate) * CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET,
            customUnitRateID,
            enabled: true,
            ...(isDateBoundMileageRateEnabled && values.startDate && {startDate: values.startDate}),
            ...(isDateBoundMileageRateEnabled && values.endDate && {endDate: values.endDate}),
        };

        createPolicyDistanceRate(policyID, customUnitID, newRate);
        if (isDistanceRateUpgrade) {
            const isEdit = action === CONST.IOU.ACTION.EDIT;
            setMoneyRequestDistanceRate(transactionDraft, customUnitRateID, policy, true);
            Navigation.goBack(
                !isEdit
                    ? ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(action ?? CONST.IOU.ACTION.CREATE, iouType ?? CONST.IOU.TYPE.SUBMIT, transactionID, reportID)
                    : ROUTES.MONEY_REQUEST_STEP_DISTANCE_RATE.getRoute(CONST.IOU.ACTION.EDIT, iouType ?? CONST.IOU.TYPE.SUBMIT, transactionID, reportID),
                {compareParams: false},
            );
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
                style={styles.defaultModalContainer}
                testID="CreateDistanceRatePage"
                shouldEnableMaxHeight={!isDateBoundMileageRateEnabled}
                shouldEnableKeyboardAvoidingView={!isDateBoundMileageRateEnabled}
            >
                <HeaderWithBackButton title={isDistanceRateUpgrade ? translate('common.rate') : translate('workspace.distanceRates.addRate')} />
                <FullPageBlockingView style={styles.flexGrow1}>
                    <FormProvider
                        formID={ONYXKEYS.FORMS.POLICY_CREATE_DISTANCE_RATE_FORM}
                        submitButtonText={translate('common.save')}
                        onSubmit={submit}
                        validate={validate}
                        enabledWhenOffline
                        style={isDateBoundMileageRateEnabled ? [styles.mh5, styles.flex1] : styles.flexGrow1}
                        shouldHideFixErrorsAlert={!isDateBoundMileageRateEnabled}
                        {...(isDateBoundMileageRateEnabled ? {} : {submitFlexEnabled: false})}
                        submitButtonStyles={isDateBoundMileageRateEnabled ? [styles.mt0] : [styles.mh5, styles.mt0]}
                        addBottomSafeAreaPadding
                    >
                        {isDateBoundMileageRateEnabled ? (
                            <>
                                <InputWrapper
                                    ref={inputCallbackRef}
                                    InputComponent={TextInput}
                                    inputID={INPUT_IDS.NAME}
                                    label={translate('common.name')}
                                    accessibilityLabel={translate('common.name')}
                                    role={CONST.ROLE.PRESENTATION}
                                />
                                <View style={styles.mt4}>
                                    <InputWrapper
                                        InputComponent={AmountForm}
                                        inputID={INPUT_IDS.RATE}
                                        decimals={CONST.MAX_TAX_RATE_DECIMAL_PLACES}
                                        currency={currency}
                                        isCurrencyPressable={false}
                                        displayAsTextInput
                                        label={translate('workspace.distanceRates.amountPerUnit', unitLabel)}
                                    />
                                </View>
                                <View style={styles.mt2}>
                                    <InputWrapper
                                        InputComponent={DatePicker}
                                        inputID={INPUT_IDS.START_DATE}
                                        label={translate('workspace.distanceRates.startDate')}
                                        shouldDeferShowUntilPositioned
                                        shouldDismissKeyboardBeforeShow
                                    />
                                </View>
                                <InputWrapper
                                    InputComponent={DatePicker}
                                    inputID={INPUT_IDS.END_DATE}
                                    label={translate('workspace.distanceRates.endDate')}
                                    shouldDeferShowUntilPositioned
                                    shouldDismissKeyboardBeforeShow
                                />
                            </>
                        ) : (
                            <InputWrapper
                                InputComponent={AmountForm}
                                inputID={INPUT_IDS.RATE}
                                decimals={CONST.MAX_TAX_RATE_DECIMAL_PLACES}
                                isCurrencyPressable={false}
                                currency={currency}
                                ref={inputCallbackRef}
                            />
                        )}
                    </FormProvider>
                </FullPageBlockingView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default CreateDistanceRatePage;
