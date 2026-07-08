import {getCorrectedAutoReportingFrequency} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

/**
 * #95373 — "Rate field is not disabled when submission frequency is off".
 * RateField.tsx:91 computes `isRateInteractive = !!rate && !isReadOnly && iouType !== SPLIT`, which drives
 * both `shouldShowRightIcon` (l.103) and `interactive` (l.140). It never inspects the policy's submission
 * frequency, so on a workspace with submissions off (Delay submissions disabled → corrected freq === MANUAL)
 * the rate row stays interactive. Expected: disabled. This proves the bug and that folding the
 * submission-frequency signal into the gate flips it — using the REAL PolicyUtils helper + CONST.
 */

// current gate (RateField.tsx:91) — ignores the policy entirely
const currentGate = (rate: number | undefined, isReadOnly: boolean, iouType: string) => !!rate && !isReadOnly && iouType !== CONST.IOU.TYPE.SPLIT;

// the fix — disable the rate for a workspace expense when submissions are off (corrected freq === MANUAL)
const isSubmissionFrequencyOff = (policy: Policy, isPolicyExpenseChat: boolean) =>
    isPolicyExpenseChat && (!policy?.autoReporting || getCorrectedAutoReportingFrequency(policy) === CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL);
const fixedGate = (rate: number | undefined, isReadOnly: boolean, iouType: string, policy: Policy, isPolicyExpenseChat: boolean) =>
    currentGate(rate, isReadOnly, iouType) && !isSubmissionFrequencyOff(policy, isPolicyExpenseChat);

// submissions OFF: immediate + harvesting disabled  →  getCorrectedAutoReportingFrequency === MANUAL
const policySubmissionsOff = {autoReporting: true, autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE, harvesting: {enabled: false}} as Policy;
// submissions ON: immediate + harvesting enabled  →  getCorrectedAutoReportingFrequency === IMMEDIATE
const policySubmissionsOn = {autoReporting: true, autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE, harvesting: {enabled: true}} as Policy;

const RATE = 100;

describe('#95373 Rate field disabled when submission frequency is off', () => {
    it('the workspace state maps to MANUAL/IMMEDIATE as expected', () => {
        expect(getCorrectedAutoReportingFrequency(policySubmissionsOff)).toBe(CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL);
        expect(getCorrectedAutoReportingFrequency(policySubmissionsOn)).toBe(CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE);
    });

    it('BUG: current gate leaves the rate INTERACTIVE even when submissions are off', () => {
        // reproduces the report — rate row is tappable / shows the chevron regardless of submission frequency
        expect(currentGate(RATE, false, CONST.IOU.TYPE.SUBMIT)).toBe(true);
    });

    it('FIX: gate disables the rate when submissions are off, and leaves it interactive otherwise', () => {
        // submissions off on a workspace expense → disabled (matches Expected Result)
        expect(fixedGate(RATE, false, CONST.IOU.TYPE.SUBMIT, policySubmissionsOff, true)).toBe(false);
        // submissions on → unchanged (still interactive)
        expect(fixedGate(RATE, false, CONST.IOU.TYPE.SUBMIT, policySubmissionsOn, true)).toBe(true);
        // personal (non-workspace) expense → unaffected, still interactive
        expect(fixedGate(RATE, false, CONST.IOU.TYPE.SUBMIT, policySubmissionsOff, false)).toBe(true);
    });
});
