const core = require('@actions/core');

async function run() {
    try {
        // Get the GitHub URL input
        const githubUrl = core.getInput('GITHUB_URL');
        
        // Print the URL
        console.log(`GitHub URL: ${githubUrl}`);
        core.info(`GitHub URL: ${githubUrl}`);
        
    } catch (error) {
        core.setFailed(error.message);
    }
}

run(); 