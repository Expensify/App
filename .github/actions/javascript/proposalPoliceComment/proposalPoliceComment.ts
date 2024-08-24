import {setFailed} from '@actions/core';
import {context} from '@actions/github';
import type {IssueCommentCreatedEvent, IssueCommentEditedEvent, IssueCommentEvent} from '@octokit/webhooks-types';
import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';
import OpenAIUtils from '@github/libs/OpenAIUtils';

function isCommentCreatedOrEditedEvent(payload: IssueCommentEvent): payload is IssueCommentCreatedEvent | IssueCommentEditedEvent {
    return payload.action === CONST.ACTIONS.CREATED || payload.action === CONST.ACTIONS.EDIT;
}

function isCommentCreatedEvent(payload: IssueCommentEvent): payload is IssueCommentCreatedEvent {
    return payload.action === CONST.ACTIONS.CREATED;
}

// Main function to process the workflow event
async function run() {
    // get date early, as soon as the workflow starts running
    const date = new Date();
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

    console.log('ProposalPolice™ Action triggered for comment:', payload.comment?.body);
    console.log('-> GitHub Action Type: ', payload.action?.toUpperCase());

    if (!isCommentCreatedOrEditedEvent(payload)) {
        console.error('Unsupported action type:', payload?.action);
        setFailed(new Error(`Unsupported action type ${payload?.action}`));
        return;
    }

    const prompt = isCommentCreatedEvent(payload)
        ? `I NEED HELP WITH CASE (1.), CHECK IF COMMENT IS PROPOSAL AND IF TEMPLATE IS FOLLOWED AS PER INSTRUCTIONS. IT IS MANDATORY THAT YOU RESPOND ONLY WITH "${CONST.NO_ACTION}" IN CASE THE COMMENT IS NOT A PROPOSAL. Comment content: ${payload.comment?.body}`
        : `I NEED HELP WITH CASE (2.) WHEN A USER THAT POSTED AN INITIAL PROPOSAL OR COMMENT (UNEDITED) THEN EDITS THE COMMENT - WE NEED TO CLASSIFY THE COMMENT BASED IN THE GIVEN INSTRUCTIONS AND IF TEMPLATE IS FOLLOWED AS PER INSTRUCTIONS. IT IS MANDATORY THAT YOU RESPOND ONLY WITH "${CONST.NO_ACTION}" IN CASE THE COMMENT IS NOT A PROPOSAL. \n\nPrevious comment content: ${payload.changes.body?.from}.\n\nEdited comment content: ${payload.comment?.body}`;

    const assistantResponse = await OpenAIUtils.prompt(prompt);

    // check if assistant response is either NO_ACTION or "NO_ACTION" strings
    // as sometimes the assistant response varies
    const isNoAction = assistantResponse.trim().replaceAll(' ', '_').replaceAll('"', '').toUpperCase() === CONST.NO_ACTION;

    // If assistant response is NO_ACTION, do nothing
    if (isNoAction) {
        console.log('Detected NO_ACTION for comment, returning early');
        return;
    }

    // if the assistant responded with no action but there's some context in the response
    if (assistantResponse.includes(`[${CONST.NO_ACTION}]`)) {
        // extract the text after [NO_ACTION] from assistantResponse since this is a
        // bot related action keyword
        const noActionContext = assistantResponse.split(`[${CONST.NO_ACTION}] `)?.at(1)?.replace('"', '');
        console.log('[NO_ACTION] w/ context: ', noActionContext);
        return;
    }

    if (isCommentCreatedEvent(payload)) {
        const formattedResponse = assistantResponse
            // replace {user} from response template with @username
            .replaceAll('{user}', `@${payload.comment?.user.login}`)

            // replace {proposalLink} from response template with the link to the comment
            .replaceAll('{proposalLink}', payload.comment?.html_url)

            // remove any double quotes from the final comment because sometimes the assistant's
            // response contains double quotes / sometimes it doesn't
            .replaceAll('"', '');

        // Create a comment with the assistant's response
        console.log('ProposalPolice™ commenting on issue...');
        await GithubUtils.createComment(CONST.APP_REPO, context.issue.number, formattedResponse);
        // edit comment if assistant detected substantial changes and if the comment was not edited already by the bot
    } else if (assistantResponse.includes('[EDIT_COMMENT]') && !payload.comment?.body.includes('Edited by **proposal-police**')) {
        // extract the text after [EDIT_COMMENT] from assistantResponse since this is a
        // bot related action keyword
        let extractedNotice = assistantResponse.split('[EDIT_COMMENT] ').at(1)?.replace('"', '');
        // format the date like: 2024-01-24 13:15:24 UTC not 2024-01-28 18:18:28.000 UTC
        const formattedDate = `${date.toISOString()?.split('.').at(0)?.replace('T', ' ')} UTC`;
        extractedNotice = extractedNotice?.replace('{updated_timestamp}', formattedDate);
        console.log('ProposalPolice™ editing issue comment...', payload.comment.id);
        await GithubUtils.octokit.issues.updateComment({
            ...context.repo,
            /* eslint-disable @typescript-eslint/naming-convention */
            comment_id: payload.comment.id,
            body: `${extractedNotice}\n\n${payload.comment?.body}`,
        });
    }
}

run().catch((error) => {
    console.error(error);
    // Zero status ensures that the action is marked as successful regardless the outcome
    // which means that no failure notification is sent to issue's subscribers
    process.exit(0);
});
