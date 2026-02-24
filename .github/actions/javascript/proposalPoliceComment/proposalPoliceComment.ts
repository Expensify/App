import {getInput, setFailed} from '@actions/core';
import * as core from '@actions/core';
import {context} from '@actions/github';
import type {IssueCommentCreatedEvent, IssueCommentEditedEvent, IssueCommentEvent} from '@octokit/webhooks-types';
import {format} from 'date-fns';
import {toZonedTime} from 'date-fns-tz';
import type {TupleToUnion} from 'type-fest';
import {convertToNumber} from '@github/libs/ActionUtils';
import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';
import PROPOSAL_POLICE_TEMPLATES from '@prompts/proposalPolice';
import OpenAIUtils from '@scripts/utils/OpenAIUtils';

type AssistantResponse = {
    action: typeof CONST.NO_ACTION | typeof CONST.ACTION_REQUIRED | typeof CONST.ACTION_EDIT;
    message: string;
};

type DuplicateProposalResponse = AssistantResponse & {
    similarity?: number;
};

function isCommentCreatedEvent(payload: IssueCommentEvent): payload is IssueCommentCreatedEvent {
    return payload.action === CONST.ACTIONS.CREATED;
}

function isCommentEditedEvent(payload: IssueCommentEvent): payload is IssueCommentEditedEvent {
    return payload.action === CONST.ACTIONS.EDITED;
}

/**
 * Checks if a comment body matches the criteria for a Proposal.
 */
function getIsProposal(body: string | null | undefined): boolean {
    if (!body) {
        return false;
    }
    const lowerCaseBody = body.toLowerCase();
    return body.includes(CONST.PROPOSAL_KEYWORD) && lowerCaseBody.includes(CONST.PROPOSAL_HEADER_A) && lowerCaseBody.includes(CONST.PROPOSAL_HEADER_B);
}

/**
 * Determines if a comment author is a known bot or a bot-type account.
 */
function getIsBotAuthor(user: {login?: string; type?: string} | null | undefined): boolean {
    if (!user) {
        return false;
    }

    const knownBotLogins: string[] = [CONST.COMMENT.NAME_MELVIN_BOT, CONST.COMMENT.NAME_MELVIN_USER, CONST.COMMENT.NAME_CODEX, CONST.COMMENT.NAME_GITHUB_ACTIONS];

    const isBotType = user.type === CONST.COMMENT.TYPE_BOT;
    const isKnownLogin = knownBotLogins.includes(user.login ?? '');

    return isBotType || isKnownLogin;
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
    const assistantID = getInput('PROPOSAL_POLICE_ASSISTANT_ID', {required: true});
    const openAI = new OpenAIUtils(apiKey);

    /* eslint-disable rulesdir/no-default-id-values */
    const issueNumber = payload.issue?.number ?? -1;
    /* eslint-disable rulesdir/no-default-id-values */
    const commentID = payload.comment?.id ?? -1;

    // DUPLICATE PROPOSAL DETECTION
    if (isCommentCreatedEvent(payload)) {
        console.log('Starting DUPLICATE PROPOSAL DETECTION Check');
        const newProposalCreatedAt = new Date(payload.comment.created_at).getTime();
        const newProposalBody = payload.comment.body;
        const newProposalAuthor = payload.comment.user.login;
        // Fetch all comments in the issue
        console.log('Get comments for issue #', issueNumber);
        const commentsResponse = await GithubUtils.getAllCommentDetails(issueNumber);
        core.startGroup('Comments Response');
        console.log('commentsResponse', commentsResponse);
        core.endGroup();

        let didFindDuplicate = false;
        let originalProposal: TupleToUnion<typeof commentsResponse> | undefined;

        const isNewCommentAProposal = getIsProposal(newProposalBody);
        if (!isNewCommentAProposal) {
            console.log('New comment is not a proposal. Skipping duplicate check.');
            return;
        }

        for (const previousProposal of commentsResponse) {
            const body = previousProposal.body ?? '';
            const isProposal = getIsProposal(body);
            const previousProposalCreatedAt = new Date(previousProposal.created_at).getTime();
            // Early continue if not a proposal or previous comment is newer than current one
            if (!isProposal || previousProposalCreatedAt >= newProposalCreatedAt) {
                continue;
            }
            const isBotAuthor = getIsBotAuthor(previousProposal.user);
            // Skip prompting if comment author is the GH bot
            if (isBotAuthor) {
                continue;
            }

            const duplicateCheckPrompt = PROPOSAL_POLICE_TEMPLATES.getPromptForNewProposalDuplicateCheck(previousProposal.body, newProposalBody);
            const duplicateCheckResponse = await openAI.promptAssistant(assistantID, duplicateCheckPrompt);
            let similarityPercentage = 0;
            // eslint-disable-next-line @typescript-eslint/no-deprecated -- TODO: refactor `parseAssistantResponse` to use `promptResponses` instead
            const parsedDuplicateCheckResponse = openAI.parseAssistantResponse<DuplicateProposalResponse>(duplicateCheckResponse);
            core.startGroup('Parsed Duplicate Check Response');
            console.log('parsedDuplicateCheckResponse: ', parsedDuplicateCheckResponse);
            core.endGroup();
            if (parsedDuplicateCheckResponse) {
                const {similarity = 0} = parsedDuplicateCheckResponse ?? {};
                similarityPercentage = convertToNumber(similarity);
                if (similarityPercentage >= 90) {
                    console.log(`Found duplicate with ${similarityPercentage}% similarity.`);
                    didFindDuplicate = true;
                    originalProposal = previousProposal;
                    break;
                }
            }
        }

        if (didFindDuplicate) {
            const duplicateCheckWithdrawMessage = PROPOSAL_POLICE_TEMPLATES.getDuplicateCheckWithdrawMessage();
            const duplicateCheckNoticeMessage = PROPOSAL_POLICE_TEMPLATES.getDuplicateCheckNoticeMessage(newProposalAuthor, originalProposal?.html_url);
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
    }

    const prompt = isCommentCreatedEvent(payload)
        ? PROPOSAL_POLICE_TEMPLATES.getPromptForNewProposalTemplateCheck(payload.comment?.body)
        : PROPOSAL_POLICE_TEMPLATES.getPromptForEditedProposal(payload.changes.body?.from, payload.comment?.body);

    const assistantResponse = await openAI.promptAssistant(assistantID, prompt);
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- TODO: refactor `parseAssistantResponse` to use `promptResponses` instead
    const parsedAssistantResponse = openAI.parseAssistantResponse<AssistantResponse>(assistantResponse);
    core.startGroup('Parsed Assistant Response');
    console.log('parsedAssistantResponse: ', parsedAssistantResponse);
    core.endGroup();

    // fallback to empty strings to avoid crashing in case parsing fails
    const {action = '', message = ''} = parsedAssistantResponse ?? {};
    const isNoAction = action.trim() === CONST.NO_ACTION;
    const isActionEdit = action.trim() === CONST.ACTION_EDIT;
    const isActionRequired = action.trim() === CONST.ACTION_REQUIRED;

    // If assistant response is NO_ACTION and there's no message, return early
    if (isNoAction && !message) {
        console.log('Detected NO_ACTION for comment, returning early.');
        return;
    }

    if (isCommentCreatedEvent(payload) && isActionRequired) {
        const formattedResponse = message
            // replace {user} from response template with @username
            .replaceAll('{user}', `@${payload.comment?.user.login}`);

        // Create a comment with the assistant's response
        console.log('ProposalPolice™ commenting on issue...');
        await GithubUtils.createComment(CONST.APP_REPO, issueNumber, formattedResponse);
        // edit comment if assistant detected substantial changes
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

run().catch((error) => {
    console.error(error);
    // Zero status ensures that the action is marked as successful regardless the outcome
    // which means that no failure notification is sent to issue's subscribers
    process.exit(0);
});

export type {AssistantResponse, DuplicateProposalResponse};
