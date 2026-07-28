import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';
import {getIsBotAuthor, getIsProposal} from '@github/libs/ProposalUtils';

import {buildDuplicateCheckInput, buildDuplicateCheckSeedItem, buildEditCheckInput, buildTemplateCheckInput} from '@prompts/proposalPolice/input';
import {buildDuplicateCheckInstructions, buildEditCheckInstructions, buildTemplateCheckInstructions} from '@prompts/proposalPolice/instructions';
import {getDuplicateCheckNoticeMessage, getDuplicateCheckWithdrawMessage} from '@prompts/proposalPolice/messages';
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
import {buildSeedItems, buildTrackingCommentBody, chunkArray, findTrackedConversationID, MAX_ITEMS_PER_CONVERSATION_REQUEST} from '@scripts/utils/ProposalPolice/ProposalPoliceConversation';

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

function isCommentCreatedEvent(payload: IssueCommentEvent): payload is IssueCommentCreatedEvent {
    return payload.action === CONST.ACTIONS.CREATED;
}

function isCommentEditedEvent(payload: IssueCommentEvent): payload is IssueCommentEditedEvent {
    return payload.action === CONST.ACTIONS.EDITED;
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

    // If event is `edited` and comment was already edited by the bot, return early
    if (isCommentEditedEvent(payload) && payload.comment?.body.trim().includes('Edited by **proposal-police**')) {
        console.log('Comment was already edited by proposal-police once.\n', payload.comment?.body);
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
        if (getIsBotAuthor(payload.comment.user)) {
            console.log('New comment is from a bot. Skipping duplicate check.');
            return;
        }

        // Fetch all comments in the issue
        console.log('Get comments for issue #', issueNumber);
        const commentsResponse = await GithubUtils.getAllCommentDetails(issueNumber);
        core.startGroup('Comments Response');
        console.log('commentsResponse', commentsResponse);
        core.endGroup();

        const isNewCommentAProposal = getIsProposal(newProposalBody);
        if (!isNewCommentAProposal) {
            console.log('New comment is not a proposal. Skipping duplicate check.');
            return;
        }

        // Find (or create) the OpenAI Conversation that tracks this issue's proposals for duplicate detection
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
            await GithubUtils.pinIssue(issueNumber);
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
            if (parsedDuplicateCheckResponse?.action === CONST.ACTION_HIDE_DUPLICATE && similarityPercentage >= 90) {
                console.log(`Found duplicate with ${similarityPercentage}% similarity.`);
                // Sanity-check the model's reported duplicateCommentId against the real comment list before trusting it for the notice link
                const originalProposal = commentsResponse.find(
                    (comment) => comment.id === parsedDuplicateCheckResponse?.duplicateCommentId && comment.id !== commentID && getIsProposal(comment.body),
                );
                const duplicateCheckWithdrawMessage = getDuplicateCheckWithdrawMessage();
                const duplicateCheckNoticeMessage = getDuplicateCheckNoticeMessage(newProposalAuthor, originalProposal?.html_url);
                // If a duplicate proposal is detected, update the comment to withdraw it
                console.log('ProposalPolice™ withdrawing duplicated proposal...');
                await GithubUtils.octokit.issues.updateComment({
                    ...context.repo,
                    /* eslint-disable @typescript-eslint/naming-convention */
                    comment_id: commentID,
                    body: duplicateCheckWithdrawMessage,
                });
                // Post a comment to notify the user about the withdrawn duplicated proposal
                console.log('ProposalPolice™ notifying contributor of withdrawn proposal...');
                await GithubUtils.createComment(CONST.APP_REPO, issueNumber, duplicateCheckNoticeMessage);
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

    // fallback to empty strings to avoid crashing in case parsing fails
    const {action = '', message = ''} = parsedResponse ?? {};
    const isNoAction = action.trim() === CONST.NO_ACTION;
    const isActionEdit = action.trim() === CONST.ACTION_EDIT;
    const isActionRequired = action.trim() === CONST.ACTION_REQUIRED;

    // If the response is NO_ACTION and there's no message, return early
    if (isNoAction && !message) {
        console.log('Detected NO_ACTION for comment, returning early.');
        return;
    }

    if (isCommentCreatedEvent(payload) && isActionRequired) {
        const formattedResponse = message
            // replace {user} from response template with @username
            .replaceAll('{user}', `@${payload.comment?.user.login}`);

        // Create a comment with the response
        console.log('ProposalPolice™ commenting on issue...');
        await GithubUtils.createComment(CONST.APP_REPO, issueNumber, formattedResponse);
        // edit comment if substantial changes were detected
    } else if (isActionEdit) {
        const formattedResponse = message.replace('{updated_timestamp}', formattedDate);
        console.log('ProposalPolice™ editing issue comment...', commentID);
        await GithubUtils.octokit.issues.updateComment({
            ...context.repo,
            /* eslint-disable @typescript-eslint/naming-convention */
            comment_id: commentID,
            body: `${formattedResponse}\n\n${payload.comment?.body}`,
        });
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
