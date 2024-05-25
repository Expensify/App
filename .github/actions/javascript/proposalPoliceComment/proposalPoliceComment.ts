import {context, getOctokit} from '@actions/github';
import InitOpenAI from 'openai';
import CONST from '@github/libs/CONST';
import type {GitHubType} from '@github/libs/GithubUtils';

const OpenAI = new InitOpenAI({apiKey: process.env.OPENAI_API_KEY});

async function processIssueComment(octokit: InstanceType<typeof GitHubType>) {
    const payload = context.payload;
    const OPENAI_ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

    // check if the issue is open and the has labels
    if (payload.issue?.state !== 'open' && !payload.issue?.labels.some((issueLabel: {name: string}) => issueLabel.name === CONST.LABELS.HELP_WANTED)) {
        return;
    }

    if (!OPENAI_ASSISTANT_ID) {
        console.log('OPENAI_ASSISTANT_ID missing from the environment variables');
        return;
    }

    // 1, check if comment is proposal and if proposal template is followed
    const content = `I NEED HELP WITH CASE (1.), CHECK IF COMMENT IS PROPOSAL AND IF TEMPLATE IS FOLLOWED AS PER INSTRUCTIONS. IT IS MANDATORY THAT YOU RESPOND ONLY WITH "NO_ACTION" IN CASE THE COMMENT IS NOT A PROPOSAL. Comment content: ${payload.comment?.body}`;

    // create thread with first user message and run it
    const createAndRunResponse = await OpenAI.beta.threads.createAndRun({
        /* eslint-disable @typescript-eslint/naming-convention */
        assistant_id: OPENAI_ASSISTANT_ID ?? '',
        thread: {messages: [{role: 'user', content}]},
    });

    // count calls for debug purposes
    let count = 0;
    // poll for run completion
    const intervalID = setInterval(() => {
        OpenAI.beta.threads.runs
            .retrieve(createAndRunResponse.thread_id, createAndRunResponse.id)
            .then((threadRun) => {
                // return if run is not completed
                if (threadRun.status !== 'completed') {
                    return;
                }

                // get assistant response
                OpenAI.beta.threads.messages
                    .list(createAndRunResponse.thread_id)
                    .then((threadMessages) => {
                        // list thread messages content
                        threadMessages.data.forEach((message, index) => {
                            // @ts-expect-error - we do have `text` in content[0] but typescript doesn't know that this is an 'openai' package type issue
                            let assistantResponse = message.content?.[index]?.text?.value;
                            console.log('issue_comment.created - assistantResponse', assistantResponse);

                            if (!assistantResponse) {
                                return console.log('issue_comment.created - assistantResponse is empty');
                            }

                            // check if assistant response is either NO_ACTION or "NO_ACTION" strings
                            // as sometimes the assistant response varies
                            const isNoAction = assistantResponse === 'NO_ACTION' || assistantResponse === '"NO_ACTION"';
                            // if assistant response is NO_ACTION or message role is 'user', do nothing
                            if (isNoAction || threadMessages.data?.[index]?.role === 'user') {
                                if (threadMessages.data?.[index]?.role === 'user') {
                                    return;
                                }
                                return console.log('issue_comment.created - NO_ACTION');
                            }

                            // if the assistant responded with no action but there's some context in the response
                            if (assistantResponse.includes('[NO_ACTION]')) {
                                // extract the text after [NO_ACTION] from assistantResponse since this is a
                                // bot related action keyword
                                const noActionContext = assistantResponse.split('[NO_ACTION] ')?.[1]?.replace('"', '');
                                console.log('issue_comment.created - [NO_ACTION] w/ context: ', noActionContext);
                                return;
                            }
                            // replace {user} from response template with @username
                            assistantResponse = assistantResponse.replace('{user}', `@${payload.comment?.user.login}`);
                            // replace {proposalLink} from response template with the link to the comment
                            assistantResponse = assistantResponse.replace('{proposalLink}', payload.comment?.html_url);

                            // remove any double quotes from the final comment because sometimes the assistant's
                            // response contains double quotes / sometimes it doesn't
                            assistantResponse = assistantResponse.replace('"', '');
                            // create a comment with the assistant's response
                            console.log('issue_comment.created - proposal-police posts comment');
                            octokit.issues.createComment({
                                ...context.repo,
                                /* eslint-disable @typescript-eslint/naming-convention */
                                issue_number: payload.issue?.number ?? -1,
                                body: assistantResponse,
                            });
                        });
                    })
                    .catch((error) => console.log('threads.messages.list - error', error));

                // stop polling
                clearInterval(intervalID);
            })
            .catch((error) => console.log('threads.runs.retrieve - error', error));

        // increment count for every threads.runs.retrieve call
        count++;
        console.log('threads.runs.retrieve - called:', count);
    }, 1500);
}

// Main function to process the workflow event
async function run() {
    // @ts-expect-error - process is not imported
    const octokit: InstanceType<typeof GitHubType> = getOctokit(process.env.GITHUB_TOKEN);
    await processIssueComment(octokit);
}

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
