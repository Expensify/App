/**
 * Unit tests for toggleEmojiReaction.
 * Verifies that when both legacy (name-keyed) and hex-keyed entries exist for the same emoji,
 * the current user's actual reaction entry is used for the remove/add decision.
 */
import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

import {toggleEmojiReaction} from '@userActions/EmojiReactions';

import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';
import type ReportActionReactions from '@src/types/onyx/ReportActionReactions';

jest.mock('@libs/ReportActionsUtils', () => ({
    getReportAction: () => ({reportActionID: 'action1'}),
}));

jest.mock('@libs/ReportUtils', () => ({
    getOriginalReportID: () => 'report1',
}));

jest.mock('@libs/API', () => ({
    write: jest.fn(),
}));

const THUMBSUP = {name: '+1', code: '👍', hexcode: '1F44D'};
const REPORT_ID = 'report1';
const ACTION = {reportActionID: 'action1'} as ReportAction;
const USER_A = 12345;
const USER_B = 67890;
const SKIN_TONE = CONST.EMOJI_DEFAULT_SKIN_TONE;
const TIMESTAMP = '2024-01-01T00:00:00.000Z';

function makeUserReaction(id: number) {
    return {id: String(id), oldestTimestamp: TIMESTAMP, skinTones: {[-1]: TIMESTAMP}};
}

const writeMock = write as jest.Mock;

beforeEach(() => {
    writeMock.mockClear();
});

describe('toggleEmojiReaction — mixed-format Onyx state', () => {
    it('removes from the name-keyed entry when the current user reacted there, even if a hex entry exists', () => {
        const THUMBSUP_HEX = '1F44D';
        const THUMBSUP_NAME = '+1';
        const existingReactions: ReportActionReactions = {
            [THUMBSUP_HEX]: {
                createdAt: TIMESTAMP,
                oldestTimestamp: TIMESTAMP,
                users: {[USER_B]: makeUserReaction(USER_B)},
            },
            [THUMBSUP_NAME]: {
                createdAt: TIMESTAMP,
                oldestTimestamp: TIMESTAMP,
                users: {[USER_A]: makeUserReaction(USER_A)},
            },
        };

        toggleEmojiReaction(REPORT_ID, ACTION, THUMBSUP, existingReactions, SKIN_TONE, USER_A);

        expect(writeMock).toHaveBeenCalledTimes(1);
        const [command, params] = writeMock.mock.calls.at(0) as [string, {emojiCode: string}];
        expect(command).toBe(WRITE_COMMANDS.REMOVE_EMOJI_REACTION);
        expect(params.emojiCode).toBe(THUMBSUP_NAME);
    });

    it('removes from the hex entry when the current user reacted there', () => {
        const THUMBSUP_HEX = '1F44D';
        const existingReactions: ReportActionReactions = {
            [THUMBSUP_HEX]: {
                createdAt: TIMESTAMP,
                oldestTimestamp: TIMESTAMP,
                users: {[USER_A]: makeUserReaction(USER_A)},
            },
        };

        toggleEmojiReaction(REPORT_ID, ACTION, THUMBSUP, existingReactions, SKIN_TONE, USER_A);

        expect(writeMock).toHaveBeenCalledTimes(1);
        const [command, params] = writeMock.mock.calls.at(0) as [string, {emojiCode: string}];
        expect(command).toBe(WRITE_COMMANDS.REMOVE_EMOJI_REACTION);
        expect(params.emojiCode).toBe(THUMBSUP_HEX);
    });

    it('adds when the current user has not reacted under either key', () => {
        const THUMBSUP_HEX = '1F44D';
        const existingReactions: ReportActionReactions = {
            [THUMBSUP_HEX]: {
                createdAt: TIMESTAMP,
                oldestTimestamp: TIMESTAMP,
                users: {[USER_B]: makeUserReaction(USER_B)},
            },
        };

        toggleEmojiReaction(REPORT_ID, ACTION, THUMBSUP, existingReactions, SKIN_TONE, USER_A);

        expect(writeMock).toHaveBeenCalledTimes(1);
        const [command] = writeMock.mock.calls.at(0) as [string];
        expect(command).toBe(WRITE_COMMANDS.ADD_EMOJI_REACTION);
    });

    it('prefers the hex entry when the current user appears under both keys', () => {
        const THUMBSUP_HEX = '1F44D';
        const THUMBSUP_NAME = '+1';
        const existingReactions: ReportActionReactions = {
            [THUMBSUP_HEX]: {
                createdAt: TIMESTAMP,
                oldestTimestamp: TIMESTAMP,
                users: {[USER_A]: makeUserReaction(USER_A)},
            },
            [THUMBSUP_NAME]: {
                createdAt: TIMESTAMP,
                oldestTimestamp: TIMESTAMP,
                users: {[USER_A]: makeUserReaction(USER_A)},
            },
        };

        toggleEmojiReaction(REPORT_ID, ACTION, THUMBSUP, existingReactions, SKIN_TONE, USER_A);

        expect(writeMock).toHaveBeenCalledTimes(1);
        const [command, params] = writeMock.mock.calls.at(0) as [string, {emojiCode: string}];
        expect(command).toBe(WRITE_COMMANDS.REMOVE_EMOJI_REACTION);
        expect(params.emojiCode).toBe(THUMBSUP_HEX);
    });
});
