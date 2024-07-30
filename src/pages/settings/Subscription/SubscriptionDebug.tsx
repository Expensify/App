import {addDays, addMonths, format} from 'date-fns';
import {zonedTimeToUtc} from 'date-fns-tz';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import Onyx, {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import Section from '@components/Section';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useSubscriptionDebugData from '@hooks/useSubscriptionDebugData';
import useThemeStyles from '@hooks/useThemeStyles';
import DebugUtils from '@libs/DebugUtils';
import {rand64} from '@libs/NumberUtils';
import * as SubscriptionUtils from '@libs/SubscriptionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Fund} from '@src/types/onyx';

type FreeTrialState = 'PRE_TRIAL' | 'TRIAL_STARTED' | 'TRIAL_ENDED';

type ListItem<T> = {type: T; title: string};

type FreeTrialStates = Array<ListItem<FreeTrialState>>;

type SubscriptionBillingStates = Array<ListItem<ValueOf<typeof SubscriptionUtils.PAYMENT_STATUS>>>;

const FREE_TRIAL_STATES: FreeTrialStates = [
    {type: 'PRE_TRIAL', title: 'Pre trial'},
    {type: 'TRIAL_STARTED', title: 'Trial started'},
    {type: 'TRIAL_ENDED', title: 'Trial ended'},
];

const SUBSCRIPTION_BILLING_STATES: SubscriptionBillingStates = [
    {type: SubscriptionUtils.PAYMENT_STATUS.CARD_AUTHENTICATION_REQUIRED, title: 'Card authentication required'},
    {type: SubscriptionUtils.PAYMENT_STATUS.CARD_EXPIRED, title: 'Card expired'},
    {type: SubscriptionUtils.PAYMENT_STATUS.CARD_EXPIRE_SOON, title: 'Card expire soon'},
    {type: SubscriptionUtils.PAYMENT_STATUS.BILLING_DISPUTE_PENDING, title: 'Billing dispute pending'},
    {type: SubscriptionUtils.PAYMENT_STATUS.INSUFFICIENT_FUNDS, title: 'Insufficient funds'},
    {type: SubscriptionUtils.PAYMENT_STATUS.OWNER_OF_POLICY_UNDER_INVOICING, title: 'Owner of policy under invoicing'},
    {type: SubscriptionUtils.PAYMENT_STATUS.OWNER_OF_POLICY_UNDER_INVOICING_OVERDUE, title: 'Owner of policy under invoicing overdue'},
    {type: SubscriptionUtils.PAYMENT_STATUS.POLICY_OWNER_WITH_AMOUNT_OWED, title: 'Policy owner with amount owed'},
    {type: SubscriptionUtils.PAYMENT_STATUS.POLICY_OWNER_WITH_AMOUNT_OWED_OVERDUE, title: 'Policy owner with amount owed overdue'},
    {type: SubscriptionUtils.PAYMENT_STATUS.RETRY_BILLING_ERROR, title: 'Retry billing error'},
    {type: SubscriptionUtils.PAYMENT_STATUS.RETRY_BILLING_SUCCESS, title: 'Retry billing success'},
];

function getFreeTrialState(): FreeTrialState {
    if (!SubscriptionUtils.isUserOnFreeTrial() && !SubscriptionUtils.hasUserFreeTrialEnded()) {
        return 'PRE_TRIAL';
    }

    if (SubscriptionUtils.isUserOnFreeTrial()) {
        return 'TRIAL_STARTED';
    }

    return 'TRIAL_ENDED';
}

function SubscriptionDebug() {
    const [user] = useOnyx(ONYXKEYS.USER);
    const {
        onboarding,
        privateAmountOwed,
        firstDayFreeTrial,
        lastDayFreeTrial,
        billingGracePeriodEnd,
        billingFundID,
        billingCard,
        billingStatus,
        billingDisputePending,
        billingRetryStatusSuccessful,
        billingRetryStatusFailed,
        stripeCustomerID,
    } = useSubscriptionDebugData();
    const [draftBillingCard, setDraftBillingCard] = useState<string>(DebugUtils.onyxDataToString(billingCard));
    const [freeTrialState, setFreeTrialState] = useState(getFreeTrialState);
    const [subscriptionStatus, setSubscriptionStatus] = useState(SubscriptionUtils.getSubscriptionStatus);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [draftData, setDraftData] = useState({
        [ONYXKEYS.NVP_ONBOARDING]: DebugUtils.onyxDataToString(onboarding),
        [ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED]: DebugUtils.onyxDataToString(privateAmountOwed),
        [ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL]: DebugUtils.onyxDataToString(firstDayFreeTrial),
        [ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL]: DebugUtils.onyxDataToString(lastDayFreeTrial),
        [ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END]: DebugUtils.onyxDataToString(billingGracePeriodEnd),
        [ONYXKEYS.NVP_BILLING_FUND_ID]: DebugUtils.onyxDataToString(billingFundID),
        [ONYXKEYS.NVP_PRIVATE_BILLING_DISPUTE_PENDING]: DebugUtils.onyxDataToString(billingDisputePending),
        [ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID]: DebugUtils.onyxDataToString(stripeCustomerID),
        [ONYXKEYS.NVP_PRIVATE_BILLING_STATUS]: DebugUtils.onyxDataToString(billingStatus),
        [ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL]: DebugUtils.onyxDataToString(billingRetryStatusSuccessful),
        [ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED]: DebugUtils.onyxDataToString(billingRetryStatusFailed),
    });
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const onSave = () => {
        Onyx.multiSet({
            ...draftData,
            [ONYXKEYS.NVP_ONBOARDING]: DebugUtils.stringToOnyxData(draftData[ONYXKEYS.NVP_ONBOARDING], 'object'),
            [ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED]: DebugUtils.stringToOnyxData(draftData[ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED], 'number'),
            [ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END]: DebugUtils.stringToOnyxData(draftData[ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END], 'number'),
            [ONYXKEYS.NVP_BILLING_FUND_ID]: DebugUtils.stringToOnyxData(draftData[ONYXKEYS.NVP_BILLING_FUND_ID], 'number'),
            [ONYXKEYS.NVP_PRIVATE_BILLING_STATUS]: DebugUtils.stringToOnyxData(draftData[ONYXKEYS.NVP_PRIVATE_BILLING_STATUS], 'object'),
            [ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID]: DebugUtils.stringToOnyxData(draftData[ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID], 'object'),
            [ONYXKEYS.NVP_PRIVATE_BILLING_DISPUTE_PENDING]: DebugUtils.stringToOnyxData(draftData[ONYXKEYS.NVP_PRIVATE_BILLING_DISPUTE_PENDING], 'number'),
            [ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED]: DebugUtils.stringToOnyxData(draftData[ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED], 'boolean'),
            [ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL]: DebugUtils.stringToOnyxData(draftData[ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL], 'boolean'),
        });

        const parsedDraftBillingCard = DebugUtils.stringToOnyxData(draftBillingCard, 'object') as Fund;
        const id = String(parsedDraftBillingCard?.methodID ?? parsedDraftBillingCard?.accountData?.fundID ?? billingCard?.methodID ?? billingCard?.accountData?.fundID);
        // eslint-disable-next-line rulesdir/prefer-actions-set-data
        Onyx.merge(ONYXKEYS.FUND_LIST, {[id]: parsedDraftBillingCard});
    };

    const setBillingState = (status: ValueOf<typeof SubscriptionUtils.PAYMENT_STATUS>) => {
        let newBillingCard: Fund = {
            ...billingCard,
            methodID: billingCard?.methodID ?? Number(rand64()),
            accountData: {
                ...billingCard?.accountData,
                cardYear: new Date().getFullYear() + 1,
                cardMonth: new Date().getMonth() + 1,
                addressName: billingCard?.accountData?.addressName ?? 'Debug',
                currency: billingCard?.accountData?.currency ?? CONST.CURRENCY.USD,
                additionalData: {...billingCard?.accountData?.additionalData, isBillingCard: true},
            },
        };

        const newSubscriptionStatus: SubscriptionUtils.SubscriptionStatus = {status};

        const newDraftData = {
            ...draftData,
            [ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END]: 'undefined',
            [ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED]: 'undefined',
            [ONYXKEYS.NVP_PRIVATE_BILLING_DISPUTE_PENDING]: 'undefined',
            [ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID]: 'undefined',
            [ONYXKEYS.NVP_PRIVATE_BILLING_STATUS]: 'undefined',
            [ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL]: 'false',
            [ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED]: 'false',
            [ONYXKEYS.NVP_BILLING_FUND_ID]: String(newBillingCard.methodID),
        };

        switch (status) {
            case SubscriptionUtils.PAYMENT_STATUS.POLICY_OWNER_WITH_AMOUNT_OWED:
                newDraftData[ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END] = String(addMonths(new Date(), 1).getTime());
                newDraftData[ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED] = '100';
                newSubscriptionStatus.isError = true;
                break;
            case SubscriptionUtils.PAYMENT_STATUS.POLICY_OWNER_WITH_AMOUNT_OWED_OVERDUE:
                newDraftData[ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END] = String(addMonths(new Date(), -1).getTime());
                newDraftData[ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED] = '100';
                break;
            case SubscriptionUtils.PAYMENT_STATUS.OWNER_OF_POLICY_UNDER_INVOICING:
                newDraftData[ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END] = String(addMonths(new Date(), 1).getTime());
                newDraftData[ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED] = '0';
                break;
            case SubscriptionUtils.PAYMENT_STATUS.OWNER_OF_POLICY_UNDER_INVOICING_OVERDUE:
                newDraftData[ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END] = String(addMonths(new Date(), -1).getTime());
                newDraftData[ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED] = '0';
                break;
            case SubscriptionUtils.PAYMENT_STATUS.BILLING_DISPUTE_PENDING:
                newDraftData[ONYXKEYS.NVP_PRIVATE_BILLING_DISPUTE_PENDING] = '1';
                newDraftData[ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED] = '100';
                break;
            case SubscriptionUtils.PAYMENT_STATUS.CARD_AUTHENTICATION_REQUIRED:
                newDraftData[ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID] = DebugUtils.onyxDataToString({status: 'authentication_required', paymentMethodID: '', intentsID: '', currency: 'USD'});
                newDraftData[ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED] = '0';
                break;
            case SubscriptionUtils.PAYMENT_STATUS.INSUFFICIENT_FUNDS:
                newDraftData[ONYXKEYS.NVP_PRIVATE_BILLING_STATUS] = DebugUtils.onyxDataToString({declineReason: 'insufficient_funds', action: '', periodMonth: '', periodYear: ''});
                newDraftData[ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED] = '100';
                break;
            case SubscriptionUtils.PAYMENT_STATUS.CARD_EXPIRED: {
                const data = addMonths(new Date(), -1);
                newBillingCard = {...billingCard, accountData: {...billingCard?.accountData, cardYear: data.getFullYear(), cardMonth: data.getMonth()}};
                newDraftData[ONYXKEYS.NVP_PRIVATE_BILLING_STATUS] = DebugUtils.onyxDataToString({
                    declineReason: 'expired_card',
                    action: 'failed',
                    periodMonth: String(data.getMonth()),
                    periodYear: String(data.getFullYear()),
                });
                newDraftData[ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED] = '100';
                break;
            }
            case SubscriptionUtils.PAYMENT_STATUS.CARD_EXPIRE_SOON:
                newBillingCard = {
                    ...billingCard,
                    accountData: {...billingCard?.accountData, cardYear: new Date().getFullYear(), cardMonth: new Date().getMonth() + 1},
                };
                newDraftData[ONYXKEYS.NVP_PRIVATE_BILLING_STATUS] = DebugUtils.onyxDataToString({});
                break;
            case SubscriptionUtils.PAYMENT_STATUS.RETRY_BILLING_SUCCESS:
                newDraftData[ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL] = 'true';
                newSubscriptionStatus.isError = false;
                break;
            case SubscriptionUtils.PAYMENT_STATUS.RETRY_BILLING_ERROR:
                newDraftData[ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED] = 'true';
                newSubscriptionStatus.isError = true;
                break;
            default:
                break;
        }

        setSubscriptionStatus(newSubscriptionStatus);
        setDraftData(newDraftData);
        setDraftBillingCard(DebugUtils.onyxDataToString(newBillingCard));
    };

    const onPressFreeTrialState = (state: FreeTrialState) => {
        const currentDate = new Date();
        let firstDayDate = currentDate;
        let lastDayDate = currentDate;

        switch (state) {
            case 'PRE_TRIAL':
                firstDayDate = addDays(currentDate, 7);
                lastDayDate = addDays(currentDate, 7);
                break;
            case 'TRIAL_STARTED':
                lastDayDate = addDays(currentDate, 7);
                break;
            case 'TRIAL_ENDED':
            default:
                firstDayDate = addDays(currentDate, -7);
        }

        setDraftData((currentDraftData) => ({
            ...currentDraftData,
            [ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL]: firstDayDate.toISOString().slice(0, -1),
            [ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL]: lastDayDate.toISOString().slice(0, -1),
            [ONYXKEYS.NVP_BILLING_FUND_ID]: "undefined",
        }));
        setFreeTrialState(state);
    };

    const comparisonData = useMemo(
        () => [
            {draft: draftData[ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL], onyx: firstDayFreeTrial},
            {draft: draftData[ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL], onyx: lastDayFreeTrial},
            {draft: draftData[ONYXKEYS.NVP_BILLING_FUND_ID], onyx: billingFundID},
            {draft: draftBillingCard, onyx: billingCard},
            {draft: draftData[ONYXKEYS.NVP_PRIVATE_BILLING_DISPUTE_PENDING], onyx: billingDisputePending},
            {draft: draftData[ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END], onyx: billingGracePeriodEnd},
            {draft: draftData[ONYXKEYS.NVP_PRIVATE_BILLING_STATUS], onyx: billingStatus},
            {draft: draftData[ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED], onyx: billingRetryStatusFailed},
            {draft: draftData[ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL], onyx: billingRetryStatusSuccessful},
            {draft: draftData[ONYXKEYS.NVP_ONBOARDING], onyx: onboarding},
            {draft: draftData[ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED], onyx: privateAmountOwed},
        ],
        [
            billingCard,
            billingDisputePending,
            billingFundID,
            billingGracePeriodEnd,
            billingRetryStatusFailed,
            billingRetryStatusSuccessful,
            billingStatus,
            draftBillingCard,
            draftData,
            firstDayFreeTrial,
            lastDayFreeTrial,
            onboarding,
            privateAmountOwed,
        ],
    );

    if (!user?.isDebugModeEnabled) {
        return null;
    }

    return (
        <Section
            title={translate('subscription.debug.title')}
            titleStyles={styles.textStrong}
            isCentralPane
        >
            <View style={[styles.flexColumn, styles.gap5, styles.mt5]}>
                <View style={[styles.flexColumn, styles.gap2]}>
                    <Text style={styles.textBold}>Free trial states</Text>
                    <View style={[styles.flexRow, styles.gap2]}>
                        {FREE_TRIAL_STATES.map(({type, title}) => (
                            <Button
                                key={type}
                                text={title}
                                innerStyles={styles.opacity1}
                                isDisabled={freeTrialState === type}
                                success={freeTrialState === type}
                                onPress={() => onPressFreeTrialState(type)}
                            />
                        ))}
                    </View>
                </View>
                <View style={[styles.flexColumn, styles.gap2]}>
                    <Text style={styles.textBold}>Billing states</Text>
                    <View style={[styles.flexRow, styles.gap2, styles.flexWrap]}>
                        {SUBSCRIPTION_BILLING_STATES.map(({type, title}) => (
                            <Button
                                text={title}
                                innerStyles={styles.opacity1}
                                isDisabled={subscriptionStatus?.status === type}
                                success={subscriptionStatus?.status === type}
                                onPress={() => setBillingState(type)}
                            />
                        ))}
                    </View>
                </View>
                <View style={[styles.flexColumn, styles.gap2]}>
                    <Text style={styles.textBold}>Subscription data</Text>
                    <View style={[styles.flexColumn, styles.gap2]}>
                        {Object.entries(draftData).map(([key, value]) => (
                            <TextInput
                                key={key}
                                accessibilityLabel="Text input field"
                                label={key}
                                value={value}
                                multiline={DebugUtils.getNumberOfLinesFromString(value) > 1}
                                numberOfLines={DebugUtils.getNumberOfLinesFromString(value)}
                                errorText={errors[key]}
                                onChangeText={(text) => {
                                    try {
                                        if (
                                            ([ONYXKEYS.NVP_ONBOARDING, ONYXKEYS.NVP_PRIVATE_BILLING_STATUS, ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID] as string[]).includes(key) &&
                                            !'undefined'.includes(text)
                                        ) {
                                            JSON.parse(text);
                                        }
                                        setErrors((currentErrors) => ({...currentErrors, [key]: ''}));
                                    } catch (error) {
                                        setErrors((currentErrors) => ({...currentErrors, [key]: (error as SyntaxError).message}));
                                    } finally {
                                        setDraftData((data) => ({...data, [key]: text}));
                                    }
                                }}
                                requiresLabelBackground={false}
                            />
                        ))}
                        <TextInput
                            accessibilityLabel="Text input field"
                            label="Billing card (in fundList)"
                            value={draftBillingCard}
                            onChangeText={(text) => {
                                try {
                                    if (!'undefined'.includes(text)) {
                                        JSON.parse(text);
                                    }
                                    setErrors((currentErrors) => ({...currentErrors, billingCard: ''}));
                                } catch (error) {
                                    setErrors((currentErrors) => ({...currentErrors, billingCard: (error as SyntaxError).message}));
                                } finally {
                                    setDraftBillingCard(text);
                                }
                            }}
                            multiline
                            errorText={errors.billingCard}
                            numberOfLines={DebugUtils.getNumberOfLinesFromString(draftBillingCard)}
                            requiresLabelBackground={false}
                        />
                    </View>
                </View>
                <Text style={[styles.headerText, styles.textAlignCenter]}>{translate('debug.hint')}</Text>
                <Button
                    text="Save"
                    success
                    isDisabled={
                        comparisonData.reduce((prevCompResult, {draft, onyx}) => prevCompResult && DebugUtils.compareStringWithOnyxData(draft, onyx), true) ||
                        Object.values(errors).reduce((acc, error) => acc || !!error, false)
                    }
                    onPress={onSave}
                />
            </View>
        </Section>
    );
}

SubscriptionDebug.displayName = 'SubscriptionDebug';

export default SubscriptionDebug;
