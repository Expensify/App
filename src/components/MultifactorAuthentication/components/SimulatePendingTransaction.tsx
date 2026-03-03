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

const OUTCOME_ITEMS = [
    {label: 'Approve/Deny (normal)', value: ''},
    {label: 'Marqeta error on result', value: 'MARQETA_ERROR'},
    {label: 'Already approved error', value: 'ALREADY_APPROVED'},
    {label: 'Already denied error', value: 'ALREADY_DENIED'},
];

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

    const cardSelectionItems: CardListItem[] = useMemo(
        () =>
            expensifyCards.map((card) => ({
                text: card.nameValuePairs?.cardTitle ?? `Card ending in ${card.lastFourPAN ?? '????'}`,
                keyForList: String(card.cardID),
                isSelected: effectiveCardID === card.cardID,
                cardID: card.cardID,
            })),
        [expensifyCards, effectiveCardID],
    );

    const selectedCardLabel = useMemo(() => {
        if (effectiveCardID === undefined) {
            return 'No active Expensify card';
        }
        const card = expensifyCards.find((c) => c.cardID === effectiveCardID);
        if (!card) {
            return 'No active Expensify card';
        }
        return card.nameValuePairs?.cardTitle ?? `Card ending in ${card.lastFourPAN ?? '????'}`;
    }, [effectiveCardID, expensifyCards]);

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

    const headerTitle = currentView === 'cardPicker' ? 'Select card' : 'Simulate pending 3DS transaction';

    const FormView = (
        <ScrollView style={[styles.flex1, styles.ph5]}>
            <View style={styles.gap4}>
                <View>
                    <Text>Card</Text>
                    <View style={styles.mv2}>
                        <TextInput
                            accessibilityLabel="Selected card"
                            value={selectedCardLabel}
                            editable={false}
                            onPress={() => setCurrentView('cardPicker')}
                        />
                    </View>
                </View>
                <View style={styles.mv2}>
                    <Button
                        isDisabled={effectiveCardID === undefined}
                        text="Run scripted QA flows"
                        onPress={runAllFlows}
                    />
                    <Text style={[styles.mutedTextLabel, styles.mt2]}>
                        Press to queue 6 transactions staggered 30s apart: Approval, Denial, Expiry (expires after 1 minute), Marqeta Error, Already Approved, Already Denied.
                    </Text>
                </View>
                <View>
                    <Text>Outcome</Text>
                    <RadioButtons
                        items={OUTCOME_ITEMS}
                        value={simulatedOutcome}
                        onPress={setSimulatedOutcome}
                    />
                </View>

                <View>
                    <Text>Merchant</Text>
                    <View style={styles.mv2}>
                        <TextInput
                            placeholder="Enter merchant name"
                            value={merchant}
                            onChangeText={setMerchant}
                            accessibilityLabel="Merchant name"
                        />
                    </View>
                </View>

                <View>
                    <Text>Amount & currency</Text>
                    <View style={styles.mv2}>
                        <TextInput
                            accessibilityLabel="Text input field"
                            value={displayAmount}
                            editable={false}
                            onPress={() => setCurrentView('amountPicker')}
                        />
                    </View>
                </View>

                <View>
                    <Text>Delay before delivery (min)</Text>
                    <View style={[styles.flexRow, styles.gap2, styles.mv2]}>
                        <Button
                            small
                            text="Now"
                            onPress={() => setDelayMinutesText('0')}
                        />
                        <Button
                            small
                            text="1 min"
                            onPress={() => setDelayMinutesText('1')}
                        />
                        <Button
                            small
                            text="5 min"
                            onPress={() => setDelayMinutesText('5')}
                        />
                    </View>
                    <TextInput
                        placeholder="0"
                        value={delayMinutesText}
                        onChangeText={setDelayMinutesText}
                        keyboardType="decimal-pad"
                        accessibilityLabel="Delay in minutes before delivering challenge"
                    />
                </View>

                <View>
                    <Text>Expires after (min)</Text>
                    <View style={[styles.flexRow, styles.gap2, styles.mv2]}>
                        <Button
                            small
                            text="8 min"
                            onPress={() => setExpiryMinutesText('8')}
                        />
                        <Button
                            small
                            text="15 min"
                            onPress={() => setExpiryMinutesText('15')}
                        />
                        <Button
                            small
                            text="1 hour"
                            onPress={() => setExpiryMinutesText('60')}
                        />
                    </View>
                    <TextInput
                        placeholder="8"
                        value={expiryMinutesText}
                        onChangeText={setExpiryMinutesText}
                        keyboardType="decimal-pad"
                        accessibilityLabel="Challenge expiry in minutes"
                    />
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
                text="Simulate"
                onPress={simulateTransaction}
            />
            <Button
                danger
                style={[styles.flex1]}
                text="Cancel"
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
