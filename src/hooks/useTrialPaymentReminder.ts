import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {ValueOf} from 'type-fest';
import {calculateRemainingTrialSeconds, calculateTrialDayNumber, doesUserHavePaymentCardAdded, isUserOnFreeTrial} from '@libs/SubscriptionUtils';
import {setNameValuePair} from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import useOnyx from './useOnyx';

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const TWENTY_FOUR_HOURS_IN_SECONDS = 24 * 60 * 60;

/** Waiting for trial data to load */
const DELAY_LOADING = 'loading';
/** No trial yet, waiting for workspace creation */
const DELAY_WAITING = 'waiting';
/** Trial just started, 5-minute timer running */
const DELAY_TIMING = 'timing';
/** Ready to show modal */
const DELAY_NO_DELAY = 'no_delay';

const DELAY_STATE = {
    LOADING: DELAY_LOADING,
    WAITING: DELAY_WAITING,
    TIMING: DELAY_TIMING,
    NO_DELAY: DELAY_NO_DELAY,
} as const;

type TrialReminderVariant = ValueOf<typeof CONST.TRIAL_REMINDER_VARIANT>;
type DelayState = ValueOf<typeof DELAY_STATE>;

type TrialReminderVariation = {
    id: string;
    variant: TrialReminderVariant;
    daysRemaining?: number;
};

type CountdownTime = {
    hours: number;
    minutes: number;
    seconds: number;
};

const TRIAL_REMINDER_VARIATIONS = [
    {id: 'day1', dayOfTrial: 1, variant: CONST.TRIAL_REMINDER_VARIANT.BASIC},
    {id: 'day2', dayOfTrial: 2, variant: CONST.TRIAL_REMINDER_VARIANT.BASIC},
    {id: 'day3', dayOfTrial: 3, variant: CONST.TRIAL_REMINDER_VARIANT.BASIC},
    {id: 'day7', dayOfTrial: 7, variant: CONST.TRIAL_REMINDER_VARIANT.BASIC},
    {id: 'day15', dayOfTrial: 15, variant: CONST.TRIAL_REMINDER_VARIANT.BASIC},
    {id: 'day28', dayOfTrial: 28, variant: CONST.TRIAL_REMINDER_VARIANT.NEAR_END},
    {id: 'day29', dayOfTrial: 29, variant: CONST.TRIAL_REMINDER_VARIANT.NEAR_END},
    {id: 'last24h', dayOfTrial: -1, variant: CONST.TRIAL_REMINDER_VARIANT.COUNTDOWN},
] as const;

function computeCurrentVariation(firstDayFreeTrial: string | undefined, lastDayFreeTrial: string | undefined): TrialReminderVariation | null {
    if (!isUserOnFreeTrial(firstDayFreeTrial, lastDayFreeTrial)) {
        return null;
    }

    const remainingSeconds = calculateRemainingTrialSeconds(lastDayFreeTrial);

    // Last 24 hours takes priority
    if (remainingSeconds <= TWENTY_FOUR_HOURS_IN_SECONDS && remainingSeconds > 0) {
        return {
            id: 'last24h',
            variant: CONST.TRIAL_REMINDER_VARIANT.COUNTDOWN,
        };
    }

    const currentTrialDay = calculateTrialDayNumber(firstDayFreeTrial);
    if (currentTrialDay <= 0) {
        return null;
    }

    for (let i = TRIAL_REMINDER_VARIATIONS.length - 1; i >= 0; i--) {
        const variation = TRIAL_REMINDER_VARIATIONS[i];
        if (variation.dayOfTrial > 0 && variation.dayOfTrial <= currentTrialDay) {
            if (variation.variant === CONST.TRIAL_REMINDER_VARIANT.NEAR_END) {
                const daysRemaining = Math.ceil(remainingSeconds / TWENTY_FOUR_HOURS_IN_SECONDS);
                return {
                    id: variation.id,
                    variant: variation.variant,
                    daysRemaining,
                };
            }
            return {
                id: variation.id,
                variant: variation.variant,
            };
        }
    }

    return null;
}

function useTrialPaymentReminder() {
    const [firstDayFreeTrial, firstDayFreeTrialResult] = useOnyx(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL);
    const [lastDayFreeTrial] = useOnyx(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL);
    const [billingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID);
    const [dismissedVariation, dismissedVariationResult] = useOnyx(ONYXKEYS.NVP_TRIAL_PAYMENT_REMINDER_DISMISSED);

    const [delayState, setDelayState] = useState<DelayState>(DELAY_STATE.LOADING);

    useEffect(() => {
        if (isLoadingOnyxValue(firstDayFreeTrialResult)) {
            return;
        }

        if (delayState === DELAY_STATE.LOADING) {
            setDelayState(firstDayFreeTrial ? DELAY_STATE.NO_DELAY : DELAY_STATE.WAITING);
            return;
        }

        if (delayState === DELAY_STATE.WAITING && firstDayFreeTrial) {
            setDelayState(DELAY_STATE.TIMING);
        }
    }, [delayState, firstDayFreeTrial, firstDayFreeTrialResult]);

    // Run 5-minute timer when in 'timing' state
    useEffect(() => {
        if (delayState !== DELAY_STATE.TIMING) {
            return;
        }
        const timer = setTimeout(() => setDelayState(DELAY_STATE.NO_DELAY), FIVE_MINUTES_MS);
        return () => clearTimeout(timer);
    }, [delayState]);

    const remainingSecondsRef = useRef(0);

    const [countdownTime, setCountdownTime] = useState<CountdownTime>({hours: 0, minutes: 0, seconds: 0});

    const currentVariation = useMemo(() => computeCurrentVariation(firstDayFreeTrial, lastDayFreeTrial), [firstDayFreeTrial, lastDayFreeTrial]);

    // Run countdown timer when variant is 'countdown'
    useEffect(() => {
        if (currentVariation?.variant !== CONST.TRIAL_REMINDER_VARIANT.COUNTDOWN) {
            return;
        }

        remainingSecondsRef.current = calculateRemainingTrialSeconds(lastDayFreeTrial);

        const updateCountdown = () => {
            remainingSecondsRef.current -= 1;
            const secs = remainingSecondsRef.current;
            if (secs <= 0) {
                setCountdownTime({hours: 0, minutes: 0, seconds: 0});
                return;
            }
            setCountdownTime({
                hours: Math.floor(secs / 3600),
                minutes: Math.floor((secs % 3600) / 60),
                seconds: Math.floor(secs % 60),
            });
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [currentVariation?.variant, lastDayFreeTrial]);

    const shouldShowModal = useMemo(() => {
        if (!isUserOnFreeTrial(firstDayFreeTrial, lastDayFreeTrial)) {
            return false;
        }
        if (doesUserHavePaymentCardAdded(billingFundID)) {
            return false;
        }
        if (delayState !== DELAY_STATE.NO_DELAY) {
            return false;
        }
        if (isLoadingOnyxValue(dismissedVariationResult)) {
            return false;
        }
        if (!currentVariation) {
            return false;
        }
        if (dismissedVariation === currentVariation.id) {
            return false;
        }
        return true;
    }, [firstDayFreeTrial, lastDayFreeTrial, billingFundID, delayState, currentVariation, dismissedVariation, dismissedVariationResult]);

    const dismiss = useCallback(() => {
        if (!currentVariation) {
            return;
        }
        setNameValuePair(ONYXKEYS.NVP_TRIAL_PAYMENT_REMINDER_DISMISSED, currentVariation.id, dismissedVariation ?? '');
    }, [currentVariation, dismissedVariation]);

    return {shouldShowModal, currentVariation, countdownTime, dismiss};
}

export default useTrialPaymentReminder;
export type {TrialReminderVariant, CountdownTime};
