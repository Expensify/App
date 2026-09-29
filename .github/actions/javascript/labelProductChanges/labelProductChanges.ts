import GithubUtils from '@github/libs/GithubUtils';
import {
    buildProductChangeInput,
    isProductChangeClassification,
    PRODUCT_CHANGE_INSTRUCTIONS,
    PRODUCT_CHANGE_LABEL,
    PRODUCT_CHANGE_MODEL,
    PRODUCT_CHANGE_RESPONSE_FORMAT,
} from '@github/libs/ProductChangeClassifier';
import type {ProductChangeClassification, PullRequest} from '@github/libs/ProductChangeClassifier';

import OpenAIUtils from '@scripts/utils/OpenAIUtils';

import * as core from '@actions/core';
import {context} from '@actions/github';

function getSkipReason(pr: PullRequest, isDryRun: boolean): string | undefined {
    if (pr.draft) {
        return 'PR is a draft.';
    }
    if (!isDryRun && pr.state !== 'open') {
        return 'PR is closed.';
    }
    if (!isDryRun && pr.labels.some((label) => label.name === PRODUCT_CHANGE_LABEL)) {
        return 'PR already has IncludesProductChange; preserving the label.';
    }
}

async function classify(pr: PullRequest): Promise<ProductChangeClassification & {fallback?: string}> {
    try {
        const files = await GithubUtils.paginate(GithubUtils.octokit.pulls.listFiles, {
            ...context.repo,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            pull_number: pr.number,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            per_page: 100,
        });
        const input = buildProductChangeInput(pr, files);
        const openAI = new OpenAIUtils(core.getInput('OPENAI_API_KEY', {required: true}));
        const response = await openAI.promptResponses({
            input,
            instructions: PRODUCT_CHANGE_INSTRUCTIONS,
            model: PRODUCT_CHANGE_MODEL,
            textFormat: PRODUCT_CHANGE_RESPONSE_FORMAT,
            promptCacheKey: 'includes-product-change-v1',
        });
        const result = openAI.parseJSONResponse(response.text, isProductChangeClassification);
        if (!result) {
            throw new Error('The classifier returned an invalid response.');
        }
        return result;
    } catch (error) {
        const fallback = error instanceof Error ? error.message : 'Classification failed.';
        core.warning(`Conservative product-change fallback: ${fallback}`);
        return {verdict: 'unsure', reason: 'Classification could not establish that this PR is clearly non-product.', fallback};
    }
}

async function run() {
    const isDispatch = context.eventName === 'workflow_dispatch';
    if (!isDispatch && context.eventName !== 'pull_request_target') {
        throw new Error('Expected a pull_request_target or workflow_dispatch event.');
    }
    const changes: unknown = context.payload.changes;
    const isBaseEdit = typeof changes === 'object' && changes !== null && 'base' in changes && !!changes.base;
    if (!isDispatch && context.payload.action === 'edited' && !isBaseEdit) {
        return;
    }

    const numberInput = isDispatch ? core.getInput('PULL_REQUEST_NUMBER', {required: true}) : String(context.payload.pull_request?.number ?? '');
    const pullRequestNumber = Number(numberInput);
    if (!/^\d+$/.test(numberInput) || !Number.isSafeInteger(pullRequestNumber) || pullRequestNumber <= 0) {
        throw new Error('PULL_REQUEST_NUMBER must be a positive integer.');
    }
    const isDryRun = isDispatch && core.getBooleanInput('DRY_RUN');
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const params = {...context.repo, pull_number: pullRequestNumber};
    const {data: pr} = await GithubUtils.octokit.pulls.get(params);
    const result: Record<string, string | number | boolean> = {
        pullRequest: pullRequestNumber,
        headSHA: pr.head.sha,
        baseSHA: pr.base.sha,
        baseRef: pr.base.ref,
        model: PRODUCT_CHANGE_MODEL,
        dryRun: isDryRun,
    };

    try {
        const skipReason = getSkipReason(pr, isDryRun);
        if (skipReason) {
            result.action = 'skipped';
            result.reason = skipReason;
            return;
        }

        Object.assign(result, await classify(pr));
        const {data: currentPR} = await GithubUtils.octokit.pulls.get(params);
        if (currentPR.head.sha !== pr.head.sha || currentPR.base.sha !== pr.base.sha || currentPR.base.ref !== pr.base.ref) {
            result.action = 'skipped_stale_revision';
            return;
        }
        const currentSkipReason = getSkipReason(currentPR, isDryRun);
        if (currentSkipReason) {
            result.action = 'skipped';
            result.reason = currentSkipReason;
            return;
        }

        if (isDryRun) {
            result.action = result.verdict === 'clearly_non_product' ? 'would_skip_label' : 'would_add_label';
            return;
        }
        if (result.verdict === 'clearly_non_product') {
            result.action = 'not_labeled';
            return;
        }
        await GithubUtils.octokit.issues.addLabels({
            ...context.repo,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            issue_number: pullRequestNumber,
            labels: [PRODUCT_CHANGE_LABEL],
        });
        result.action = 'label_added';
    } catch (error) {
        result.action = 'failed';
        throw error;
    } finally {
        core.setOutput('RESULT', JSON.stringify(result));
        core.info(JSON.stringify(result));
        // Escape untrusted explanations before inserting them into the HTML-backed Actions summary.
        const escapedResult = JSON.stringify(result, null, 2).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
        await core.summary.addHeading('Product-change classification').addRaw(`<pre>${escapedResult}</pre>`).write();
    }
}

if (import.meta.main) {
    run().catch((error: unknown) => core.setFailed(error instanceof Error ? error : String(error)));
}

export default run;
