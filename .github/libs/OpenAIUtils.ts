import {context} from '@actions/github';
import InitOpenAI from 'openai';
import type {GitHubType} from '@github/libs/GithubUtils';
import CONST from './CONST';

const OpenAI = new InitOpenAI({apiKey: process.env.OPENAI_API_KEY});

type OpenAIUtilsPrompt = {
    createAndRunResponse: InitOpenAI.Beta.Threads.Runs.Run;
    payload: typeof context.payload;
    octokit: InstanceType<typeof GitHubType>;
};

async function prompt({createAndRunResponse, payload, octokit}: OpenAIUtilsPrompt) {
    return new Promise((resolve, reject) => {
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
                                let assistantResponse = message.content?.[index]?.text?.value as string;
                                console.log('issue_comment.created - assistantResponse', assistantResponse);

                                if (!assistantResponse) {
                                    return console.log('issue_comment.created - assistantResponse is empty');
                                }

                                // check if assistant response is either NO_ACTION or "NO_ACTION" strings
                                // as sometimes the assistant response varies
                                const isNoAction = assistantResponse.replaceAll('"', '').toUpperCase() === CONST.NO_ACTION;
                                // If assistant response is NO_ACTION, do nothing
                                if (isNoAction) {
                                    console.log('Detected NO_ACTION for comment, returning early');
                                    return;
                                }
                                // If thread message role is 'user', do nothing
                                if (threadMessages.data?.[index]?.role === 'user') {
                                    console.log('Detected message role "user", returning early...');
                                    return;
                                }

                                // if the assistant responded with no action but there's some context in the response
                                if (assistantResponse.includes(`[${CONST.NO_ACTION}]`)) {
                                    // extract the text after [NO_ACTION] from assistantResponse since this is a
                                    // bot related action keyword
                                    const noActionContext = assistantResponse.split(`[${CONST.NO_ACTION}] `)?.[1]?.replace('"', '');
                                    console.log('issue_comment.created - [NO_ACTION] w/ context: ', noActionContext);
                                    return;
                                }
                                // replace {user} from response template with @username
                                assistantResponse = assistantResponse.replace('{user}', `@${payload.comment?.user.login as string}`);
                                // replace {proposalLink} from response template with the link to the comment
                                assistantResponse = assistantResponse.replace('{proposalLink}', payload.comment?.html_url as string);

                                // remove any double quotes from the final comment because sometimes the assistant's
                                // response contains double quotes / sometimes it doesn't
                                assistantResponse = assistantResponse.replace('"', '').replace(/^"|"$/g, '');
                                // create a comment with the assistant's response
                                console.log('issue_comment.created - proposal-police posts comment');
                                octokit.issues.createComment({
                                    ...context.repo,
                                    /* eslint-disable @typescript-eslint/naming-convention */
                                    issue_number: payload.issue?.number ?? -1,
                                    body: assistantResponse,
                                });

                                // resolve the Promise with the response
                                resolve({response: assistantResponse});
                                // stop polling
                                clearInterval(intervalID);
                            });
                        })
                        .catch((error) => {
                            console.error('threads.messages.list - error', error);
                            reject(error);
                            clearInterval(intervalID);
                        });

                    // stop polling
                    clearInterval(intervalID);
                })
                .catch((error) => {
                    console.error('threads.runs.retrieve - error', error);
                    reject(error);
                    clearInterval(intervalID);
                });

            // increment count for every threads.runs.retrieve call
            count++;
            console.log('threads.runs.retrieve - called:', count);
        }, CONST.OPENAI_POLL_RATE);
    });
}

async function promptEdit({createAndRunResponse, payload, octokit}: OpenAIUtilsPrompt) {
    return new Promise((resolve, reject) => {
        // count calls for debug purposes
        let count = 0;

        // poll for run completion
        const intervalID = setInterval(() => {
            OpenAI.beta.threads.runs
                .retrieve(createAndRunResponse.thread_id, createAndRunResponse.id)
                .then((threadRun) => {
                    // return if run is not completed yet
                    if (threadRun.status !== 'completed') {
                        console.log('issue_comment.edited - run pending completion');
                        return;
                    }

                    // get assistant response
                    OpenAI.beta.threads.messages
                        .list(createAndRunResponse.thread_id)
                        .then((threadMessages) => {
                            // list thread messages content
                            threadMessages.data.forEach((message, index) => {
                                // @ts-expect-error - we do have `text` in content[0] but typescript doesn't know that this is a 'openai' package type issue
                                const assistantResponse = message.content?.[index]?.text?.value as string;
                                console.log('issue_comment.edited - assistantResponse', assistantResponse);

                                if (!assistantResponse) {
                                    return console.log('issue_comment.edited - assistantResponse is empty');
                                }

                                // check if assistant response is either NO_ACTION or "NO_ACTION" strings
                                // as sometimes the assistant response varies
                                const isNoAction = assistantResponse.replaceAll('"', '').toUpperCase() === CONST.NO_ACTION;
                                // If assistant response is NO_ACTION, do nothing
                                if (isNoAction) {
                                    console.log('Detected NO_ACTION for comment, returning early');
                                    return;
                                }
                                // If thread message role is 'user', do nothing
                                if (threadMessages.data?.[index]?.role === 'user') {
                                    console.log('Detected message role "user", returning early...');
                                    return;
                                }

                                // edit comment if assistant detected substantial changes and if the comment was not edited already by the bot
                                if (assistantResponse.includes('[EDIT_COMMENT]') && !payload.comment?.body.includes('Edited by **proposal-police**')) {
                                    // extract the text after [EDIT_COMMENT] from assistantResponse since this is a
                                    // bot related action keyword
                                    let extractedNotice = assistantResponse.split('[EDIT_COMMENT] ')?.[1]?.replace('"', '');
                                    // format the github's updated_at like: 2024-01-24 13:15:24 UTC not 2024-01-28 18:18:28.000 UTC
                                    const date = new Date((payload.comment?.updated_at as string) ?? '');
                                    const formattedDate = `${date.toISOString()?.split('.')?.[0]?.replace('T', ' ')} UTC`;
                                    extractedNotice = extractedNotice.replace('{updated_timestamp}', formattedDate);

                                    console.log(`issue_comment.edited - proposal-police edits comment: ${payload.comment?.id}`);
                                    octokit.issues.updateComment({
                                        ...context.repo,
                                        /* eslint-disable @typescript-eslint/naming-convention */
                                        comment_id: payload.comment?.id ?? -1,
                                        body: `${extractedNotice}\n\n${payload.comment?.body}`,
                                    });
                                }

                                // resolve the Promise with the response
                                resolve({response: assistantResponse});
                                clearInterval(intervalID);
                            });
                        })
                        .catch((error) => {
                            console.error('threads.messages.list - error', error);
                            reject(error);
                            clearInterval(intervalID);
                        });

                    clearInterval(intervalID);
                })
                .catch((error) => {
                    console.error('threads.runs.retrieve - error', error);
                    reject(error);
                    clearInterval(intervalID);
                });

            // increment count for every threads.runs.retrieve call
            count++;
            console.log('threads.runs.retrieve - called:', count);
        }, CONST.OPENAI_POLL_RATE);
    });
}

export {prompt, promptEdit};
