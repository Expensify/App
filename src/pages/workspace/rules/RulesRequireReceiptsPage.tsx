import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import AmountForm from '@components/AmountForm';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToBackendAmount, convertToFrontendAmountAsString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {setPolicyMaxExpenseAmountNoItemizedReceipt, setPolicyMaxExpenseAmountNoReceipt} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

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
    const {getCurrencyDecimals} = useCurrencyListActions();
    const policyCurrency = policy?.outputCurrency ?? CONST.CURRENCY.USD;
    const decimals = getCurrencyDecimals(policyCurrency);

    const initialReceiptEnabled = isAmountEnabled(policy?.maxExpenseAmountNoReceipt);
    const initialItemizedEnabled = isAmountEnabled(policy?.maxExpenseAmountNoItemizedReceipt);

    const [receiptEnabled, setReceiptEnabled] = useState(initialReceiptEnabled);
    const [itemizedEnabled, setItemizedEnabled] = useState(initialItemizedEnabled);

    const [receiptAmount, setReceiptAmount] = useState(() => (initialReceiptEnabled ? convertToFrontendAmountAsString(policy?.maxExpenseAmountNoReceipt ?? 0, decimals) : ''));
    const [itemizedAmount, setItemizedAmount] = useState(() => (initialItemizedEnabled ? convertToFrontendAmountAsString(policy?.maxExpenseAmountNoItemizedReceipt ?? 0, decimals) : ''));

    const [receiptError, setReceiptError] = useState('');
    const [itemizedError, setItemizedError] = useState('');

    const validate = useCallback(() => {
        setReceiptError('');
        setItemizedError('');

        if (!receiptEnabled && !itemizedEnabled) {
            return true;
        }

        if (receiptEnabled && itemizedEnabled && receiptAmount && itemizedAmount) {
            const receiptCents = convertToBackendAmount(parseFloat(receiptAmount));
            const itemizedCents = convertToBackendAmount(parseFloat(itemizedAmount));

            if (receiptCents > itemizedCents) {
                setReceiptError(
                    translate('workspace.rules.individualExpenseRules.receiptRequiredAmountError', {
                        amount: convertToFrontendAmountAsString(itemizedCents, decimals),
                    }),
                );
                setItemizedError(
                    translate('workspace.rules.individualExpenseRules.itemizedReceiptRequiredAmountError', {
                        amount: convertToFrontendAmountAsString(receiptCents, decimals),
                    }),
                );
                return false;
            }
        }

        return true;
    }, [receiptEnabled, itemizedEnabled, receiptAmount, itemizedAmount, decimals, translate]);

    const handleSave = useCallback(() => {
        if (!validate()) {
            return;
        }

        const receiptValue = receiptEnabled ? receiptAmount : '';
        const itemizedValue = itemizedEnabled ? itemizedAmount : '';

        setPolicyMaxExpenseAmountNoReceipt(policyID, receiptValue, policy?.maxExpenseAmountNoReceipt);
        setPolicyMaxExpenseAmountNoItemizedReceipt(policyID, itemizedValue, policy?.maxExpenseAmountNoItemizedReceipt);
        Navigation.setNavigationActionToMicrotaskQueue(Navigation.goBack);
    }, [validate, receiptEnabled, receiptAmount, itemizedEnabled, itemizedAmount, policyID, policy?.maxExpenseAmountNoReceipt, policy?.maxExpenseAmountNoItemizedReceipt]);

    const hasChanges = useMemo(() => {
        const receiptChanged =
            receiptEnabled !== initialReceiptEnabled ||
            (receiptEnabled && receiptAmount !== (initialReceiptEnabled ? convertToFrontendAmountAsString(policy?.maxExpenseAmountNoReceipt ?? 0, decimals) : ''));
        const itemizedChanged =
            itemizedEnabled !== initialItemizedEnabled ||
            (itemizedEnabled && itemizedAmount !== (initialItemizedEnabled ? convertToFrontendAmountAsString(policy?.maxExpenseAmountNoItemizedReceipt ?? 0, decimals) : ''));
        return receiptChanged || itemizedChanged;
    }, [
        receiptEnabled,
        initialReceiptEnabled,
        receiptAmount,
        itemizedEnabled,
        initialItemizedEnabled,
        itemizedAmount,
        policy?.maxExpenseAmountNoReceipt,
        policy?.maxExpenseAmountNoItemizedReceipt,
        decimals,
    ]);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID={RulesRequireReceiptsPage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.requireReceipts.title')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <ScrollView
                    style={[styles.flexGrow1]}
                    contentContainerStyle={[styles.ph5, styles.pb5]}
                    addBottomSafeAreaPadding
                >
                    <Text style={[styles.mutedTextLabel, styles.mt3, styles.mb4]}>{translate('workspace.rules.requireReceipts.description')}</Text>

                    <ToggleSettingOptionRow
                        title={translate('workspace.rules.requireReceipts.requireReceipt')}
                        switchAccessibilityLabel={translate('workspace.rules.requireReceipts.requireReceipt')}
                        wrapperStyle={styles.pv3}
                        isActive={receiptEnabled}
                        pendingAction={policy?.pendingFields?.maxExpenseAmountNoReceipt}
                        onToggle={(newValue) => {
                            setReceiptEnabled(newValue);
                            if (!newValue) {
                                setReceiptAmount('');
                                setReceiptError('');
                            }
                        }}
                    />
                    {receiptEnabled && (
                        <View style={styles.mt4}>
                            <AmountForm
                                value={receiptAmount}
                                currency={policyCurrency}
                                onInputChange={(value) => {
                                    setReceiptAmount(value);
                                    setReceiptError('');
                                }}
                                isCurrencyPressable={false}
                                displayAsTextInput
                                label={translate('workspace.rules.requireReceipts.requireAboveAmount')}
                                errorText={receiptError}
                            />
                        </View>
                    )}

                    <View style={[styles.sectionDividerLine, styles.mv4]} />

                    <ToggleSettingOptionRow
                        title={translate('workspace.rules.requireReceipts.requireItemizedReceipt')}
                        switchAccessibilityLabel={translate('workspace.rules.requireReceipts.requireItemizedReceipt')}
                        wrapperStyle={styles.pv3}
                        isActive={itemizedEnabled}
                        pendingAction={policy?.pendingFields?.maxExpenseAmountNoItemizedReceipt}
                        onToggle={(newValue) => {
                            setItemizedEnabled(newValue);
                            if (!newValue) {
                                setItemizedAmount('');
                                setItemizedError('');
                            }
                        }}
                    />
                    {itemizedEnabled && (
                        <View style={styles.mt4}>
                            <AmountForm
                                value={itemizedAmount}
                                currency={policyCurrency}
                                onInputChange={(value) => {
                                    setItemizedAmount(value);
                                    setItemizedError('');
                                }}
                                isCurrencyPressable={false}
                                displayAsTextInput
                                label={translate('workspace.rules.requireReceipts.requireAboveAmount')}
                                errorText={itemizedError}
                            />
                        </View>
                    )}
                </ScrollView>
                <View style={[styles.ph5, styles.pb5]}>
                    <Button
                        success
                        large
                        text={translate('workspace.rules.requireReceipts.saveRule')}
                        onPress={handleSave}
                        isDisabled={!hasChanges}
                    />
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

RulesRequireReceiptsPage.displayName = 'RulesRequireReceiptsPage';

export default RulesRequireReceiptsPage;
