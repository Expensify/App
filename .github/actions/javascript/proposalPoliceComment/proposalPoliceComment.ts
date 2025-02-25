import {setFailed} from '@actions/core';
import {context} from '@actions/github';
import type {IssueCommentCreatedEvent, IssueCommentEditedEvent, IssueCommentEvent} from '@octokit/webhooks-types';
import {format} from 'date-fns';
import {toZonedTime} from 'date-fns-tz';
import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';
import OpenAIUtils from '@github/libs/OpenAIUtils';
import type {AssistantResponse} from '@github/libs/OpenAIUtils';

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

    // check if the issue is open and the has labels
    if (payload.issue?.state !== 'open' && !payload.issue?.labels.some((issueLabel: {name: string}) => issueLabel.name === CONST.LABELS.HELP_WANTED)) {
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

    const prompt = isCommentCreatedEvent(payload)
        ? `I NEED HELP WITH CASE (1.), CHECK IF COMMENT IS PROPOSAL AND IF TEMPLATE IS FOLLOWED AS PER INSTRUCTIONS. IT IS MANDATORY THAT YOU RESPOND ONLY WITH "${CONST.NO_ACTION}" IN CASE THE COMMENT IS NOT A PROPOSAL. Comment content: ${payload.comment?.body}`
        : `I NEED HELP WITH CASE (2.) WHEN A USER THAT POSTED AN INITIAL PROPOSAL OR COMMENT (UNEDITED) THEN EDITS THE COMMENT - WE NEED TO CLASSIFY THE COMMENT BASED IN THE GIVEN INSTRUCTIONS AND IF TEMPLATE IS FOLLOWED AS PER INSTRUCTIONS. IT IS MANDATORY THAT YOU RESPOND ONLY WITH "${CONST.NO_ACTION}" IN CASE THE COMMENT IS NOT A PROPOSAL. \n\nPrevious comment content: ${payload.changes.body?.from}.\n\nEdited comment content: ${payload.comment?.body}`;

    const assistantResponse = await OpenAIUtils.prompt(prompt);
    const parsedAssistantResponse = JSON.parse(OpenAIUtils.sanitizeJSONStringValues(assistantResponse)) as AssistantResponse;
    console.log('parsedAssistantResponse: ', parsedAssistantResponse);

    // fallback to empty strings to avoid crashing in case parsing fails and we fallback to empty object
    const {action = '', message = ''} = parsedAssistantResponse ?? {};
    const isNoAction = action.trim() === CONST.NO_ACTION;
    const isActionEdit = action.trim() === CONST.ACTION_EDIT;
    const isActionRequired = action.trim() === CONST.ACTION_REQUIRED;

    // If assistant response is NO_ACTION and there's no message, do nothing
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
        await GithubUtils.createComment(CONST.APP_REPO, context.issue.number, formattedResponse);
        // edit comment if assistant detected substantial changes
    } else if (isActionEdit) {
        const formattedResponse = message.replace('{updated_timestamp}', formattedDate);
        console.log('ProposalPolice™ editing issue comment...', payload.comment.id);
        await GithubUtils.octokit.issues.updateComment({
            ...context.repo,
            /* eslint-disable @typescript-eslint/naming-convention */
            comment_id: payload.comment.id,
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
