/**
 * Cover/reveal contract of the free trial countdown once the Home tab sits under `ScreenActivityWrapper`.
 *
 * `useFreeTrial` keeps a one-second interval running so the discount countdown stays current. A cover clears that
 * interval and a reveal starts a new one, which is only safe because every tick is read off the trial start date
 * rather than counted down: however long the cover lasted, the next tick is the value the clock says and none of the
 * covered time is replayed. The reveal frame itself carries the value from before the cover, at most one tick out of
 * date, and it must keep carrying it, because blanking it turns every reveal into a flash of the no-discount banner.
 *
 * `setupAfterEnv` puts the whole suite on real timers, so this file opts back into fake ones to drive the interval.
 */
import {act} from '@testing-library/react-native';

import {getOwnedPaidPolicies} from '@libs/PolicyUtils';
import type {DiscountInfo} from '@libs/SubscriptionUtils';
import {calculateRemainingFreeTrialDays, doesUserHavePaymentCardAdded, getEarlyDiscountInfo, isUserOnFreeTrial, shouldShowDiscountBanner} from '@libs/SubscriptionUtils';

import type {FreeTrialState} from '@pages/home/FreeTrialSection/useFreeTrial';
import useFreeTrial from '@pages/home/FreeTrialSection/useFreeTrial';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useEffect} from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import renderScreenWithCover, {getCoverMode} from '../../utils/ScreenCoverHarness';

jest.mock('@hooks/useHasTeam2025Pricing', () => ({
    __esModule: true,
    default: jest.fn(() => false),
}));

jest.mock('@hooks/useSubscriptionPlan', () => ({
    __esModule: true,
    default: jest.fn(() => 'corporate'),
}));

jest.mock('@libs/PolicyUtils', () => ({
    getOwnedPaidPolicies: jest.fn(),
}));

jest.mock('@libs/SubscriptionUtils', () => ({
    shouldShowDiscountBanner: jest.fn(),
    getEarlyDiscountInfo: jest.fn(),
    isUserOnFreeTrial: jest.fn(),
    doesUserHavePaymentCardAdded: jest.fn(),
    calculateRemainingFreeTrialDays: jest.fn(),
}));

const mockedGetOwnedPaidPolicies = jest.mocked(getOwnedPaidPolicies);
const mockedShouldShowDiscountBanner = jest.mocked(shouldShowDiscountBanner);
const mockedGetEarlyDiscountInfo = jest.mocked(getEarlyDiscountInfo);
const mockedIsUserOnFreeTrial = jest.mocked(isUserOnFreeTrial);
const mockedDoesUserHavePaymentCardAdded = jest.mocked(doesUserHavePaymentCardAdded);
const mockedCalculateRemainingFreeTrialDays = jest.mocked(calculateRemainingFreeTrialDays);

const TRIAL_START = new Date('2026-09-03T11:00:00.000Z');
const DISCOUNT_DEADLINE = new Date('2026-09-04T11:00:00.000Z');
const HALF_OFF = 50;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_MINUTE = 60;

function secondsLeftOnTheClock(): number {
    return Math.max(0, Math.round((DISCOUNT_DEADLINE.getTime() - Date.now()) / CONST.MILLISECONDS_PER_SECOND));
}

/** Stands in for the real discount maths: a value read off the clock, so a late call can never report a stale number. */
function discountInfoFromClock(): DiscountInfo {
    const secondsLeft = secondsLeftOnTheClock();

    return {
        discountType: HALF_OFF,
        days: 0,
        hours: Math.floor(secondsLeft / SECONDS_PER_HOUR),
        minutes: Math.floor(secondsLeft / SECONDS_PER_MINUTE) % SECONDS_PER_MINUTE,
        seconds: secondsLeft % SECONDS_PER_MINUTE,
    };
}

function secondsLeftIn(discountInfo: DiscountInfo | null | undefined): number | undefined {
    if (!discountInfo) {
        return undefined;
    }

    return discountInfo.hours * SECONDS_PER_HOUR + discountInfo.minutes * SECONDS_PER_MINUTE + discountInfo.seconds;
}

let observedStates: FreeTrialState[] = [];

/** Records every commit of the real hook, so a test can look at the very first frame a reveal put on screen. */
function FreeTrialProbe() {
    const state = useFreeTrial();

    useEffect(() => {
        observedStates.push(state);
    });

    return null;
}

function lastObserved(): FreeTrialState | undefined {
    return observedStates.at(-1);
}

/** Every recomputation of the countdown goes through `getEarlyDiscountInfo`, so its call count is the tick count. */
function tickCount(): number {
    return mockedGetEarlyDiscountInfo.mock.calls.length;
}

async function advanceSeconds(seconds: number) {
    await act(async () => {
        jest.advanceTimersByTime(seconds * CONST.MILLISECONDS_PER_SECOND);
    });
}

describe('useFreeTrial under a screen cover', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        jest.useFakeTimers();
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    beforeEach(() => {
        jest.setSystemTime(TRIAL_START);
        observedStates = [];
        mockedGetOwnedPaidPolicies.mockReturnValue([createMock<ReturnType<typeof getOwnedPaidPolicies>[number]>({id: 'policyID'})]);
        mockedIsUserOnFreeTrial.mockReturnValue(true);
        mockedDoesUserHavePaymentCardAdded.mockReturnValue(false);
        mockedCalculateRemainingFreeTrialDays.mockReturnValue(30);
        mockedShouldShowDiscountBanner.mockReturnValue(true);
        mockedGetEarlyDiscountInfo.mockClear();
        mockedGetEarlyDiscountInfo.mockImplementation(discountInfoFromClock);
    });

    it('ticks the countdown once a second while the screen is visible', async () => {
        renderScreenWithCover(<FreeTrialProbe />);
        const ticksAtMount = tickCount();

        await advanceSeconds(3);

        expect(tickCount() - ticksAtMount).toBe(3);
        expect(secondsLeftIn(lastObserved()?.discountInfo)).toBe(secondsLeftOnTheClock());
    });

    it('clears the interval on a hide, so a covered screen stops recomputing the countdown', async () => {
        const home = renderScreenWithCover(<FreeTrialProbe />);
        await advanceSeconds(2);

        await home.hide();
        const ticksBeforeTheCoveredWait = tickCount();
        await advanceSeconds(5);

        expect(tickCount() - ticksBeforeTheCoveredWait).toBe(getCoverMode() === 'activity' ? 0 : 5);
    });

    it('restarts the interval on a reveal', async () => {
        const home = renderScreenWithCover(<FreeTrialProbe />);
        await advanceSeconds(2);

        await home.hide();
        await advanceSeconds(600);
        await home.reveal();
        const ticksAtReveal = tickCount();
        await advanceSeconds(1);

        expect(tickCount() - ticksAtReveal).toBe(1);
    });

    it('shows the value the clock says after a long cover, with no drift to catch up on', async () => {
        const home = renderScreenWithCover(<FreeTrialProbe />);
        await advanceSeconds(2);

        await home.hide();
        await advanceSeconds(600);
        await home.reveal();
        await advanceSeconds(1);

        // The restarted interval reads the trial start date, so the ten covered minutes are simply gone, not replayed.
        expect(secondsLeftIn(lastObserved()?.discountInfo)).toBe(secondsLeftOnTheClock());
    });

    it('keeps the discount on the first frame after a reveal, so the banner never falls back to the no-discount copy', async () => {
        const home = renderScreenWithCover(<FreeTrialProbe />);
        await advanceSeconds(2);
        expect(lastObserved()?.discountType).toBe(HALF_OFF);
        const secondsShownBeforeTheCover = secondsLeftIn(lastObserved()?.discountInfo);

        await home.hide();
        await advanceSeconds(600);
        const commitsBeforeReveal = observedStates.length;
        await home.reveal();

        expect(observedStates.at(commitsBeforeReveal)?.discountType).toBe(HALF_OFF);

        if (getCoverMode() === 'activity') {
            // The frame the reveal paints carries the value the cover left behind, at most one tick out of date, which
            // is the whole reason the interval's cleanup must not blank it. Under `none` nothing ever stopped ticking.
            expect(secondsLeftIn(observedStates.at(commitsBeforeReveal)?.discountInfo)).toBe(secondsShownBeforeTheCover);
        }
    });

    it('runs no interval at all when the user has no discount to count down', async () => {
        mockedShouldShowDiscountBanner.mockReturnValue(false);
        const home = renderScreenWithCover(<FreeTrialProbe />);

        await home.hide();
        await home.reveal();
        await advanceSeconds(5);

        expect(mockedGetEarlyDiscountInfo).not.toHaveBeenCalled();
        expect(lastObserved()?.shouldShowFreeTrialSection).toBe(true);
        expect(lastObserved()?.discountType).toBeNull();
    });
});
