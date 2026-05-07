#!/usr/bin/env npx ts-node
/**
 * This script estimates the cost of OpenAI API calls based on input and output tokens.
 */
import CLI from './utils/CLI';
import COLORS from './utils/COLORS';

/**
 * Utility class for estimating OpenAI API costs.
 */
class ChatGPTCostEstimator {
    /** Cost per million input tokens for GPT 5.1 */
    static readonly GPT_5_1_INPUT_COST_PER_MILLION = 1.25;

    /** Cost per million output tokens for GPT 5.1 */
    static readonly GPT_5_1_OUTPUT_COST_PER_MILLION = 10.0;

    /** Average number of tokens per character (rule of thumb for English-ish text) */
    static readonly TOKENS_PER_CHAR = 0.25;

    /** Discount rate for cached prompt tokens (cached tokens cost ~10% of full price) */
    static readonly CACHED_INPUT_DISCOUNT = 0.1;

    /**
     * Calculates the estimated cost for OpenAI API calls based on input and output tokens.
     *
     * @param inputTokens - Total number of uncached input tokens
     * @param outputTokens - Total number of output tokens
     * @param cachedInputTokens - Total number of cached input tokens (default: 0)
     * @returns Estimated cost in USD
     */
    static getTotalEstimatedCost(inputTokens: number, outputTokens: number, cachedInputTokens = 0): number {
        const uncachedInputCost = (inputTokens / 1_000_000) * ChatGPTCostEstimator.GPT_5_1_INPUT_COST_PER_MILLION;
        const cachedInputCost = (cachedInputTokens / 1_000_000) * ChatGPTCostEstimator.GPT_5_1_INPUT_COST_PER_MILLION * ChatGPTCostEstimator.CACHED_INPUT_DISCOUNT;
        const outputCost = (outputTokens / 1_000_000) * ChatGPTCostEstimator.GPT_5_1_OUTPUT_COST_PER_MILLION;
        return uncachedInputCost + cachedInputCost + outputCost;
    }
}

if (require.main === module) {
    /* eslint-disable @typescript-eslint/naming-convention */
    const cli = new CLI({
        namedArgs: {
            'input-tokens': {
                description: 'Total number of input tokens',
                parse: (val: string): number => {
                    const parsed = parseInt(val, 10);
                    if (Number.isNaN(parsed) || parsed < 0) {
                        throw new Error('Input tokens must be a non-negative integer');
                    }
                    return parsed;
                },
            },
            'output-tokens': {
                description: 'Total number of output tokens',
                parse: (val: string): number => {
                    const parsed = parseInt(val, 10);
                    if (Number.isNaN(parsed) || parsed < 0) {
                        throw new Error('Output tokens must be a non-negative integer');
                    }
                    return parsed;
                },
            },
        },
    } as const);
    /* eslint-enable @typescript-eslint/naming-convention */

    const inputTokens = cli.namedArgs['input-tokens'];
    const outputTokens = cli.namedArgs['output-tokens'];
    const totalCost = ChatGPTCostEstimator.getTotalEstimatedCost(inputTokens, outputTokens);

    console.log('\n=== ChatGPT Cost Estimator ===\n');
    console.log('Pricing (GPT 5.1):');
    console.log(`  Input:  $${ChatGPTCostEstimator.GPT_5_1_INPUT_COST_PER_MILLION.toFixed(2)}/million tokens`);
    console.log(`  Output: $${ChatGPTCostEstimator.GPT_5_1_OUTPUT_COST_PER_MILLION.toFixed(2)}/million tokens\n`);
    console.log('Your estimate:');
    console.log(`  Input tokens:  ${inputTokens.toLocaleString()}`);
    console.log(`  Output tokens: ${outputTokens.toLocaleString()}`);
    console.log(`  ${'─'.repeat(30)}`);
    console.log(`  Estimated cost: ${COLORS.BOLD}$${totalCost.toFixed(2)} USD${COLORS.RESET}\n`);
}

export default ChatGPTCostEstimator;
