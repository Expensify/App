import {getInput} from '@actions/core';
import OpenAI from 'openai';
import type {MessageContent, TextContentBlock} from 'openai/resources/beta/threads';
import CONST from './CONST';

const MAX_POLL_COUNT = Math.floor(CONST.OPENAI_POLL_TIMEOUT / CONST.OPENAI_POLL_RATE);

class OpenAIUtils {
    private static ai: OpenAI;

    private static assistantID: string;

    static init(apiKey?: string, assistantID?: string) {
        const key = apiKey ?? getInput('PROPOSAL_POLICE_API_KEY', {required: true});
        if (!key) {
            throw new Error('Could not initialize OpenAI: No key provided.');
        }
        this.ai = new OpenAI({apiKey: key});
        this.assistantID = assistantID ?? getInput('PROPOSAL_POLICE_ASSISTANT_ID', {required: true});
    }

    static get openAI() {
        if (!this.ai) {
            this.init();
        }
        return this.ai;
    }

    static async prompt(userMessage: string) {
        // start a thread run
        let threadRun = await this.openAI.beta.threads.createAndRun({
            /* eslint-disable @typescript-eslint/naming-convention */
            assistant_id: this.assistantID,
            thread: {messages: [{role: CONST.OPENAI_ROLES.USER, content: userMessage}]},
        });

        // poll for run completion
        let response = '';
        let count = 0;
        while (!response && count < MAX_POLL_COUNT) {
            // await thread run completion
            threadRun = await this.openAI.beta.threads.runs.retrieve(threadRun.thread_id, threadRun.id);
            if (threadRun.status !== CONST.OPENAI_THREAD_COMPLETED) {
                count++;
                await new Promise((resolve) => {
                    setTimeout(resolve, CONST.OPENAI_POLL_RATE);
                });
                continue;
            }

            for await (const message of this.openAI.beta.threads.messages.list(threadRun.thread_id)) {
                if (message.role !== CONST.OPENAI_ROLES.ASSISTANT) {
                    continue;
                }
                response += message.content
                    .map((contentBlock) => this.isTextContentBlock(contentBlock) && contentBlock.text.value)
                    .join('\n')
                    .trim();
                console.log('Parsed assistant response:', response);
            }

            if (!response) {
                throw new Error('Assistant response is empty or had no text content. This is unexpected.');
            }
        }
        return response;
    }

    static isTextContentBlock(contentBlock: MessageContent): contentBlock is TextContentBlock {
        return contentBlock?.type === 'text';
    }
}

export default OpenAIUtils;
