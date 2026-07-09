import type {Emoji} from '@assets/emojis/types';

import {write} from '@libs/API';
import type {AddEmojiReactionParams, RemoveEmojiReactionParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {findEmojiByCode, hasAccountIDEmojiReacted} from '@libs/EmojiUtils';
import {getReportAction} from '@libs/ReportActionsUtils';
import {getOriginalReportID} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, ReportActionReactions} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';

import {format as timezoneFormat, toZonedTime} from 'date-fns-tz';
import Onyx from 'react-native-onyx';

/**
 * Adds a reaction to the report action.
 * Uses the NEW FORMAT for "emojiReactions"
 */
function addEmojiReaction(reportID: string, reportActionID: string, emoji: Emoji, skinTone: number, currentUserAccountID: number) {
    const createdAt = timezoneFormat(toZonedTime(new Date(), 'UTC'), CONST.DATE.FNS_DB_FORMAT_STRING);
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`,
            value: {
                [emoji.name]: {
                    createdAt,
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    users: {
                        [currentUserAccountID]: {
                            skinTones: {
                                [skinTone]: createdAt,
                            },
                        },
                    },
                },
            },
        },
    ];

    const finallyData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`,
            // Auth resolves the name-keyed emojiCode to a canonical hexcode and NIL-merges the
            // legacy name key in its Onyx response. NIL the optimistic name key here too instead of
            // just clearing its pendingAction, otherwise this finallyData recreates a name-key stub
            // (with no `users`) after the server has already cleared it.
            value: emoji.hexcode
                ? {
                      [emoji.name]: null,
                      [emoji.hexcode]: {pendingAction: null},
                  }
                : {
                      [emoji.name]: {pendingAction: null},
                  },
        },
    ];

    const parameters: AddEmojiReactionParams = {
        reportID,
        skinTone,
        emojiCode: emoji.name,
        reportActionID,
        createdAt,
    };

    write(WRITE_COMMANDS.ADD_EMOJI_REACTION, parameters, {optimisticData, finallyData});
}

/**
 * Removes a reaction to the report action.
 * Uses the NEW FORMAT for "emojiReactions"
 */
function removeEmojiReaction(reportID: string, reportActionID: string, emoji: Emoji, currentUserAccountID: number, reactionKey?: string) {
    const onyxKey = reactionKey ?? emoji.hexcode ?? emoji.name;
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`,
            value: {
                [onyxKey]: {
                    users: {
                        [currentUserAccountID]: null,
                    },
                },
            },
        },
    ];

    const parameters: RemoveEmojiReactionParams = {
        reportID,
        reportActionID,
        emojiCode: onyxKey,
    };

    write(WRITE_COMMANDS.REMOVE_EMOJI_REACTION, parameters, {optimisticData});
}

/**
 * Calls either addEmojiReaction or removeEmojiReaction depending on if the current user has reacted to the report action.
 * Uses the NEW FORMAT for "emojiReactions"
 */
function toggleEmojiReaction(
    reportID: string | undefined,
    reportAction: ReportAction,
    reactionObject: Emoji,
    existingReactions: OnyxEntry<ReportActionReactions>,
    paramSkinTone: number,
    currentUserAccountID: number,
    ignoreSkinToneOnCompare = false,
) {
    const originalReportID = getOriginalReportID(reportID, reportAction, undefined);

    if (!originalReportID) {
        return;
    }

    const originalReportAction = getReportAction(originalReportID, reportAction.reportActionID);

    if (isEmptyObject(originalReportAction)) {
        return;
    }

    // This will get cleaned up as part of https://github.com/Expensify/App/issues/16506 once the old emoji
    // format is no longer being used
    const emoji = findEmojiByCode(reactionObject.code);

    // Only use skin tone if emoji supports it
    const skinTone = emoji.types === undefined ? CONST.EMOJI_DEFAULT_SKIN_TONE : paramSkinTone;
    const skinToneToCheck = ignoreSkinToneOnCompare ? undefined : skinTone;

    // When both a legacy name-keyed and a hex-keyed entry exist for the same emoji, find the
    // key under which the current user has actually reacted so we remove the right entry.
    // Prefer the hex (canonical) key so that the server-confirmed entry is cleared first;
    // any stale name-keyed optimistic residue will be cleaned up by the server's Onyx update.
    const hexEntry = emoji.hexcode ? existingReactions?.[emoji.hexcode] : undefined;
    const nameEntry = existingReactions?.[emoji.name];

    const userReactedUnderName = !!nameEntry?.users && hasAccountIDEmojiReacted(currentUserAccountID, nameEntry.users, skinToneToCheck);
    const userReactedUnderHex = !!hexEntry?.users && hasAccountIDEmojiReacted(currentUserAccountID, hexEntry.users, skinToneToCheck);

    if (userReactedUnderHex && emoji.hexcode) {
        removeEmojiReaction(originalReportID, reportAction.reportActionID, emoji, currentUserAccountID, emoji.hexcode);
        return;
    }

    if (userReactedUnderName) {
        removeEmojiReaction(originalReportID, reportAction.reportActionID, emoji, currentUserAccountID, emoji.name);
        return;
    }

    addEmojiReaction(originalReportID, reportAction.reportActionID, emoji, skinTone, currentUserAccountID);
}

// eslint-disable-next-line import/prefer-default-export
export {toggleEmojiReaction};
