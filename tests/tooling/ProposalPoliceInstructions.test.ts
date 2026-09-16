import {describe, expect, it} from 'bun:test';

import {buildCommentIntentInstructions, buildDuplicateCheckInstructions, buildEditCheckInstructions} from '@prompts/proposalPolice/instructions';

/**
 * The whole point of splitting the old single dashboard prompt into per-call fragments is that each call
 * only sees the rules it needs. Nothing else enforces that, so a fragment added to the wrong builder
 * would silently reintroduce the blob these were split out of.
 */
describe('instruction isolation', () => {
    const commentIntent = buildCommentIntentInstructions();
    const editCheck = buildEditCheckInstructions();
    const duplicateCheck = buildDuplicateCheckInstructions();

    it('gives every call the role and the proposal template', () => {
        for (const instructions of [commentIntent, editCheck, duplicateCheck]) {
            expect(instructions).toContain('You are a GitHub bot');
            expect(instructions).toContain('PROPOSAL TEMPLATE');
        }
    });

    it('keeps duplicate-detection rules out of the other two calls', () => {
        expect(duplicateCheck).toContain('DUPLICATE PROPOSAL DETECTION');
        expect(commentIntent).not.toContain('DUPLICATE PROPOSAL DETECTION');
        expect(editCheck).not.toContain('DUPLICATE PROPOSAL DETECTION');
    });

    it('keeps edit classification out of the other two calls', () => {
        expect(editCheck).toContain('ACTION_EDIT');
        expect(commentIntent).not.toContain('ACTION_EDIT');
        expect(duplicateCheck).not.toContain('ACTION_EDIT');
    });

    it('keeps intent classification out of the other two calls', () => {
        expect(commentIntent).toContain('GENUINE_ATTEMPT');
        expect(editCheck).not.toContain('GENUINE_ATTEMPT');
        expect(duplicateCheck).not.toContain('GENUINE_ATTEMPT');
    });

    it('recognizes takeover and review coordination as ordinary discussion', () => {
        expect(commentIntent).toContain('take over');
        expect(commentIntent).toContain('review');
        expect(commentIntent).toContain('NOT_AN_ATTEMPT');
    });

    it('never tells a call about a similarity cutoff, which is applied in code', () => {
        for (const instructions of [commentIntent, editCheck, duplicateCheck]) {
            expect(instructions).not.toContain('ACTION_HIDE_DUPLICATE');
        }
    });
});
