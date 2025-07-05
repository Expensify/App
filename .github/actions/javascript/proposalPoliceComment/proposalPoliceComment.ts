import {getInput, setFailed} from '@actions/core';
import {context} from '@actions/github';
import type {IssueCommentCreatedEvent, IssueCommentEditedEvent, IssueCommentEvent} from '@octokit/webhooks-types';
import {format} from 'date-fns';
import {toZonedTime} from 'date-fns-tz';
import {convertToNumber} from '@github/libs/ActionUtils';
import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';
import type {ListCommentsResponse} from '@github/libs/GithubUtils';
import sanitizeJSONStringValues from '@github/libs/sanitizeJSONStringValues';
import OpenAIUtils from '@scripts/utils/OpenAIUtils';

type AssistantResponse = {
    action: typeof CONST.NO_ACTION | typeof CONST.ACTION_REQUIRED;
    message: string;
    similarity?: number;
};

function isCommentCreatedEvent(payload: IssueCommentEvent): payload is IssueCommentCreatedEvent {
    return payload.action === CONST.ACTIONS.CREATED;
}

function isCommentEditedEvent(payload: IssueCommentEvent): payload is IssueCommentEditedEvent {
    return payload.action === CONST.ACTIONS.EDITED;
}

class ProposalPoliceTemplates {
    static getPromptForNewProposalTemplateCheck(commentBody?: string): string {
        return `I NEED HELP WITH CASE (1.), CHECK IF COMMENT IS PROPOSAL AND IF TEMPLATE IS FOLLOWED AS PER INSTRUCTIONS. IT IS MANDATORY THAT YOU RESPOND ONLY WITH "${CONST.NO_ACTION}" IN CASE THE COMMENT IS NOT A PROPOSAL. Comment content: ${commentBody}`;
    }

    static getPromptForNewProposalDuplicateCheck(existingProposal?: string, newProposalBody?: string): string {
        return `I NEED HELP WITH CASE (3.) [INSTRUCTIONS SECTION: IX. DUPLICATE PROPOSAL DETECTION], COMPARE THE FOLLOWING TWO PROPOSALS AND RETURN A SIMILARITY PERCENTAGE (0-100) REPRESENTING HOW SIMILAR THESE TWO PROPOSALS ARE IN THOSE SECTIONS AS PER THE INSTRUCTIONS. \n\nProposal 1:\n${existingProposal}\n\nProposal 2:\n${newProposalBody}`;
    }

    static getPromptForEditedProposal(previousBody?: string, editedBody?: string): string {
        return `I NEED HELP WITH CASE (2.) WHEN A USER THAT POSTED AN INITIAL PROPOSAL OR COMMENT (UNEDITED) THEN EDITS THE COMMENT - WE NEED TO CLASSIFY THE COMMENT BASED IN THE GIVEN INSTRUCTIONS AND IF TEMPLATE IS FOLLOWED AS PER INSTRUCTIONS. IT IS MANDATORY THAT YOU RESPOND ONLY WITH "${CONST.NO_ACTION}" IN CASE THE COMMENT IS NOT A PROPOSAL. \n\nPrevious comment content: ${previousBody}.\n\nEdited comment content: ${editedBody}`;
    }

    static getDuplicateCheckWithdrawMessage(): string {
        return '#### 🚫 Duplicated proposal withdrawn by 🤖 ProposalPolice.';
    }

    static getDuplicateCheckNoticeMessage(proposalAuthor: string): string {
        return `⚠️ @${proposalAuthor} Your proposal is a duplicate of an already existing proposal and has been automatically withdrawn to prevent spam. Please review the existing proposals before submitting a new one.`;
    }
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
        console.log('commentsResponse', commentsResponse);
        // Find previous proposals
        const previousProposals = commentsResponse?.filter(
            (comment: ListCommentsResponse['data'][number]) => new Date(comment.created_at).getTime() < newProposalCreatedAt && comment.body?.includes(CONST.PROPOSAL_KEYWORD),
        );

        let didFindDuplicate = false;
        for (const previousProposal of previousProposals) {
            const isProposal = !!previousProposal.body?.includes(CONST.PROPOSAL_KEYWORD);
            const isAuthorBot = previousProposal.user?.login === CONST.COMMENT.NAME_GITHUB_ACTIONS || previousProposal.user?.type === CONST.COMMENT.TYPE_BOT;
            // Skip prompting if comment is author is the GH bot or comment is empty / not a proposal
            if (isAuthorBot || !isProposal) {
                continue;
            }

            const duplicateCheckPrompt = ProposalPoliceTemplates.getPromptForNewProposalDuplicateCheck(previousProposal.body, newProposalBody);
            const duplicateCheckResponse = await openAI.promptAssistant(assistantID, duplicateCheckPrompt);
            let similarityPercentage = 0;
            try {
                const parsedDuplicateCheckResponse = JSON.parse(sanitizeJSONStringValues(duplicateCheckResponse)) as AssistantResponse;
                console.log('parsedDuplicateCheckResponse: ', parsedDuplicateCheckResponse);
                const {similarity = 0} = parsedDuplicateCheckResponse ?? {};
                similarityPercentage = convertToNumber(similarity);
            } catch (e) {
                console.error('Failed to parse AI response:', duplicateCheckResponse);
            }

            if (similarityPercentage >= 90) {
                console.log(`Found duplicate with ${similarityPercentage}% similarity.`);
                didFindDuplicate = true;
                break;
            }
        }

        if (didFindDuplicate) {
            const duplicateCheckWithdrawMessage = ProposalPoliceTemplates.getDuplicateCheckWithdrawMessage();
            const duplicateCheckNoticeMessage = ProposalPoliceTemplates.getDuplicateCheckNoticeMessage(newProposalAuthor);
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
        ? ProposalPoliceTemplates.getPromptForNewProposalTemplateCheck(payload.comment?.body)
        : ProposalPoliceTemplates.getPromptForEditedProposal(payload.changes.body?.from, payload.comment?.body);

    const assistantResponse = await openAI.promptAssistant(assistantID, prompt);
    const parsedAssistantResponse = JSON.parse(sanitizeJSONStringValues(assistantResponse)) as AssistantResponse;
    console.log('parsedAssistantResponse: ', parsedAssistantResponse);

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
