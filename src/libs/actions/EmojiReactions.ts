import {format as timezoneFormat, toZonedTime} from 'date-fns-tz';
import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {Emoji} from '@assets/emojis/types';
import * as API from '@libs/API';
import type {AddEmojiReactionParams, RemoveEmojiReactionParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as EmojiUtils from '@libs/EmojiUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import {getOriginalReportID} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, ReportActionReactions} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

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

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`,
            value: {
                [emoji.name]: {
                    pendingAction: null,
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`,
            value: {
                [emoji.name]: {
                    pendingAction: null,
                },
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

    API.write(WRITE_COMMANDS.ADD_EMOJI_REACTION, parameters, {optimisticData, successData, failureData});
}

/**
 * Removes a reaction to the report action.
 * Uses the NEW FORMAT for "emojiReactions"
 */
function removeEmojiReaction(reportID: string, reportActionID: string, emoji: Emoji, currentUserAccountID: number) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`,
            value: {
                [emoji.name]: {
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
        emojiCode: emoji.name,
    };

    API.write(WRITE_COMMANDS.REMOVE_EMOJI_REACTION, parameters, {optimisticData});
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

    const originalReportAction = ReportActionsUtils.getReportAction(originalReportID, reportAction.reportActionID);

    if (isEmptyObject(originalReportAction)) {
        return;
    }

    // This will get cleaned up as part of https://github.com/Expensify/App/issues/16506 once the old emoji
    // format is no longer being used
    const emoji = EmojiUtils.findEmojiByCode(reactionObject.code);
    const existingReactionObject = existingReactions?.[emoji.name] ?? (emoji.hexcode ? existingReactions?.[emoji.hexcode] : undefined);

    // Only use skin tone if emoji supports it
    const skinTone = emoji.types === undefined ? CONST.EMOJI_DEFAULT_SKIN_TONE : paramSkinTone;

    if (existingReactionObject && EmojiUtils.hasAccountIDEmojiReacted(currentUserAccountID, existingReactionObject.users, ignoreSkinToneOnCompare ? undefined : skinTone)) {
        removeEmojiReaction(originalReportID, reportAction.reportActionID, emoji, currentUserAccountID);
        return;
    }

    addEmojiReaction(originalReportID, reportAction.reportActionID, emoji, skinTone, currentUserAccountID);
}

export {addEmojiReaction, removeEmojiReaction, toggleEmojiReaction};
