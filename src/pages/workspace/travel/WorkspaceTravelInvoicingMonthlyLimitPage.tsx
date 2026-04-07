import React, {useState} from 'react';
import {View} from 'react-native';
import AmountForm from '@components/AmountForm';
import ConfirmModal from '@components/ConfirmModal';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';
import {updateTravelInvoicingMonthlyLimit} from '@libs/actions/TravelInvoicing';
import {getCardSettings} from '@libs/CardUtils';
import {convertToBackendAmount, convertToFrontendAmountAsString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getTravelInvoicingCardSettingsKey} from '@libs/TravelInvoicingUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/EditTravelInvoicingMonthlyLimitForm';

type WorkspaceTravelInvoicingMonthlyLimitPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TRAVEL_SETTINGS_MONTHLY_LIMIT>;

function WorkspaceTravelInvoicingMonthlyLimitPage({route}: WorkspaceTravelInvoicingMonthlyLimitPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = route.params?.policyID;
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const [cardSettings] = useOnyx(getTravelInvoicingCardSettingsKey(workspaceAccountID));
    const travelSettings = getCardSettings(cardSettings, CONST.TRAVEL.PROGRAM_TRAVEL_US);
    const currentLimit = travelSettings?.monthlySpendLimitPerUser ?? 0;
    const defaultValue = convertToFrontendAmountAsString(currentLimit, CONST.DEFAULT_CURRENCY_DECIMALS);
    const {inputCallbackRef} = useAutoFocusInput();
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [pendingLimit, setPendingLimit] = useState(0);

    const submitLimit = (newLimitInCents: number) => {
        updateTravelInvoicingMonthlyLimit(workspaceAccountID, newLimitInCents, currentLimit);
        Navigation.setNavigationActionToMicrotaskQueue(Navigation.goBack);
    };

    const validate = ({
        limit,
    }: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_TRAVEL_INVOICING_MONTHLY_LIMIT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.EDIT_TRAVEL_INVOICING_MONTHLY_LIMIT_FORM> => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.EDIT_TRAVEL_INVOICING_MONTHLY_LIMIT_FORM> = {};
        const parsed = parseFloat(limit);
        if (Number.isNaN(parsed) || parsed < 0) {
            errors[INPUT_IDS.LIMIT] = translate('iou.error.invalidAmount');
        }
        return errors;
    };

    const handleSubmit = ({limit}: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_TRAVEL_INVOICING_MONTHLY_LIMIT_FORM>) => {
        const newLimitInCents = convertToBackendAmount(parseFloat(limit));
        if (newLimitInCents < currentLimit && currentLimit > 0) {
            setPendingLimit(newLimitInCents);
            setIsConfirmModalVisible(true);
            return;
        }
        submitLimit(newLimitInCents);
    };

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnableMaxHeight
            testID="WorkspaceTravelInvoicingMonthlyLimitPage"
        >
            <HeaderWithBackButton
                title={translate('workspace.moreFeatures.travel.travelInvoicing.centralInvoicingSection.subsections.monthlySpendLimitLabel')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <FormProvider
                style={[styles.flexGrow1, styles.mh5]}
                formID={ONYXKEYS.FORMS.EDIT_TRAVEL_INVOICING_MONTHLY_LIMIT_FORM}
                validate={validate}
                onSubmit={handleSubmit}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
                shouldHideFixErrorsAlert
                addBottomSafeAreaPadding
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
                        {translate('workspace.moreFeatures.travel.travelInvoicing.centralInvoicingSection.subsections.monthlySpendLimitDescription')}
                    </Text>
                </View>
            </FormProvider>
            <ConfirmModal
                isVisible={isConfirmModalVisible}
                title={translate('workspace.moreFeatures.travel.travelInvoicing.centralInvoicingSection.subsections.reduceLimitTitle')}
                prompt={translate('workspace.moreFeatures.travel.travelInvoicing.centralInvoicingSection.subsections.reduceLimitWarning')}
                confirmText={translate('common.confirm')}
                cancelText={translate('common.cancel')}
                onConfirm={() => {
                    setIsConfirmModalVisible(false);
                    submitLimit(pendingLimit);
                }}
                onCancel={() => setIsConfirmModalVisible(false)}
                danger
            />
        </ScreenWrapper>
    );
}

export default WorkspaceTravelInvoicingMonthlyLimitPage;
