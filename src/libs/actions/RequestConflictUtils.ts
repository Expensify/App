import type {OnyxKey, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {TupleToUnion} from 'type-fest';
import type {DetachReceiptParams, OpenReportParams, UpdateCommentParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import type {ApiRequestCommandParameters} from '@libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type OnyxRequest from '@src/types/onyx/Request';
import type {AnyRequest, ConflictActionData} from '@src/types/onyx/Request';

type AnyRequestMatcher = (request: AnyRequest) => boolean;

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
    WRITE_COMMANDS.ENABLE_POLICY_HR,
    WRITE_COMMANDS.TOGGLE_RECEIPT_PARTNERS,
    WRITE_COMMANDS.ENABLE_POLICY_CATEGORIES,
    WRITE_COMMANDS.ENABLE_POLICY_TAGS,
    WRITE_COMMANDS.ENABLE_POLICY_TAXES,
    WRITE_COMMANDS.ENABLE_POLICY_REPORT_FIELDS,
    WRITE_COMMANDS.ENABLE_POLICY_WORKFLOWS,
    WRITE_COMMANDS.SET_POLICY_RULES_ENABLED,
    WRITE_COMMANDS.ENABLE_POLICY_INVOICING,
    WRITE_COMMANDS.ENABLE_POLICY_TRAVEL,
    WRITE_COMMANDS.ENABLE_POLICY_TIME_TRACKING,
] as const;

type EnablePolicyFeatureCommand = TupleToUnion<typeof enablePolicyFeatureCommand>;

function createUpdateCommentMatcher(reportActionID: string) {
    return function (request: AnyRequest) {
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
function resolveDuplicationConflictAction(persistedRequests: AnyRequest[], requestMatcher: AnyRequestMatcher): ConflictActionData {
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

function resolveOpenReportDuplicationConflictAction<TKey extends OnyxKey>(persistedRequests: Array<OnyxRequest<TKey>>, parameters: OpenReportParams): ConflictActionData {
    for (let index = 0; index < persistedRequests.length; index++) {
        const request = persistedRequests.at(index);
        if (request?.command === WRITE_COMMANDS.OPEN_REPORT && request.data?.reportID === parameters.reportID && request.data?.emailList === parameters.emailList) {
            // If the previous request had guided setup data, we can safely ignore the new request
            if (request.data.guidedSetupData) {
                return {
                    conflictAction: {
                        type: 'noAction',
                    },
                };
            }

            // The queued request carries the participants needed to create the optimistic chat on the
            // server (e.g. from navigateToAndOpenReportWithAccountIDs). A follow-up OpenReport fired by
            // ReportFetchHandler when the screen mounts has no participants. Replacing would drop the
            // accountIDList, leaving the server with no way to resolve the optimistic reportID — Auth
            // returns NIL reportSummary and PHP throws "Report not found" (da7984df).
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            const queuedHasParticipants = !!(request.data?.emailList || request.data?.accountIDList);
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            const newHasParticipants = !!(parameters.emailList || parameters.accountIDList);
            if (queuedHasParticipants && !newHasParticipants) {
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

function isReconnectFamilyRequest(request: AnyRequest | null | undefined): request is AnyRequest {
    return !!request && (request.command === WRITE_COMMANDS.OPEN_APP || request.command === WRITE_COMMANDS.RECONNECT_APP);
}

function isOpenAppRequest(request: AnyRequest): boolean {
    return request.command === WRITE_COMMANDS.OPEN_APP;
}

/**
 * Read the `updateIDFrom` coverage marker off untyped reconnect params via `in`-narrowing (no cast),
 * so the incoming request the API builds carries the same value the resolver reads. Returns it raw;
 * `reconnectCoverageFrom` below is the single place that interprets it as a coverage number.
 */
function readUpdateIDFrom(params: unknown): unknown {
    if (typeof params === 'object' && params !== null && 'updateIDFrom' in params) {
        return params.updateIDFrom;
    }
    return undefined;
}

/**
 * How far back a reconnect re-fetches: a lower number means more coverage. OpenApp and a full
 * ReconnectApp re-fetch everything (0); an incremental ReconnectApp covers only from its
 * `updateIDFrom` onward. Mirrors the `!updateIDFrom` "is full reconnect" notion in App.ts.
 */
function reconnectCoverageFrom(request: AnyRequest): number {
    const updateIDFrom = request.data?.updateIDFrom;
    return typeof updateIDFrom === 'number' ? updateIDFrom : 0;
}

/**
 * Duplicate-conflict resolver for the reconnect family (OpenApp / ReconnectApp). Unlike the generic
 * resolver it also consults the in-flight (`ongoingRequest`) request, and decides by coverage rather
 * than by command name: an incoming reconnect already covered by one in flight or queued is dropped
 * (`noAction`), while a wider one is pushed to run after. This closes the in-flight dedupe gap the
 * generic resolver leaves open (it scans the waiting queue only) and is the durable convergence point
 * for the reconnect family. Preserve and extend it in the SequentialQueue refactor; do not delete it.
 *
 * Two asymmetries:
 * - An incoming OpenApp is never dropped. Its `successData` can carry caller-specific preservation
 *   writes that coverage cannot see (coverage only measures how far back the server re-fetch reaches),
 *   so collapsing one OpenApp onto another could silently drop them.
 * - A live OpenApp covers an incoming ReconnectApp, since it re-fetches everything. A reconnect that
 *   lands while an OpenApp is live is still dropped.
 */
function resolveReconnectDuplicationConflictAction(persistedRequests: AnyRequest[], ongoingRequest: AnyRequest | null, incomingRequest: AnyRequest): ConflictActionData {
    if (isOpenAppRequest(incomingRequest)) {
        return {
            conflictAction: {
                type: 'push',
            },
        };
    }

    const incomingCoverage = reconnectCoverageFrom(incomingRequest);
    const isCovered = [ongoingRequest, ...persistedRequests].some((live) => isReconnectFamilyRequest(live) && reconnectCoverageFrom(live) <= incomingCoverage);

    if (isCovered) {
        return {
            conflictAction: {
                type: 'noAction',
            },
        };
    }

    return {
        conflictAction: {
            type: 'push',
        },
    };
}

function resolveCommentDeletionConflicts<TKey extends OnyxKey>(persistedRequests: Array<OnyxRequest<TKey>>, reportActionID: string, originalReportID: string): ConflictActionData {
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
        const rollbackData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
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

function resolveEditCommentWithNewAddCommentRequest<TKey extends OnyxKey>(
    persistedRequests: Array<OnyxRequest<TKey>>,
    parameters: UpdateCommentParams,
    reportActionID: string,
    addCommentIndex: number,
): ConflictActionData {
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

function resolveEnableFeatureConflicts<TKey extends OnyxKey>(
    command: EnablePolicyFeatureCommand,
    persistedRequests: Array<OnyxRequest<TKey>>,
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

function resolveDetachReceiptConflicts<TKey extends OnyxKey>(persistedRequests: Array<OnyxRequest<TKey>>, parameters: DetachReceiptParams): ConflictActionData {
    const indicesToDelete: number[] = [];
    for (const [index, request] of persistedRequests.entries()) {
        if (request.command !== WRITE_COMMANDS.REPLACE_RECEIPT || request.data?.transactionID !== parameters.transactionID) {
            continue;
        }
        indicesToDelete.push(index);
    }

    // In the case the transaction doesn't have the receipt, remove all the replace receipt requests will make the detach receipt request invalid
    // So we should keep the last replace receipt request to ensure the detach receipt request is always valid
    if (indicesToDelete.length >= 1) {
        indicesToDelete.pop();
    }

    if (indicesToDelete.length === 0) {
        return {
            conflictAction: {
                type: 'push',
            },
        };
    }

    return {
        conflictAction: {
            type: 'delete',
            indices: indicesToDelete,
            pushNewRequest: true,
        },
    };
}

export {
    resolveDuplicationConflictAction,
    resolveOpenReportDuplicationConflictAction,
    resolveReconnectDuplicationConflictAction,
    readUpdateIDFrom,
    resolveCommentDeletionConflicts,
    resolveEditCommentWithNewAddCommentRequest,
    createUpdateCommentMatcher,
    resolveEnableFeatureConflicts,
    enablePolicyFeatureCommand,
    resolveDetachReceiptConflicts,
};

export type {EnablePolicyFeatureCommand, AnyRequestMatcher};
