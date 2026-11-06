import {describe, expect, it} from 'bun:test';

import fs from 'fs';

const workflow = fs.readFileSync('.github/workflows/deploy.yml', 'utf8');
const createReleaseJob = workflow.split('\n  createRelease:\n')[1]?.split('\n  postSlackMessageOnSuccess:\n')[0] ?? '';

describe('Deploy createRelease workflow', () => {
    it('uses OSBotify credentials for release API calls', () => {
        // Given release creation and asset uploads need write access to the repository
        // When the createRelease job runs GitHub CLI commands
        // Then each command uses the OSBotify app token instead of the workflow token that receives 403
        expect(createReleaseJob).toContain('uses: Expensify/GitHub-Actions/setupGitForOSBotify@main');
        expect(createReleaseJob.match(/GITHUB_TOKEN: \$\{\{ steps\.setupGitForOSBotify\.outputs\.OS_BOTIFY_API_TOKEN \}\}/g)).toHaveLength(4);
        expect(createReleaseJob).not.toContain('GITHUB_TOKEN: ${{ github.token }}');
    });
});
