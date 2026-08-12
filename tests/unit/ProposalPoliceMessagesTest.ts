/**
 * @jest-environment node
 */
import {buildSubstantiveEditMessage, SUBSTANTIVE_EDIT_MESSAGE_PREFIX, SUBSTANTIVE_EDIT_MESSAGE_REGEX} from '@prompts/proposalPolice/messages';

const PROPOSAL = ['## Proposal', '', '### What is the root cause of that problem?', 'Some root cause'].join('\n');

describe('SUBSTANTIVE_EDIT_MESSAGE_REGEX', () => {
    it('strips a banner produced by buildSubstantiveEditMessage, leaving the proposal untouched', () => {
        // Pins the regex to the real message, so changing the wording of one without the other fails here
        // rather than silently storing bannered text as if it were the contributor's proposal.
        const bannered = `${buildSubstantiveEditMessage('2026-01-01 00:00:00 UTC')}\n\n${PROPOSAL}`;

        expect(bannered.replace(SUBSTANTIVE_EDIT_MESSAGE_REGEX, '')).toBe(PROPOSAL);
    });

    it('leaves a comment that was never bannered alone', () => {
        expect(PROPOSAL.replace(SUBSTANTIVE_EDIT_MESSAGE_REGEX, '')).toBe(PROPOSAL);
    });

    it('only strips a banner at the start, not a quoted one further down', () => {
        // A contributor quoting the banner mid-comment must not cause the text above it to be dropped
        const quoting = `${PROPOSAL}\n\n> ${buildSubstantiveEditMessage('2026-01-01 00:00:00 UTC')}`;

        expect(quoting.replace(SUBSTANTIVE_EDIT_MESSAGE_REGEX, '')).toBe(quoting);
    });

    it('starts with the prefix used to detect an already-bannered comment', () => {
        expect(buildSubstantiveEditMessage('2026-01-01 00:00:00 UTC').startsWith(SUBSTANTIVE_EDIT_MESSAGE_PREFIX)).toBe(true);
    });
});
