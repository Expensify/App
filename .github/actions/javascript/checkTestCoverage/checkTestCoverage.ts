import * as core from '@actions/core';

async function run(): Promise<void> {
    try {
        // Get the GitHub URL input
        const githubUrl = core.getInput('GITHUB_URL');
        
        // Print the URL
        console.log(`GitHub URL: ${githubUrl}`);
        core.info(`GitHub URL: ${githubUrl}`);
        
    } catch (error) {
        core.setFailed(error instanceof Error ? error.message : String(error));
    }
}

run(); 