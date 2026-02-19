import {format} from 'date-fns';
import React, {useState} from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';
import Button from '@components/Button';
import DatePicker from '@components/DatePicker';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import TimePicker from '@components/TimePicker/TimePicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToBackendAmount, convertToDisplayString, generateRandomCurrency} from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import {generateRandomInt} from '@libs/NumberUtils';
import type {CurrentMoney} from '@pages/iou/MoneyRequestAmountForm';
import MoneyRequestAmountForm from '@pages/iou/MoneyRequestAmountForm';
import IOURequestStepCurrencyModal from '@pages/iou/request/step/IOURequestStepCurrencyModal';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type TransactionPending3DSReview from '@src/types/onyx/TransactionPending3DSReview';

const MERCHANTS = ['Grocery store', 'Restaurant', 'Gas station', 'Online retailer', 'Coffee shop', 'Bookstore', 'Clothing store', 'Pharmacy', 'Electronics store', 'Subscription service'];
const TRANSACTION_MIN = 100_000_000;
const TRANSACTION_MAX = 999_999_999;
const EIGHT_MINUTES = 8 * 60 * 1000;

const formatFNS = (ms: number) => format(new Date(ms), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING);

function generateRandomTransaction(): TransactionPending3DSReview {
    return {
        amount: generateRandomInt(500, 100000),
        currency: generateRandomCurrency(),
        lastFourPAN: generateRandomInt(1000, 9999),
        merchant: MERCHANTS[generateRandomInt(0, MERCHANTS.length - 1)],
        transactionID: `${generateRandomInt(TRANSACTION_MIN, TRANSACTION_MAX)}`.repeat(2),
        created: formatFNS(new Date().getTime()),
        expires: formatFNS(new Date().getTime() + EIGHT_MINUTES),
    };
}

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

type DateAndTimePickerProps = {
    value: string;
    onSubmit: (input: string) => void;
    placeholder: string;
    inputID: string;
};

function DateAndTimePicker({value, onSubmit, placeholder, inputID}: DateAndTimePickerProps) {
    const [date, setDate] = useState<string | undefined>();
    const styles = useThemeStyles();

    const onTimePicked = (timeString: string) => {
        const newDate = DateUtils.combineDateAndTime(timeString, date ?? formatFNS(new Date().getTime()));
        onSubmit(newDate);
        setDate(undefined);
    };

    return (
        <>
            <DatePicker
                inputID={inputID}
                value={value}
                onInputChange={(input) => setDate(input)}
                placeholder={placeholder}
            />

            <Modal
                isVisible={!!date}
                shouldEnableNewFocusManagement
                enableEdgeToEdgeBottomSafeAreaPadding
                type={CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
            >
                <View style={[styles.h100]}>
                    <HeaderWithBackButton
                        title="Pick time"
                        shouldShowBackButton
                        onBackButtonPress={() => setDate(undefined)}
                    />
                    <TimePicker
                        onSubmit={onTimePicked}
                        shouldValidateFutureTime={false}
                    />
                </View>
            </Modal>
        </>
    );
}

type SimulatePendingTransactionProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** Callback to close the modal */
    onClose: () => void;
};

function SimulatePendingTransaction({isVisible, onClose}: SimulatePendingTransactionProps) {
    const styles = useThemeStyles();
    const [showAmountPicker, setShowAmountPicker] = useState(false);
    const [transaction, setTransaction] = useState(() => generateRandomTransaction());

    const displayAmount = convertToDisplayString(transaction.amount, transaction.currency);

    const simulateTransaction = () => {
        if (!transaction.transactionID) {
            return;
        }

        // eslint-disable-next-line rulesdir/prefer-actions-set-data
        Onyx.merge(ONYXKEYS.TRANSACTIONS_PENDING_3DS_REVIEW, {
            [transaction.transactionID]: {
                ...transaction,
                simulated: true,
            },
        });
        onClose();
    };

    const onAmountSubmit = (amount: number, currency: string) => {
        setTransaction((prevTransaction) => ({...prevTransaction, amount, currency}));
        setShowAmountPicker(false);
    };

    const SimulateOptions = (
        <ScrollView style={[styles.flex1, styles.ph5]}>
            <View style={styles.gap4}>
                <View style={styles.mv2}>
                    <Button
                        text="Randomize transaction"
                        onPress={() => setTransaction(generateRandomTransaction())}
                    />
                </View>

                <View>
                    <Text>Merchant</Text>
                    <View style={styles.mv2}>
                        <TextInput
                            placeholder="Enter merchant name"
                            value={transaction.merchant}
                            onChangeText={(merchant) => setTransaction((prevTransaction) => ({...prevTransaction, merchant}))}
                            accessibilityLabel="Merchant name"
                        />
                    </View>
                </View>

                <View>
                    <Text>Created Date</Text>
                    <DateAndTimePicker
                        inputID="created"
                        value={transaction.created}
                        onSubmit={(input) => setTransaction((prevTransaction) => ({...prevTransaction, created: input}))}
                        placeholder="Select date and time"
                    />
                </View>

                <View>
                    <Text>Expires Date</Text>
                    <DateAndTimePicker
                        inputID="expires"
                        value={transaction.expires}
                        onSubmit={(input) => setTransaction((prevTransaction) => ({...prevTransaction, expires: input}))}
                        placeholder="Select date and time"
                    />
                </View>

                <View>
                    <Text>Last 4 PAN Digits</Text>
                    <View style={styles.mv2}>
                        <TextInput
                            placeholder="0000"
                            value={String(transaction.lastFourPAN)}
                            onChangeText={(text) => setTransaction((prevTransaction) => ({...prevTransaction, lastFourPAN: Number(text)}))}
                            keyboardType="decimal-pad"
                            maxLength={4}
                            accessibilityLabel="Last 4 digits of card number"
                        />
                    </View>
                </View>

                <View>
                    <Text>TransactionID</Text>
                    <View style={styles.mv2}>
                        <TextInput
                            placeholder="Enter transactionID"
                            value={transaction.transactionID}
                            onChangeText={(text) => setTransaction((prevTransaction) => ({...prevTransaction, transactionID: text}))}
                            accessibilityLabel="Transaction ID"
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
                            onPress={() => setShowAmountPicker(true)}
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

    const AmountPicker = (
        <AmountAndCurrencyPicker
            amount={transaction.amount ?? 0}
            currency={transaction.currency ?? CONST.CURRENCY.USD}
            onSubmit={onAmountSubmit}
        />
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
                    title="Simulate pending 3DS transaction"
                    shouldShowBackButton
                    onBackButtonPress={showAmountPicker ? () => setShowAmountPicker(false) : onClose}
                />
                {showAmountPicker ? AmountPicker : SimulateOptions}

                {!showAmountPicker && Footer}
            </ScreenWrapper>
        </Modal>
    );
}

SimulatePendingTransaction.displayName = 'SimulatePendingTransaction';

export default SimulatePendingTransaction;
