import * as core from '@actions/core';
import {context} from '@actions/github';
import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';

async function run(): Promise<void> {
    try {
        // Get the GitHub URL input
        const githubUrl = core.getInput('GITHUB_URL');
        core.info(`GitHub URL: ${githubUrl}`);
        const issue = context.issue.number;
        core.info(`Issue from context: ${issue}`);

        await GithubUtils.createComment(CONST.APP_REPO, 65042, 'NOT ENOUGH TESTS');
        
    } catch (error) {
        core.setFailed(error instanceof Error ? error.message : String(error));
    }
}

run(); 