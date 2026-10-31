/**
 * First step of settling an Expensify Card balance early: the admin picks between the full balance and a partial amount.
 * A partial amount is previewed by the backend, which rounds it up to whole transactions, before the confirmation page.
 */
import AmountForm from '@components/AmountForm';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import ValuePicker from '@components/ValuePicker';

import useCurrencyForExpensifyCard from '@hooks/useCurrencyForExpensifyCard';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearExpensifyCardSettlementPreview, previewExpensifyCardPartialSettlement, setExpensifyCardSettlementPreviewForFullBalance} from '@libs/actions/Card';
import {getCardProgramKey, getCardSettings, getQueuedExpensifyCardSettlement} from '@libs/CardUtils';
import {convertToBackendAmount} from '@libs/CurrencyUtils';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/SettleExpensifyCardBalanceForm';

import type {ValueOf} from 'type-fest';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

type SettlementType = ValueOf<typeof CONST.EXPENSIFY_CARD.SETTLEMENT_TYPE>;

function isSettlementType(value: unknown): value is SettlementType {
    return Object.values(CONST.EXPENSIFY_CARD.SETTLEMENT_TYPE).some((settlementType) => settlementType === value);
}

type WorkspaceSettleBalancePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTLE_BALANCE>;

function WorkspaceSettleBalancePage({route}: WorkspaceSettleBalancePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const policyID = route.params.policyID;
    const defaultFundID = useDefaultFundID(policyID);
    const currency = useCurrencyForExpensifyCard({policyID, fundID: defaultFundID});

    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${defaultFundID}`);
    const [cardManualBilling] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_MANUAL_BILLING}${defaultFundID}`);
    const [preview] = useOnyx(ONYXKEYS.RAM_ONLY_EXPENSIFY_CARD_SETTLEMENT_PREVIEW);
    const [draftForm] = useOnyx(ONYXKEYS.FORMS.SETTLE_EXPENSIFY_CARD_BALANCE_DRAFT_FORM);
    const programKey = getCardProgramKey(cardSettings);
    const settings = getCardSettings(cardSettings, programKey);
    const currentBalance = settings?.currentBalance ?? 0;

    // The flow only exists on monthly settlement, and a queued settlement cannot be changed until it is processed
    const isOnMonthlySettlement = !!settings?.monthlySettlementDate;
    const isSettlementQueued = getQueuedExpensifyCardSettlement(cardManualBilling).isQueued;

    const [settlementTypeDraft, setSettlementTypeDraft] = useState<SettlementType>();
    const draftSettlementType = draftForm?.[INPUT_IDS.SETTLEMENT_TYPE];
    const settlementType = settlementTypeDraft ?? (isSettlementType(draftSettlementType) ? draftSettlementType : CONST.EXPENSIFY_CARD.SETTLEMENT_TYPE.FULL);
    const isPartial = settlementType === CONST.EXPENSIFY_CARD.SETTLEMENT_TYPE.PARTIAL;

    // A preview left over from an earlier visit must not be shown as if it were the answer to what the admin enters now
    useEffect(() => {
        clearExpensifyCardSettlementPreview();
    }, []);

    const settlementTypeItems = [
        {value: CONST.EXPENSIFY_CARD.SETTLEMENT_TYPE.FULL, label: translate('workspace.expensifyCard.settleCurrentBalance'), keyForList: CONST.EXPENSIFY_CARD.SETTLEMENT_TYPE.FULL},
        {value: CONST.EXPENSIFY_CARD.SETTLEMENT_TYPE.PARTIAL, label: translate('workspace.expensifyCard.settlePartialBalance'), keyForList: CONST.EXPENSIFY_CARD.SETTLEMENT_TYPE.PARTIAL},
    ];

    // The preview answers the amount it was asked for, so its error only applies while that amount is still the one in the input
    const isPreviewForEnteredAmount = preview?.requestedAmount === convertToBackendAmount(Number(draftForm?.[INPUT_IDS.AMOUNT]));
    let previewErrorMessage = '';
    if (isPreviewForEnteredAmount && preview?.isAboveMaximum) {
        previewErrorMessage = translate('workspace.expensifyCard.settleBalanceAmountAboveMaximum', convertToDisplayString(preview.maximumAmount, currency));
    }
    if (isPreviewForEnteredAmount && !previewErrorMessage) {
        previewErrorMessage = getLatestErrorMessage(preview);
    }

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SETTLE_EXPENSIFY_CARD_BALANCE_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.SETTLE_EXPENSIFY_CARD_BALANCE_FORM> => {
        if (values[INPUT_IDS.SETTLEMENT_TYPE] !== CONST.EXPENSIFY_CARD.SETTLEMENT_TYPE.PARTIAL) {
            return {};
        }
        const errors = getFieldRequiredErrors(values, [INPUT_IDS.AMOUNT], translate);
        if (errors[INPUT_IDS.AMOUNT]) {
            return errors;
        }
        const amount = Number(values[INPUT_IDS.AMOUNT]);
        if (!amount || amount <= 0) {
            errors[INPUT_IDS.AMOUNT] = translate('iou.error.invalidAmount');
        } else if (convertToBackendAmount(amount) > currentBalance) {
            errors[INPUT_IDS.AMOUNT] = translate('workspace.expensifyCard.settleBalanceAmountAboveMaximum', convertToDisplayString(currentBalance, currency));
        }
        return errors;
    };

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SETTLE_EXPENSIFY_CARD_BALANCE_FORM>) => {
        const confirmationRoute = ROUTES.WORKSPACE_EXPENSIFY_CARD_SETTLE_BALANCE_CONFIRMATION.getRoute(policyID);
        if (values[INPUT_IDS.SETTLEMENT_TYPE] !== CONST.EXPENSIFY_CARD.SETTLEMENT_TYPE.PARTIAL) {
            setExpensifyCardSettlementPreviewForFullBalance();
            Navigation.navigate(confirmationRoute);
            return;
        }

        previewExpensifyCardPartialSettlement(defaultFundID, programKey, convertToBackendAmount(Number(values[INPUT_IDS.AMOUNT]))).then((canContinue) => {
            if (!canContinue) {
                return;
            }
            Navigation.navigate(confirmationRoute);
        });
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            shouldBeBlocked={!isOnMonthlySettlement || isSettlementQueued}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.EXPENSIFY_CARD}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
        >
            <ScreenWrapper
                testID="WorkspaceSettleBalancePage"
                shouldEnablePickerAvoiding={false}
                shouldEnableMaxHeight
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButtonAndTitle
                    title={translate('workspace.expensifyCard.settleBalance')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID))}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.SETTLE_EXPENSIFY_CARD_BALANCE_FORM}
                    submitButtonText={translate('common.next')}
                    onSubmit={submit}
                    validate={validate}
                    style={styles.flex1}
                    submitButtonStyles={[styles.mh5, styles.mt0]}
                    isLoading={!!preview?.isLoading}
                    shouldHideFixErrorsAlert
                    // The rounded amount comes from the backend, so only a full settlement can be queued offline
                    enabledWhenOffline={!isPartial}
                    addBottomSafeAreaPadding
                >
                    <Text style={[styles.textSupporting, styles.ph5, styles.mv3]}>{translate('workspace.expensifyCard.settleBalanceDescription')}</Text>
                    <InputWrapper
                        InputComponent={ValuePicker}
                        inputID={INPUT_IDS.SETTLEMENT_TYPE}
                        label={translate('workspace.expensifyCard.settleBalance')}
                        value={settlementType}
                        defaultValue={settlementType}
                        items={settlementTypeItems}
                        onValueChange={(value) => {
                            if (!isSettlementType(value)) {
                                return;
                            }
                            setSettlementTypeDraft(value);
                        }}
                        shouldShowModal={false}
                        shouldSaveDraft
                        addBottomSafeAreaPadding={false}
                        disableKeyboardShortcuts
                    />
                    {isPartial && (
                        <View style={[styles.mt3, styles.mh5]}>
                            <InputWrapper
                                InputComponent={AmountForm}
                                inputID={INPUT_IDS.AMOUNT}
                                label={translate('workspace.expensifyCard.settlePartialBalanceAmount')}
                                defaultValue={draftForm?.[INPUT_IDS.AMOUNT]}
                                currency={currency}
                                isCurrencyPressable={false}
                                displayAsTextInput
                                shouldSaveDraft
                            />
                            {!!previewErrorMessage && (
                                <FormHelpMessage
                                    isError
                                    message={previewErrorMessage}
                                    style={styles.mt2}
                                />
                            )}
                        </View>
                    )}
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceSettleBalancePage;
