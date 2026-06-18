import {useCallback, useEffect, useMemo, useState} from 'react';
import type {ValueOf} from 'type-fest';
import {calculateRemainingTrialSeconds, calculateTrialDayNumber, doesUserHavePaymentCardAdded, isUserOnFreeTrial} from '@libs/SubscriptionUtils';
import {setNameValuePair} from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import useOnyx from './useOnyx';

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const TWENTY_FOUR_HOURS_IN_SECONDS = 24 * 60 * 60;

/** Onyx values not yet resolved */
const READINESS_LOADING = 'loading';
/** Onyx loaded, no trial yet */
const READINESS_PRE_TRIAL = 'preTrial';
/** Trial just appeared, 5-minute settle window before showing the modal */
const READINESS_TRIAL_STARTUP_GRACE = 'trialStartupGrace';
/** Eligible to show the modal */
const READINESS_READY = 'ready';

const READINESS_STATE = {
    LOADING: READINESS_LOADING,
    PRE_TRIAL: READINESS_PRE_TRIAL,
    TRIAL_STARTUP_GRACE: READINESS_TRIAL_STARTUP_GRACE,
    READY: READINESS_READY,
} as const;

type TrialReminderVariant = ValueOf<typeof CONST.TRIAL_REMINDER_VARIANT>;
type ReadinessState = ValueOf<typeof READINESS_STATE>;

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

/**
 * Returns the remaining time (ms) of the 5-minute startup grace window relative to the trial's start time.
 * Returns 0 when the trial start is unparsable or the grace window has already elapsed.
 */
function getTrialStartupGraceRemainingMs(firstDayFreeTrial: string): number {
    const trialStartMs = new Date(`${firstDayFreeTrial}Z`).getTime();
    if (!Number.isFinite(trialStartMs)) {
        return 0;
    }
    return Math.max(trialStartMs + FIVE_MINUTES_MS - Date.now(), 0);
}

/**
 * Returns the timestamp (ms) when the current variation's window started. A dismissal whose timestamp
 * is at or after this is considered to apply to the current variation.
 */
function getVariationWindowStart(variationId: string, firstDayFreeTrial: string | undefined, lastDayFreeTrial: string | undefined): number | null {
    if (variationId === 'last24h') {
        if (!lastDayFreeTrial) {
            return null;
        }
        return new Date(`${lastDayFreeTrial}Z`).getTime() - TWENTY_FOUR_HOURS_IN_SECONDS * 1000;
    }
    if (!firstDayFreeTrial) {
        return null;
    }
    const variation = TRIAL_REMINDER_VARIATIONS.find((v) => v.id === variationId);
    if (!variation || variation.dayOfTrial <= 0) {
        return null;
    }
    return new Date(`${firstDayFreeTrial}Z`).getTime() + (variation.dayOfTrial - 1) * TWENTY_FOUR_HOURS_IN_SECONDS * 1000;
}

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
    const [dismissedTimestamp, dismissedTimestampResult] = useOnyx(ONYXKEYS.NVP_DISMISSED_TRIAL_PAYMENT_REMINDER);

    const [readinessState, setReadinessState] = useState<ReadinessState>(READINESS_STATE.LOADING);

    useEffect(() => {
        if (isLoadingOnyxValue(firstDayFreeTrialResult)) {
            return;
        }

        if (readinessState === READINESS_STATE.LOADING) {
            // Onyx resolves asynchronously after mount, so the initial LOADING → READY/PRE_TRIAL/GRACE transition
            // must be driven by an effect once the Onyx value settles.
            if (!firstDayFreeTrial) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setReadinessState(READINESS_STATE.PRE_TRIAL);
                return;
            }
            // Trial is already present on first observation — apply the grace window if it just started
            // (e.g., the modal manager mounted right after first-workspace creation), otherwise it's safe to show.
            setReadinessState(getTrialStartupGraceRemainingMs(firstDayFreeTrial) > 0 ? READINESS_STATE.TRIAL_STARTUP_GRACE : READINESS_STATE.READY);
            return;
        }

        if (readinessState === READINESS_STATE.PRE_TRIAL && firstDayFreeTrial) {
            // PRE_TRIAL → TRIAL_STARTUP_GRACE fires when firstDayFreeTrial appears mid-session
            // (trial was just created); this can only be detected by reacting to the Onyx change,
            // hence setState inside the effect.
            setReadinessState(READINESS_STATE.TRIAL_STARTUP_GRACE);
            return;
        }

        // Trial disappeared mid-session (logout, account switch, or trial revoked) — drop back to PRE_TRIAL
        // so a subsequent login with a new trial re-runs the grace window against the new firstDayFreeTrial.
        if (readinessState !== READINESS_STATE.PRE_TRIAL && !firstDayFreeTrial) {
            setReadinessState(READINESS_STATE.PRE_TRIAL);
        }
    }, [readinessState, firstDayFreeTrial, firstDayFreeTrialResult]);

    // Run the grace timer after a trial is created. Use the trial's actual start time so a late mount
    // only waits out the remainder of the 5-minute window, not a fresh 5 minutes from mount.
    useEffect(() => {
        if (readinessState !== READINESS_STATE.TRIAL_STARTUP_GRACE || !firstDayFreeTrial) {
            return;
        }
        const timer = setTimeout(() => setReadinessState(READINESS_STATE.READY), getTrialStartupGraceRemainingMs(firstDayFreeTrial));
        return () => clearTimeout(timer);
    }, [readinessState, firstDayFreeTrial]);

    const [countdownTime, setCountdownTime] = useState<CountdownTime>({hours: 0, minutes: 0, seconds: 0});

    const currentVariation = useMemo(() => computeCurrentVariation(firstDayFreeTrial, lastDayFreeTrial), [firstDayFreeTrial, lastDayFreeTrial]);

    // Run countdown timer when variant is 'countdown'
    useEffect(() => {
        if (currentVariation?.variant !== CONST.TRIAL_REMINDER_VARIANT.COUNTDOWN) {
            return;
        }

        const updateCountdown = () => {
            const secs = calculateRemainingTrialSeconds(lastDayFreeTrial);
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

    const isEligibleToShow = useMemo(() => {
        if (!isUserOnFreeTrial(firstDayFreeTrial, lastDayFreeTrial)) {
            return false;
        }
        if (doesUserHavePaymentCardAdded(billingFundID)) {
            return false;
        }
        if (readinessState !== READINESS_STATE.READY) {
            return false;
        }
        if (isLoadingOnyxValue(dismissedTimestampResult)) {
            return false;
        }
        if (!currentVariation) {
            return false;
        }
        if (dismissedTimestamp) {
            const windowStart = getVariationWindowStart(currentVariation.id, firstDayFreeTrial, lastDayFreeTrial);
            const dismissedMs = new Date(dismissedTimestamp).getTime();
            if (windowStart !== null && Number.isFinite(dismissedMs) && dismissedMs >= windowStart) {
                return false;
            }
        }
        return true;
    }, [firstDayFreeTrial, lastDayFreeTrial, billingFundID, readinessState, currentVariation, dismissedTimestamp, dismissedTimestampResult]);

    const dismiss = useCallback(() => {
        if (!currentVariation) {
            return;
        }
        setNameValuePair(ONYXKEYS.NVP_DISMISSED_TRIAL_PAYMENT_REMINDER, new Date().toISOString(), dismissedTimestamp ?? '');
    }, [currentVariation, dismissedTimestamp]);

    return {isEligibleToShow, currentVariation, countdownTime, dismiss};
}

export default useTrialPaymentReminder;
export type {TrialReminderVariant, CountdownTime};
