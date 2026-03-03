import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import RadioButtons from '@components/RadioButtons';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {simulateMarqeta3DSChallenge} from '@libs/actions/MultifactorAuthentication';
import {convertToBackendAmount, convertToDisplayString} from '@libs/CurrencyUtils';
import {generateRandomInt} from '@libs/NumberUtils';
import type {CurrentMoney} from '@pages/iou/MoneyRequestAmountForm';
import MoneyRequestAmountForm from '@pages/iou/MoneyRequestAmountForm';
import IOURequestStepCurrencyModal from '@pages/iou/request/step/IOURequestStepCurrencyModal';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const MERCHANTS = ['Grocery store', 'Restaurant', 'Gas station', 'Online retailer', 'Coffee shop', 'Bookstore', 'Clothing store', 'Pharmacy', 'Electronics store', 'Subscription service'];

type CardListItem = ListItem & {
    cardID: number;
};

type AmountPickerProps = {
    amount: number;
    currency: string;
    onSubmit: (amount: number, currency: string) => void;
};

function AmountAndCurrencyPicker({amount, currency, onSubmit}: AmountPickerProps) {
    const {translate} = useLocalize();

    const [isCurrencyPickerVisible, setIsCurrencyPickerVisible] = useState(false);
    const [internalCurrency, setInternalCurrency] = useState(currency);

    const hidePickerModal = () => setIsCurrencyPickerVisible(false);
    const showPickerModal = () => setIsCurrencyPickerVisible(true);
    const submitAmountAndCurrency = (money: CurrentMoney) => onSubmit(convertToBackendAmount(Number.parseFloat(money.amount)), money.currency);

    return (
        <>
            <IOURequestStepCurrencyModal
                isPickerVisible={isCurrencyPickerVisible}
                hidePickerModal={hidePickerModal}
                headerText={translate('common.selectCurrency')}
                value={internalCurrency}
                onInputChange={setInternalCurrency}
            />
            <MoneyRequestAmountForm
                currency={internalCurrency}
                amount={amount}
                shouldKeepUserInput
                onCurrencyButtonPress={showPickerModal}
                onSubmitButtonPress={submitAmountAndCurrency}
                isCurrencyPressable
            />
        </>
    );
}

type SimulatePendingTransactionProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** Callback to close the modal */
    onClose: () => void;
};

type CurrentView = 'form' | 'amountPicker' | 'cardPicker';

function SimulatePendingTransaction({isVisible, onClose}: SimulatePendingTransactionProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [currentView, setCurrentView] = useState<CurrentView>('form');

    const [merchant, setMerchant] = useState(() => MERCHANTS[generateRandomInt(0, MERCHANTS.length - 1)]);
    const [amount, setAmount] = useState(() => generateRandomInt(500, 100000));
    const [currency, setCurrency] = useState<string>(CONST.CURRENCY.GBP);
    const [delayMinutesText, setDelayMinutesText] = useState('0');
    const [expiryMinutesText, setExpiryMinutesText] = useState('8');
    const [simulatedOutcome, setSimulatedOutcome] = useState('');
    const [selectedCardID, setSelectedCardID] = useState<number | undefined>(undefined);

    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);

    const expensifyCards = useMemo(() => {
        if (!cardList) {
            return [];
        }
        return Object.values(cardList).filter((card) => card.bank === CONST.EXPENSIFY_CARD.BANK && card.state === CONST.EXPENSIFY_CARD.STATE.OPEN);
    }, [cardList]);

    // Derive effective card ID: user selection takes priority, otherwise default to first card
    const effectiveCardID = useMemo(() => {
        if (selectedCardID !== undefined) {
            return selectedCardID;
        }
        return expensifyCards.at(0)?.cardID;
    }, [selectedCardID, expensifyCards]);

    const outcomeItems = useMemo(
        () => [
            {label: translate('initialSettingsPage.troubleshoot.simulate3DSPendingTransaction.outcomeApproveOrDeny'), value: ''},
            {label: translate('initialSettingsPage.troubleshoot.simulate3DSPendingTransaction.outcomeMarqetaError'), value: 'MARQETA_ERROR'},
            {label: translate('initialSettingsPage.troubleshoot.simulate3DSPendingTransaction.outcomeAlreadyApproved'), value: 'ALREADY_APPROVED'},
            {label: translate('initialSettingsPage.troubleshoot.simulate3DSPendingTransaction.outcomeAlreadyDenied'), value: 'ALREADY_DENIED'},
        ],
        [translate],
    );

    const cardSelectionItems: CardListItem[] = useMemo(
        () =>
            expensifyCards.map((card) => ({
                text: card.nameValuePairs?.cardTitle ?? translate('initialSettingsPage.troubleshoot.simulate3DSPendingTransaction.cardEndingIn', card.lastFourPAN ?? '????'),
                keyForList: String(card.cardID),
                isSelected: effectiveCardID === card.cardID,
                cardID: card.cardID,
            })),
        [expensifyCards, effectiveCardID, translate],
    );

    const selectedCardLabel = useMemo(() => {
        const noActiveCard = translate('initialSettingsPage.troubleshoot.simulate3DSPendingTransaction.noActiveExpensifyCard');
        if (effectiveCardID === undefined) {
            return noActiveCard;
        }
        const card = expensifyCards.find((c) => c.cardID === effectiveCardID);
        if (!card) {
            return noActiveCard;
        }
        return card.nameValuePairs?.cardTitle ?? translate('initialSettingsPage.troubleshoot.simulate3DSPendingTransaction.cardEndingIn', card.lastFourPAN ?? '????');
    }, [effectiveCardID, expensifyCards, translate]);

    const displayAmount = convertToDisplayString(amount, currency);

    const simulateTransaction = () => {
        if (effectiveCardID === undefined) {
            return;
        }
        const delaySeconds = Math.max(0, Math.round((parseFloat(delayMinutesText) || 0) * 60));
        const maxResponseTime = parseInt(expiryMinutesText, 10) || 8;
        simulateMarqeta3DSChallenge({
            merchant,
            amount,
            currency,
            deliverAfterSeconds: delaySeconds,
            simulatedOutcome,
            maxResponseTime,
            cardID: effectiveCardID,
        });
        onClose();
    };

    const runAllFlows = () => {
        if (effectiveCardID === undefined) {
            return;
        }
        simulateMarqeta3DSChallenge({shouldRunAllFlows: true, cardID: effectiveCardID});
        onClose();
    };

    const onAmountSubmit = (newAmount: number, newCurrency: string) => {
        setAmount(newAmount);
        setCurrency(newCurrency);
        setCurrentView('form');
    };

    const onCardSelect = (item: CardListItem) => {
        setSelectedCardID(item.cardID);
        setCurrentView('form');
    };

    const handleBackPress = () => {
        if (currentView !== 'form') {
            setCurrentView('form');
            return;
        }
        onClose();
    };

    const headerTitle =
        currentView === 'cardPicker'
            ? translate('initialSettingsPage.troubleshoot.simulate3DSPendingTransaction.selectCard')
            : translate('initialSettingsPage.troubleshoot.simulate3DSPendingTransaction.title');

    const FormView = (
        <ScrollView style={[styles.flex1, styles.ph5, styles.pb5]}>
            <View style={styles.gap4}>
                <View>
                    <Text>{translate('initialSettingsPage.troubleshoot.simulate3DSPendingTransaction.card')}</Text>
                    <View style={styles.mv2}>
                        <TextInput
                            accessibilityLabel={translate('initialSettingsPage.troubleshoot.simulate3DSPendingTransaction.selectedCardAccessibilityLabel')}
                            value={selectedCardLabel}
                            editable={false}
                            onPress={() => setCurrentView('cardPicker')}
                        />
                    </View>
                </View>
                <View style={styles.mv2}>
                    <Button
                        isDisabled={effectiveCardID === undefined}
                        text={translate('initialSettingsPage.troubleshoot.simulate3DSPendingTransaction.runScriptedQAFlows')}
                        onPress={runAllFlows}
                    />
                    <Text style={[styles.mutedTextLabel, styles.mt2]}>{translate('initialSettingsPage.troubleshoot.simulate3DSPendingTransaction.runScriptedQAFlowsDescription')}</Text>
                </View>
                <View>
                    <Text>{translate('initialSettingsPage.troubleshoot.simulate3DSPendingTransaction.outcome')}</Text>
                    <RadioButtons
                        items={outcomeItems}
                        value={simulatedOutcome}
                        onPress={setSimulatedOutcome}
                    />
                </View>

                <View>
                    <Text>{translate('initialSettingsPage.troubleshoot.simulate3DSPendingTransaction.merchant')}</Text>
                    <View style={styles.mv2}>
                        <TextInput
                            placeholder={translate('initialSettingsPage.troubleshoot.simulate3DSPendingTransaction.merchantPlaceholder')}
                            value={merchant}
                            onChangeText={setMerchant}
                            accessibilityLabel={translate('initialSettingsPage.troubleshoot.simulate3DSPendingTransaction.merchantAccessibilityLabel')}
                        />
                    </View>
                </View>

                <View>
                    <Text>{translate('initialSettingsPage.troubleshoot.simulate3DSPendingTransaction.amountAndCurrency')}</Text>
                    <View style={styles.mv2}>
                        <TextInput
                            accessibilityLabel={translate('initialSettingsPage.troubleshoot.simulate3DSPendingTransaction.amountAccessibilityLabel')}
                            value={displayAmount}
                            editable={false}
                            onPress={() => setCurrentView('amountPicker')}
                        />
                    </View>
                </View>

                <View>
                    <Text>{translate('initialSettingsPage.troubleshoot.simulate3DSPendingTransaction.delayBeforeDelivery')}</Text>
                    <TextInput
                        placeholder="0"
                        value={delayMinutesText}
                        onChangeText={setDelayMinutesText}
                        keyboardType="decimal-pad"
                        accessibilityLabel={translate('initialSettingsPage.troubleshoot.simulate3DSPendingTransaction.delayAccessibilityLabel')}
                    />
                    <View style={[styles.flexRow, styles.gap2, styles.mv2]}>
                        <Button
                            small
                            text={translate('initialSettingsPage.troubleshoot.simulate3DSPendingTransaction.now')}
                            onPress={() => setDelayMinutesText('0')}
                        />
                        <Button
                            small
                            text={translate('initialSettingsPage.troubleshoot.simulate3DSPendingTransaction.oneMinute')}
                            onPress={() => setDelayMinutesText('1')}
                        />
                        <Button
                            small
                            text={translate('initialSettingsPage.troubleshoot.simulate3DSPendingTransaction.fiveMinutes')}
                            onPress={() => setDelayMinutesText('5')}
                        />
                    </View>
                </View>

                <View>
                    <Text>{translate('initialSettingsPage.troubleshoot.simulate3DSPendingTransaction.expiresAfter')}</Text>
                    <TextInput
                        placeholder="8"
                        value={expiryMinutesText}
                        onChangeText={setExpiryMinutesText}
                        keyboardType="decimal-pad"
                        accessibilityLabel={translate('initialSettingsPage.troubleshoot.simulate3DSPendingTransaction.expiryAccessibilityLabel')}
                    />
                    <View style={[styles.flexRow, styles.gap2, styles.mv2]}>
                        <Button
                            small
                            text={translate('initialSettingsPage.troubleshoot.simulate3DSPendingTransaction.eightMinutes')}
                            onPress={() => setExpiryMinutesText('8')}
                        />
                        <Button
                            small
                            text={translate('initialSettingsPage.troubleshoot.simulate3DSPendingTransaction.fifteenMinutes')}
                            onPress={() => setExpiryMinutesText('15')}
                        />
                        <Button
                            small
                            text={translate('initialSettingsPage.troubleshoot.simulate3DSPendingTransaction.oneHour')}
                            onPress={() => setExpiryMinutesText('60')}
                        />
                    </View>
                </View>
            </View>
        </ScrollView>
    );

    const Footer = (
        <FixedFooter style={[styles.flexRow, styles.gap4, styles.w100]}>
            <Button
                success
                isDisabled={effectiveCardID === undefined}
                style={[styles.flex1]}
                text={translate('initialSettingsPage.troubleshoot.simulate3DSPendingTransaction.simulate')}
                onPress={simulateTransaction}
            />
            <Button
                danger
                style={[styles.flex1]}
                text={translate('common.cancel')}
                onPress={onClose}
            />
        </FixedFooter>
    );

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isVisible}
            onClose={onClose}
            onModalHide={onClose}
            shouldEnableNewFocusManagement
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <ScreenWrapper
                testID="SimulatePendingTransaction"
                includePaddingTop={false}
            >
                <HeaderWithBackButton
                    title={headerTitle}
                    shouldShowBackButton
                    onBackButtonPress={handleBackPress}
                />

                {currentView === 'amountPicker' && (
                    <AmountAndCurrencyPicker
                        amount={amount}
                        currency={currency}
                        onSubmit={onAmountSubmit}
                    />
                )}

                {currentView === 'cardPicker' && (
                    <SelectionList
                        ListItem={RadioListItem}
                        data={cardSelectionItems}
                        onSelectRow={onCardSelect}
                        shouldHighlightSelectedItem
                        initiallyFocusedItemKey={effectiveCardID !== undefined ? String(effectiveCardID) : undefined}
                    />
                )}

                {currentView === 'form' && FormView}

                {currentView === 'form' && Footer}
            </ScreenWrapper>
        </Modal>
    );
}

SimulatePendingTransaction.displayName = 'SimulatePendingTransaction';

export default SimulatePendingTransaction;
