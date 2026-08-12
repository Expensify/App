import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';
import isBotUser from '@github/libs/isBotUser';
import isProposal from '@github/libs/ProposalUtils';

import {buildDuplicateCheckInput, buildDuplicateCheckSeedItem, buildEditCheckInput, buildTemplateCheckInput} from '@prompts/proposalPolice/input';
import {buildDuplicateCheckInstructions, buildEditCheckInstructions, buildTemplateCheckInstructions} from '@prompts/proposalPolice/instructions';
import {
    buildDuplicateCheckNoticeMessage,
    buildSubstantiveEditMessage,
    buildTemplateReminderMessage,
    DUPLICATE_CHECK_WITHDRAW_MESSAGE,
    SUBSTANTIVE_EDIT_MESSAGE_PREFIX,
    SUBSTANTIVE_EDIT_MESSAGE_REGEX,
} from '@prompts/proposalPolice/messages';
import {
    DUPLICATE_CHECK_RESPONSE_FORMAT,
    EDIT_CHECK_RESPONSE_FORMAT,
    isDuplicateCheckResponse,
    isEditCheckResponse,
    isTemplateCheckResponse,
    TEMPLATE_CHECK_RESPONSE_FORMAT,
} from '@prompts/proposalPolice/schema';
import type {DuplicateCheckResponse, EditCheckResponse, TemplateCheckResponse} from '@prompts/proposalPolice/schema';

import OpenAIUtils from '@scripts/utils/OpenAIUtils';
import {
    buildSeedItems,
    buildTrackingCommentBody,
    chunkArray,
    findConversationItemIDForComment,
    findTrackedConversationID,
    MAX_ITEMS_PER_CONVERSATION_REQUEST,
} from '@scripts/utils/ProposalPolice/ProposalPoliceConversation';

import type {IssueCommentCreatedEvent, IssueCommentEditedEvent, IssueCommentEvent} from '@octokit/webhooks-types';

import {getInput, setFailed} from '@actions/core';
import * as core from '@actions/core';
import {context} from '@actions/github';
import {format} from 'date-fns';
import {toZonedTime} from 'date-fns-tz';

/**
 * The model ProposalPolice uses for all Responses API calls, replacing the Assistant's GPT-4o.
 */
const PROPOSAL_POLICE_MODEL = 'gpt-5.6-luna';

/**
 * How similar (0-100) a new proposal must be to an existing one before it's withdrawn as a duplicate.
 * The model only reports a similarity score; this threshold is applied here so tuning it doesn't
 * depend on the model reproducing a cutoff stated in the prompt.
 */
const DUPLICATE_SIMILARITY_THRESHOLD = 85;

function isCommentCreatedEvent(payload: IssueCommentEvent): payload is IssueCommentCreatedEvent {
    return payload.action === CONST.ACTIONS.CREATED;
}

function isCommentEditedEvent(payload: IssueCommentEvent): payload is IssueCommentEditedEvent {
    return payload.action === CONST.ACTIONS.EDITED;
}

/**
 * Make the Conversation hold exactly one copy of this comment, containing the text it has now, and
 * only while it is still a proposal. Duplicate checks read the Conversation rather than live GitHub
 * comments, so anything missing from it is invisible to them and anything stale misleads them.
 *
 * Dropping the existing copy before re-adding covers every way an edit can land: the text changed, the
 * comment only became a proposal on this edit (nothing stored yet), or it stopped being one (the stored
 * copy has to go, with nothing put back).
 */
async function refreshStoredProposal(openAI: OpenAIUtils, issueNumber: number, commentID: number, proposalBody: string) {
    const trackedConversationID = findTrackedConversationID(await GithubUtils.getAllCommentDetails(issueNumber));
    if (!trackedConversationID) {
        console.log('Issue has no tracked Conversation, so there is nothing to record this proposal against.');
        return;
    }

    const staleItemID = findConversationItemIDForComment(await openAI.listConversationItems(trackedConversationID), commentID);
    if (staleItemID) {
        await openAI.deleteConversationItem(trackedConversationID, staleItemID);
    }

    if (!isProposal(proposalBody)) {
        console.log('Comment is no longer a proposal, so it is not being recorded for duplicate checks.', commentID);
        return;
    }

    console.log('Recording the current text of this proposal for future duplicate checks.', commentID);
    await openAI.addConversationItems(trackedConversationID, [buildDuplicateCheckSeedItem(proposalBody, commentID)]);
}

// Main function to process the workflow event
async function run() {
    // Capture the timestamp immediately at the start of the run
    const now = Date.now();
    const zonedDate = toZonedTime(now, 'UTC');
    const formattedDate = format(zonedDate, "yyyy-MM-dd HH:mm:ss 'UTC'");

    // Verify this is running for an expected webhook event
    if (context.eventName !== CONST.EVENTS.ISSUE_COMMENT) {
        throw new Error('ProposalPolice™ only supports the issue_comment webhook event');
    }

    const payload = context.payload as IssueCommentEvent;

    // Return early unless issue is open AND has the "Help Wanted" label
    if (payload.issue?.state !== CONST.STATE.OPEN || !payload.issue?.labels.some((issueLabel: {name: string}) => issueLabel.name === CONST.LABELS.HELP_WANTED)) {
        console.log('Issue is not open or does not have the "Help Wanted" label, skipping checks.');
        return;
    }

    // Verify that the comment is not empty and contains the case sensitive `Proposal` keyword
    if (!payload.comment?.body.trim() || !payload.comment?.body.includes(CONST.PROPOSAL_KEYWORD)) {
        console.log('Comment body is either empty or doesn\'t contain the keyword "Proposal": ', payload.comment?.body);
        return;
    }

    // GitHub only sends the previous body when the edit actually changed it. Without it there is no
    // edit to classify, and an empty original would read as a full rewrite and be flagged as substantial.
    if (isCommentEditedEvent(payload) && !payload.changes.body?.from) {
        console.log('Edited event did not change the comment body, skipping the edit check.');
        return;
    }

    // The edit check only grades how much a proposal changed, so a heavily reworded discussion comment
    // that merely mentions the word "Proposal" would otherwise come back as a substantial edit and get
    // the bot's banner prepended. Either side being a proposal is enough: an edit can add the template
    // to a comment that lacked it, or strip it from one that had it.
    if (isCommentEditedEvent(payload) && !isProposal(payload.changes.body?.from) && !isProposal(payload.comment?.body)) {
        console.log('Edited comment is not a proposal, skipping the edit check.');
        return;
    }

    console.log('ProposalPolice™ Action triggered for comment:', payload.comment?.body);
    console.log('-> GitHub Action Type: ', payload.action?.toUpperCase());

    if (!isCommentCreatedEvent(payload) && !isCommentEditedEvent(payload)) {
        console.error('Unsupported action type:', payload?.action);
        setFailed(new Error(`Unsupported action type ${payload?.action}`));
        return;
    }

    const apiKey = getInput('PROPOSAL_POLICE_API_KEY', {required: true});
    const openAI = new OpenAIUtils(apiKey);

    const issueNumber = payload.issue?.number ?? -1;
    /* eslint-disable rulesdir/no-default-id-values */
    const commentID = payload.comment?.id ?? -1;

    // DUPLICATE PROPOSAL DETECTION
    if (isCommentCreatedEvent(payload)) {
        console.log('Starting DUPLICATE PROPOSAL DETECTION Check');
        const newProposalCreatedAt = new Date(payload.comment.created_at).getTime();
        const newProposalBody = payload.comment.body;
        const newProposalAuthor = payload.comment.user.login;
        if (isBotUser(payload.comment.user.login, payload.comment.user.type)) {
            console.log('New comment is from a bot. Skipping duplicate check.');
            return;
        }

        // Fetch all comments in the issue
        console.log('Get comments for issue #', issueNumber);
        const commentsResponse = await GithubUtils.getAllCommentDetails(issueNumber);
        core.startGroup('Comments Response');
        console.log('commentsResponse', commentsResponse);
        core.endGroup();

        const isNewCommentAProposal = isProposal(newProposalBody);
        if (!isNewCommentAProposal) {
            console.log('New comment is not a proposal. Skipping duplicate check.');
            return;
        }

        // Find any existing OpenAI Conversation that tracks this issue's proposals for duplicate detection
        let conversationID = findTrackedConversationID(commentsResponse);

        // Reusing a tracked Conversation implies it has at least one prior proposal in it (that's why it was created);
        // a freshly created one only has prior proposals if we seeded it with any.
        let hasPriorProposals = !!conversationID;
        if (!conversationID) {
            console.log("No tracked Conversation found for this issue. Creating one and seeding it with the issue's prior proposals...");
            const seedItems = buildSeedItems(commentsResponse, newProposalCreatedAt);
            hasPriorProposals = seedItems.length > 0;
            const seedItemChunks = chunkArray(seedItems, MAX_ITEMS_PER_CONVERSATION_REQUEST);
            const conversation = await openAI.createConversation(seedItemChunks.at(0));
            conversationID = conversation.id;
            // Persist the tracking marker as early as possible: if a later seed chunk fails to send, the next
            // run can still find this Conversation instead of creating (and fragmenting history into) a new one.
            await GithubUtils.createComment(CONST.APP_REPO, issueNumber, buildTrackingCommentBody(conversationID));
            for (const chunk of seedItemChunks.slice(1)) {
                await openAI.addConversationItems(conversationID, chunk);
            }
        }

        // Skip the duplicate-check call entirely when there's nothing in the Conversation yet to compare against
        if (hasPriorProposals) {
            const duplicateCheckResponse = await openAI.promptResponses({
                conversation: conversationID,
                instructions: buildDuplicateCheckInstructions(),
                input: buildDuplicateCheckInput(newProposalBody, commentID),
                model: PROPOSAL_POLICE_MODEL,
                promptCacheKey: 'proposal-police-duplicate-check',
                textFormat: DUPLICATE_CHECK_RESPONSE_FORMAT,
            });
            const parsedDuplicateCheckResponse = openAI.parseJSONResponse<DuplicateCheckResponse>(duplicateCheckResponse.text, isDuplicateCheckResponse);
            core.startGroup('Parsed Duplicate Check Response');
            console.log('parsedDuplicateCheckResponse: ', parsedDuplicateCheckResponse);
            core.endGroup();

            const similarityPercentage = parsedDuplicateCheckResponse?.similarity ?? 0;

            // The reported match must still be a live proposal on this issue. The model can name a comment
            // that has since been withdrawn or edited into a different solution, and it can invent an ID
            // outright. Withdrawing on one of those would destroy a contributor's legitimate work, so an
            // unresolvable match is treated as "not a duplicate" rather than trusted.
            const originalProposal = commentsResponse.find(
                (comment) => comment.id === parsedDuplicateCheckResponse?.duplicateCommentID && comment.id !== commentID && isProposal(comment.body),
            );
            if (similarityPercentage >= DUPLICATE_SIMILARITY_THRESHOLD && !originalProposal) {
                console.log(
                    `Reported duplicate of comment ${parsedDuplicateCheckResponse?.duplicateCommentID} scored ${similarityPercentage}% but is no longer a live proposal, so keeping this one.`,
                );
            } else if (similarityPercentage >= DUPLICATE_SIMILARITY_THRESHOLD && originalProposal) {
                console.log(`Found duplicate with ${similarityPercentage}% similarity.`);

                // If a duplicate proposal is detected, update the comment to withdraw it
                console.log('ProposalPolice™ withdrawing duplicated proposal...');
                await GithubUtils.octokit.issues.updateComment({
                    ...context.repo,
                    /* eslint-disable @typescript-eslint/naming-convention */
                    comment_id: commentID,
                    body: DUPLICATE_CHECK_WITHDRAW_MESSAGE,
                });

                // Post a comment to notify the user about the withdrawn duplicated proposal
                console.log('ProposalPolice™ notifying contributor of withdrawn proposal...');
                await GithubUtils.createComment(CONST.APP_REPO, issueNumber, buildDuplicateCheckNoticeMessage(newProposalAuthor, originalProposal.html_url));

                // The duplicate-check call already appended this proposal to the Conversation. Leaving it
                // there would let a later proposal match this withdrawn copy instead of the still-live
                // original, and the guard above would then wave that later proposal through.
                const withdrawnItemID = findConversationItemIDForComment(await openAI.listConversationItems(conversationID), commentID);
                if (withdrawnItemID) {
                    await openAI.deleteConversationItem(conversationID, withdrawnItemID);
                }

                console.log('DUPLICATE PROPOSAL DETECTION Check Completed, returning early.');
                return;
            }
        } else {
            // The duplicate-check call is what appends items to the Conversation (via its `conversation` param), so skipping
            // it here would leave this proposal permanently unrecorded and invisible to every future duplicate check on this
            // issue. Record it directly instead.
            console.log('No prior proposals exist for this issue yet; skipping the duplicate-check API call, but recording this proposal for future comparisons.');
            await openAI.addConversationItems(conversationID, [buildDuplicateCheckSeedItem(newProposalBody, commentID)]);
        }
    }

    // A comment we already bannered must never be bannered again, which is the only thing the edit check
    // decides, so skip it. The proposal text can still have changed though, and without this the
    // Conversation would keep serving every future duplicate check the copy stored before this edit.
    if (isCommentEditedEvent(payload) && payload.comment.body.trim().includes(SUBSTANTIVE_EDIT_MESSAGE_PREFIX)) {
        console.log('Comment was already edited by proposal-police once, so only refreshing its recorded copy.\n', payload.comment.body);
        // Store the proposal itself, not the banner a previous run prepended to it
        await refreshStoredProposal(openAI, issueNumber, commentID, payload.comment.body.replace(SUBSTANTIVE_EDIT_MESSAGE_REGEX, ''));
        return;
    }

    const instructions = isCommentCreatedEvent(payload) ? buildTemplateCheckInstructions() : buildEditCheckInstructions();
    const input = isCommentCreatedEvent(payload) ? buildTemplateCheckInput(payload.comment?.body) : buildEditCheckInput(payload.changes.body?.from, payload.comment?.body);
    const textFormat = isCommentCreatedEvent(payload) ? TEMPLATE_CHECK_RESPONSE_FORMAT : EDIT_CHECK_RESPONSE_FORMAT;

    const response = await openAI.promptResponses({
        instructions,
        input,
        model: PROPOSAL_POLICE_MODEL,
        promptCacheKey: isCommentCreatedEvent(payload) ? 'proposal-police-template-check' : 'proposal-police-edit-check',
        textFormat,
    });

    const parsedResponse: TemplateCheckResponse | EditCheckResponse | null = isCommentCreatedEvent(payload)
        ? openAI.parseJSONResponse<TemplateCheckResponse>(response.text, isTemplateCheckResponse)
        : openAI.parseJSONResponse<EditCheckResponse>(response.text, isEditCheckResponse);

    core.startGroup('Parsed Response');
    console.log('parsedResponse: ', parsedResponse);
    core.endGroup();

    // Fall back to NO_ACTION so a parse failure leaves the comment untouched
    const action = parsedResponse?.action ?? CONST.NO_ACTION;
    if (action === CONST.NO_ACTION) {
        console.log('Detected NO_ACTION for comment, returning early.');
        return;
    }

    if (isCommentCreatedEvent(payload) && action === CONST.ACTION_REQUIRED) {
        console.log('ProposalPolice™ commenting on issue...');
        await GithubUtils.createComment(CONST.APP_REPO, issueNumber, buildTemplateReminderMessage(payload.comment?.user.login));

        // edit comment if substantial changes were detected
    } else if (action === CONST.ACTION_EDIT) {
        console.log('ProposalPolice™ editing issue comment...', commentID);
        await GithubUtils.octokit.issues.updateComment({
            ...context.repo,
            /* eslint-disable @typescript-eslint/naming-convention */
            comment_id: commentID,
            body: `${buildSubstantiveEditMessage(formattedDate)}\n\n${payload.comment?.body}`,
        });

        // The Conversation still holds this proposal as it read before the edit, so refresh it. Only
        // substantial edits land here; minor rewording is deliberately left as-is.
        await refreshStoredProposal(openAI, issueNumber, commentID, payload.comment?.body ?? '');
    }
}

// Consistent with every other action in .github/actions/javascript/*: only auto-invoke when this file is
// the actual entry point, not when Jest imports it as a module to unit test `run` directly.
if (require.main === module) {
    run().catch((error) => {
        console.error(error);
        // Zero status ensures that the action is marked as successful regardless the outcome
        // which means that no failure notification is sent to issue's subscribers
        process.exit(0);
    });
}

export default run;
export {PROPOSAL_POLICE_MODEL, DUPLICATE_SIMILARITY_THRESHOLD};
