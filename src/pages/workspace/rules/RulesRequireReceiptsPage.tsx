import AmountForm from '@components/AmountForm';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues, FormRef} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useReviewWorkspaceSettingsTaskCompletion from '@hooks/useReviewWorkspaceSettingsTaskCompletion';
import useThemeStyles from '@hooks/useThemeStyles';

import {convertToBackendAmount, convertToFrontendAmountAsString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import {clearPolicyErrorField, setPolicyMaxExpenseAmountNoItemizedReceipt, setPolicyMaxExpenseAmountNoReceipt} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/RulesRequireReceiptsForm';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';

type RulesRequireReceiptsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_REQUIRE_RECEIPTS>;

function isAmountEnabled(value: number | undefined): boolean {
    return value !== undefined && value !== CONST.DISABLED_MAX_EXPENSE_VALUE && value !== 0;
}

function RulesRequireReceiptsPage({
    route: {
        params: {policyID},
    },
}: RulesRequireReceiptsPageProps) {
    const policy = usePolicy(policyID);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const getReviewWorkspaceSettingsTaskCompletion = useReviewWorkspaceSettingsTaskCompletion();
    const {isBetaEnabled} = usePermissions();
    const isRulesRevampEnabled = isBetaEnabled(CONST.BETAS.RULES_REVAMP);
    const {getCurrencyDecimals} = useCurrencyListActions();
    const policyCurrency = policy?.outputCurrency ?? CONST.CURRENCY.USD;
    const decimals = getCurrencyDecimals(policyCurrency);
    const formRef = useRef<FormRef>(null);

    const initialReceiptEnabled = isAmountEnabled(policy?.maxExpenseAmountNoReceipt);
    const initialItemizedEnabled = isAmountEnabled(policy?.maxExpenseAmountNoItemizedReceipt);

    const initialReceiptAmount = useMemo(
        () => (initialReceiptEnabled ? convertToFrontendAmountAsString(policy?.maxExpenseAmountNoReceipt ?? 0, decimals) : ''),
        [initialReceiptEnabled, policy?.maxExpenseAmountNoReceipt, decimals],
    );
    const initialItemizedAmount = useMemo(
        () => (initialItemizedEnabled ? convertToFrontendAmountAsString(policy?.maxExpenseAmountNoItemizedReceipt ?? 0, decimals) : ''),
        [initialItemizedEnabled, policy?.maxExpenseAmountNoItemizedReceipt, decimals],
    );

    const [receiptEnabled, setReceiptEnabled] = useState(initialReceiptEnabled);
    const [itemizedEnabled, setItemizedEnabled] = useState(initialItemizedEnabled);
    const syncedPolicyIDRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        syncedPolicyIDRef.current = undefined;
    }, [policyID]);

    useEffect(() => {
        if (!policy?.id || policy.isLoading || syncedPolicyIDRef.current === policy.id) {
            return;
        }

        syncedPolicyIDRef.current = policy.id;
        setReceiptEnabled(isAmountEnabled(policy.maxExpenseAmountNoReceipt));
        setItemizedEnabled(isAmountEnabled(policy.maxExpenseAmountNoItemizedReceipt));
    }, [policy?.id, policy?.isLoading, policy?.maxExpenseAmountNoReceipt, policy?.maxExpenseAmountNoItemizedReceipt]);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.RULES_REQUIRE_RECEIPTS_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.RULES_REQUIRE_RECEIPTS_FORM> => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.RULES_REQUIRE_RECEIPTS_FORM> = {};

            if (!receiptEnabled && !itemizedEnabled) {
                return errors;
            }

            const emptyAmountError = translate('workspace.rules.requireReceipts.emptyAmountError');

            if (receiptEnabled && !values.maxExpenseAmountNoReceipt?.trim()) {
                errors.maxExpenseAmountNoReceipt = emptyAmountError;
            }

            if (itemizedEnabled && !values.maxExpenseAmountNoItemizedReceipt?.trim()) {
                errors.maxExpenseAmountNoItemizedReceipt = emptyAmountError;
            }

            if (!isEmptyObject(errors)) {
                return errors;
            }

            if (receiptEnabled && itemizedEnabled && values.maxExpenseAmountNoReceipt && values.maxExpenseAmountNoItemizedReceipt) {
                const receiptCents = convertToBackendAmount(Number(values.maxExpenseAmountNoReceipt) || 0);
                const itemizedCents = convertToBackendAmount(Number(values.maxExpenseAmountNoItemizedReceipt) || 0);

                if (receiptCents > itemizedCents) {
                    errors.maxExpenseAmountNoReceipt = translate('workspace.rules.individualExpenseRules.receiptRequiredAmountError', {
                        amount: convertToFrontendAmountAsString(itemizedCents, decimals),
                    });
                    errors.maxExpenseAmountNoItemizedReceipt = translate('workspace.rules.individualExpenseRules.itemizedReceiptRequiredAmountError', {
                        amount: convertToFrontendAmountAsString(receiptCents, decimals),
                    });
                }
            }

            return errors;
        },
        [receiptEnabled, itemizedEnabled, decimals, translate],
    );

    const handleSubmit = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.RULES_REQUIRE_RECEIPTS_FORM>) => {
            const receiptChanged = receiptEnabled !== initialReceiptEnabled || (receiptEnabled && values.maxExpenseAmountNoReceipt !== initialReceiptAmount);
            const itemizedChanged = itemizedEnabled !== initialItemizedEnabled || (itemizedEnabled && values.maxExpenseAmountNoItemizedReceipt !== initialItemizedAmount);

            if (!receiptChanged && !itemizedChanged) {
                Navigation.goBack();
                return;
            }

            const receiptValue = receiptEnabled ? values.maxExpenseAmountNoReceipt : '';
            const itemizedValue = itemizedEnabled ? values.maxExpenseAmountNoItemizedReceipt : '';

            const updateReceipt = () => setPolicyMaxExpenseAmountNoReceipt(policyID, receiptValue, policy?.maxExpenseAmountNoReceipt, getReviewWorkspaceSettingsTaskCompletion());
            const updateItemized = () => setPolicyMaxExpenseAmountNoItemizedReceipt(policyID, itemizedValue, policy?.maxExpenseAmountNoItemizedReceipt);

            if (receiptChanged && itemizedChanged) {
                // The two amounts are saved as separate requests, and each is validated on the server against the OTHER
                // amount still stored there, under the invariant "require-receipt amount <= require-itemized-receipt amount".
                // Send the update that keeps that invariant true first, so no intermediate server state is ever rejected.
                const oldReceiptCents = policy?.maxExpenseAmountNoReceipt ?? 0;
                const newItemizedCents = itemizedValue === '' ? CONST.DISABLED_MAX_EXPENSE_VALUE : convertToBackendAmount(Number(itemizedValue));
                // Sending the itemized update first is safe unless it would lower the itemized amount below the receipt
                // amount still on the server; in that (lowering) case send the receipt update first instead.
                const itemizedFirstIsSafe = oldReceiptCents === CONST.DISABLED_MAX_EXPENSE_VALUE || newItemizedCents >= oldReceiptCents;
                if (itemizedFirstIsSafe) {
                    updateItemized();
                    updateReceipt();
                } else {
                    updateReceipt();
                    updateItemized();
                }
            } else if (receiptChanged) {
                updateReceipt();
            } else if (itemizedChanged) {
                updateItemized();
            }
            Navigation.setNavigationActionToMicrotaskQueue(Navigation.goBack);
        },
        [
            receiptEnabled,
            initialReceiptEnabled,
            initialReceiptAmount,
            itemizedEnabled,
            initialItemizedEnabled,
            initialItemizedAmount,
            policyID,
            policy?.maxExpenseAmountNoReceipt,
            policy?.maxExpenseAmountNoItemizedReceipt,
            getReviewWorkspaceSettingsTaskCompletion,
        ],
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.RULES}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
            shouldBeBlocked={!isRulesRevampEnabled}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID="RulesRequireReceiptsPage"
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.requireReceipts.title')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <FormProvider
                    ref={formRef}
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.RULES_REQUIRE_RECEIPTS_FORM}
                    onSubmit={handleSubmit}
                    validate={validate}
                    submitButtonText={translate('workspace.rules.requireReceipts.saveRule')}
                    enabledWhenOffline
                    addBottomSafeAreaPadding
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.REQUIRE_RECEIPTS_SAVE}
                >
                    <Text style={[styles.textNormal, styles.textSupporting, styles.lh20, styles.pv2]}>{translate('workspace.rules.requireReceipts.description')}</Text>

                    <ToggleSettingOptionRow
                        title={translate('workspace.rules.requireReceipts.requireReceipt')}
                        switchAccessibilityLabel={translate('workspace.rules.requireReceipts.requireReceipt')}
                        shouldPlaceSubtitleBelowSwitch
                        wrapperStyle={styles.pv3}
                        isActive={receiptEnabled}
                        pendingAction={policy?.pendingFields?.maxExpenseAmountNoReceipt}
                        errors={policy?.errorFields?.maxExpenseAmountNoReceipt ?? undefined}
                        onCloseError={() => clearPolicyErrorField(policyID, 'maxExpenseAmountNoReceipt')}
                        onToggle={(newValue) => {
                            setReceiptEnabled(newValue);
                            if (!newValue) {
                                formRef.current?.resetFormFieldError(INPUT_IDS.MAX_EXPENSE_AMOUNT_NO_RECEIPT);
                            }
                        }}
                    />
                    {receiptEnabled && (
                        <View style={styles.pv2}>
                            <InputWrapper
                                InputComponent={AmountForm}
                                inputID={INPUT_IDS.MAX_EXPENSE_AMOUNT_NO_RECEIPT}
                                currency={policyCurrency}
                                defaultValue={initialReceiptAmount}
                                isCurrencyPressable={false}
                                displayAsTextInput
                                label={translate('workspace.rules.requireReceipts.requireAboveAmount')}
                            />
                        </View>
                    )}

                    <View style={[styles.sectionDividerLine, styles.mv3]} />

                    <ToggleSettingOptionRow
                        title={translate('workspace.rules.requireReceipts.requireItemizedReceipt')}
                        switchAccessibilityLabel={translate('workspace.rules.requireReceipts.requireItemizedReceipt')}
                        shouldPlaceSubtitleBelowSwitch
                        wrapperStyle={styles.pv3}
                        isActive={itemizedEnabled}
                        pendingAction={policy?.pendingFields?.maxExpenseAmountNoItemizedReceipt}
                        errors={policy?.errorFields?.maxExpenseAmountNoItemizedReceipt ?? undefined}
                        onCloseError={() => clearPolicyErrorField(policyID, 'maxExpenseAmountNoItemizedReceipt')}
                        onToggle={(newValue) => {
                            setItemizedEnabled(newValue);
                            if (!newValue) {
                                formRef.current?.resetFormFieldError(INPUT_IDS.MAX_EXPENSE_AMOUNT_NO_ITEMIZED_RECEIPT);
                            }
                        }}
                    />
                    {itemizedEnabled && (
                        <View style={styles.pv2}>
                            <InputWrapper
                                InputComponent={AmountForm}
                                inputID={INPUT_IDS.MAX_EXPENSE_AMOUNT_NO_ITEMIZED_RECEIPT}
                                currency={policyCurrency}
                                defaultValue={initialItemizedAmount}
                                isCurrencyPressable={false}
                                displayAsTextInput
                                label={translate('workspace.rules.requireReceipts.requireAboveAmount')}
                            />
                        </View>
                    )}
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default RulesRequireReceiptsPage;
