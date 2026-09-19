import AmountForm from '@components/AmountForm';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useConfirmModal from '@hooks/useConfirmModal';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateTravelBillingMonthlyLimit} from '@libs/actions/TravelBilling';
import {getCardSettings} from '@libs/CardUtils';
import {convertToBackendAmount, convertToFrontendAmountAsString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getTravelBillingCardSettingsKey} from '@libs/TravelBillingUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/EditTravelBillingMonthlyLimitForm';

import React from 'react';
import {View} from 'react-native';

type WorkspaceTravelBillingMonthlyLimitPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TRAVEL_SETTINGS_MONTHLY_LIMIT>;

function WorkspaceTravelBillingMonthlyLimitPage({route}: WorkspaceTravelBillingMonthlyLimitPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = route.params?.policyID;
    const defaultFundID = useDefaultFundID(policyID);
    const [cardSettings] = useOnyx(getTravelBillingCardSettingsKey(defaultFundID));
    const travelSettings = getCardSettings(cardSettings, CONST.TRAVEL.PROGRAM_TRAVEL_US);
    const currentLimit = travelSettings?.monthlySpendLimitPerUser ?? 0;
    const defaultValue = convertToFrontendAmountAsString(currentLimit, CONST.DEFAULT_CURRENCY_DECIMALS);
    const {inputCallbackRef} = useAutoFocusInput();
    const {showConfirmModal} = useConfirmModal();

    const submitLimit = (newLimitInCents: number) => {
        updateTravelBillingMonthlyLimit(defaultFundID, newLimitInCents, currentLimit);
        Navigation.setNavigationActionToMicrotaskQueue(Navigation.goBack);
    };

    const validate = ({
        limit,
    }: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_TRAVEL_BILLING_MONTHLY_LIMIT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.EDIT_TRAVEL_BILLING_MONTHLY_LIMIT_FORM> => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.EDIT_TRAVEL_BILLING_MONTHLY_LIMIT_FORM> = {};
        const parsed = parseFloat(limit);
        if (Number.isNaN(parsed) || parsed < 0) {
            errors[INPUT_IDS.LIMIT] = translate('iou.error.invalidAmount');
        }
        return errors;
    };

    const handleSubmit = ({limit}: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_TRAVEL_BILLING_MONTHLY_LIMIT_FORM>) => {
        const newLimitInCents = convertToBackendAmount(parseFloat(limit));
        const isReducingLimit = newLimitInCents < currentLimit && currentLimit > 0;
        if (!isReducingLimit) {
            submitLimit(newLimitInCents);
            return;
        }
        showConfirmModal({
            title: translate('workspace.moreFeatures.travel.travelInvoicing.travelInvoicingSection.subsections.reduceLimitTitle'),
            prompt: translate('workspace.moreFeatures.travel.travelInvoicing.travelInvoicingSection.subsections.reduceLimitWarning'),
            confirmText: translate('common.confirm'),
            cancelText: translate('common.cancel'),
            buttonVariant: CONST.BUTTON_VARIANT.DANGER,
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            submitLimit(newLimitInCents);
        });
    };

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnableMaxHeight
            testID="WorkspaceTravelBillingMonthlyLimitPage"
        >
            <HeaderWithBackButton
                title={translate('workspace.moreFeatures.travel.travelInvoicing.travelInvoicingSection.subsections.monthlySpendLimitLabel')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <FormProvider
                style={[styles.flexGrow1, styles.mh5]}
                formID={ONYXKEYS.FORMS.EDIT_TRAVEL_BILLING_MONTHLY_LIMIT_FORM}
                validate={validate}
                onSubmit={handleSubmit}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
                shouldHideFixErrorsAlert
                addBottomSafeAreaPadding
                shouldShowLoadingImmediatelyOnPress={false}
            >
                <View style={styles.mb4}>
                    <InputWrapper
                        label={translate('iou.amount')}
                        InputComponent={AmountForm}
                        inputID={INPUT_IDS.LIMIT}
                        currency={CONST.CURRENCY.USD}
                        defaultValue={defaultValue}
                        isCurrencyPressable={false}
                        ref={inputCallbackRef}
                        displayAsTextInput
                    />
                    <Text style={[styles.mutedNormalTextLabel, styles.mt2]}>
                        {translate('workspace.moreFeatures.travel.travelInvoicing.travelInvoicingSection.subsections.monthlySpendLimitDescription')}
                    </Text>
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

export default WorkspaceTravelBillingMonthlyLimitPage;
