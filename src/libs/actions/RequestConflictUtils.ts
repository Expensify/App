import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {TupleToUnion} from 'type-fest';
import type {OpenReportParams, UpdateCommentParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import type {ApiRequestCommandParameters} from '@libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type OnyxRequest from '@src/types/onyx/Request';
import type {ConflictActionData} from '@src/types/onyx/Request';

type RequestMatcher = (request: OnyxRequest) => boolean;

const addNewMessage = new Set<string>([WRITE_COMMANDS.ADD_COMMENT, WRITE_COMMANDS.ADD_ATTACHMENT, WRITE_COMMANDS.ADD_TEXT_AND_ATTACHMENT]);

const commentsToBeDeleted = new Set<string>([
    WRITE_COMMANDS.ADD_COMMENT,
    WRITE_COMMANDS.ADD_ATTACHMENT,
    WRITE_COMMANDS.ADD_TEXT_AND_ATTACHMENT,
    WRITE_COMMANDS.UPDATE_COMMENT,
    WRITE_COMMANDS.ADD_EMOJI_REACTION,
    WRITE_COMMANDS.REMOVE_EMOJI_REACTION,
]);

const enablePolicyFeatureCommand = [
    WRITE_COMMANDS.ENABLE_POLICY_DISTANCE_RATES,
    WRITE_COMMANDS.ENABLE_POLICY_EXPENSIFY_CARDS,
    WRITE_COMMANDS.ENABLE_POLICY_COMPANY_CARDS,
    WRITE_COMMANDS.ENABLE_POLICY_CONNECTIONS,
    WRITE_COMMANDS.TOGGLE_RECEIPT_PARTNERS,
    WRITE_COMMANDS.ENABLE_POLICY_CATEGORIES,
    WRITE_COMMANDS.ENABLE_POLICY_TAGS,
    WRITE_COMMANDS.ENABLE_POLICY_TAXES,
    WRITE_COMMANDS.ENABLE_POLICY_REPORT_FIELDS,
    WRITE_COMMANDS.ENABLE_POLICY_WORKFLOWS,
    WRITE_COMMANDS.SET_POLICY_RULES_ENABLED,
    WRITE_COMMANDS.ENABLE_POLICY_INVOICING,
] as const;

type EnablePolicyFeatureCommand = TupleToUnion<typeof enablePolicyFeatureCommand>;

function createUpdateCommentMatcher(reportActionID: string) {
    return function (request: OnyxRequest) {
        return request.command === WRITE_COMMANDS.UPDATE_COMMENT && request.data?.reportActionID === reportActionID;
    };
}

/**
 * Determines the appropriate action for handling duplication conflicts in persisted requests.
 *
 * This method checks if any request in the list of persisted requests matches the criteria defined by the request matcher function.
 * - If no match is found, it suggests adding the request to the list, indicating a 'push' action.
 * - If a match is found, it suggests updating the existing entry, indicating a 'replace' action at the found index.
 */
function resolveDuplicationConflictAction(persistedRequests: OnyxRequest[], requestMatcher: RequestMatcher): ConflictActionData {
    const index = persistedRequests.findIndex(requestMatcher);
    if (index === -1) {
        return {
            conflictAction: {
                type: 'push',
            },
        };
    }

    return {
        conflictAction: {
            type: 'replace',
            index,
        },
    };
}

function resolveOpenReportDuplicationConflictAction(persistedRequests: OnyxRequest[], parameters: OpenReportParams): ConflictActionData {
    for (let index = 0; index < persistedRequests.length; index++) {
        const request = persistedRequests.at(index);
        if (request && request.command === WRITE_COMMANDS.OPEN_REPORT && request.data?.reportID === parameters.reportID && request.data?.emailList === parameters.emailList) {
            // If the previous request had guided setup data, we can safely ignore the new request
            if (request.data.guidedSetupData) {
                return {
                    conflictAction: {
                        type: 'noAction',
                    },
                };
            }

            // In other cases it's safe to replace the previous request with the new one
            return {
                conflictAction: {
                    type: 'replace',
                    index,
                },
            };
        }
    }

    // If we didn't find any request to replace, we should push the new request
    return {
        conflictAction: {
            type: 'push',
        },
    };
}

function resolveCommentDeletionConflicts(persistedRequests: OnyxRequest[], reportActionID: string, originalReportID: string): ConflictActionData {
    const commentIndicesToDelete: number[] = [];
    const commentCouldBeThread: Record<string, number> = {};
    let addCommentFound = false;
    for (const [index, request] of persistedRequests.entries()) {
        // If the request will open a Thread, we should not delete the comment and we should send all the requests
        if (request.command === WRITE_COMMANDS.OPEN_REPORT && request.data?.parentReportActionID === reportActionID && reportActionID in commentCouldBeThread) {
            const indexToRemove = commentCouldBeThread[reportActionID];
            commentIndicesToDelete.splice(indexToRemove, 1);
            // The new message performs some changes in Onyx, we want to keep those changes.
            addCommentFound = false;
            continue;
        }

        if (!commentsToBeDeleted.has(request.command) || request.data?.reportActionID !== reportActionID) {
            continue;
        }

        // If we find a new message, we probably want to remove it and not perform any request given that the server
        // doesn't know about it yet.
        if (addNewMessage.has(request.command) && !request.isRollback) {
            addCommentFound = true;
            commentCouldBeThread[reportActionID] = commentIndicesToDelete.length;
        }
        commentIndicesToDelete.push(index);
    }

    if (commentIndicesToDelete.length === 0) {
        return {
            conflictAction: {
                type: 'push',
            },
        };
    }

    if (addCommentFound) {
        // The new message performs some changes in Onyx, so we need to rollback those changes.
        const rollbackData: OnyxUpdate[] = [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`,
                value: {
                    [reportActionID]: null,
                },
            },
        ];
        Onyx.update(rollbackData);
    }

    return {
        conflictAction: {
            type: 'delete',
            indices: commentIndicesToDelete,
            pushNewRequest: !addCommentFound,
        },
    };
}

function resolveEditCommentWithNewAddCommentRequest(persistedRequests: OnyxRequest[], parameters: UpdateCommentParams, reportActionID: string, addCommentIndex: number): ConflictActionData {
    const indicesToDelete: number[] = [];
    for (const [index, request] of persistedRequests.entries()) {
        if (request.command !== WRITE_COMMANDS.UPDATE_COMMENT || request.data?.reportActionID !== reportActionID) {
            continue;
        }
        indicesToDelete.push(index);
    }

    const currentAddComment = persistedRequests.at(addCommentIndex);
    let nextAction = null;
    if (currentAddComment) {
        currentAddComment.data = {...currentAddComment.data, ...parameters};
        nextAction = {
            type: 'replace',
            index: addCommentIndex,
            request: currentAddComment,
        };

        if (indicesToDelete.length === 0) {
            return {
                conflictAction: nextAction,
            } as ConflictActionData;
        }
    }

    return {
        conflictAction: {
            type: 'delete',
            indices: indicesToDelete,
            pushNewRequest: false,
            nextAction,
        },
    } as ConflictActionData;
}

function resolveEnableFeatureConflicts(
    command: EnablePolicyFeatureCommand,
    persistedRequests: OnyxRequest[],
    parameters: ApiRequestCommandParameters[EnablePolicyFeatureCommand],
): ConflictActionData {
    const deleteRequestIndex = persistedRequests.findIndex(
        (request) => request.command === command && request.data?.policyID === parameters.policyID && request.data?.enabled !== parameters.enabled,
    );

    if (deleteRequestIndex === -1) {
        return {
            conflictAction: {
                type: 'push',
            },
        };
    }

    return {
        conflictAction: {
            type: 'delete',
            indices: [deleteRequestIndex],
            pushNewRequest: false,
        },
    };
}

export {
    resolveDuplicationConflictAction,
    resolveOpenReportDuplicationConflictAction,
    resolveCommentDeletionConflicts,
    resolveEditCommentWithNewAddCommentRequest,
    createUpdateCommentMatcher,
    resolveEnableFeatureConflicts,
    enablePolicyFeatureCommand,
};

export type {EnablePolicyFeatureCommand, RequestMatcher};
