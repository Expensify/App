"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
async function run() {
    try {
        const token = core.getInput('GITHUB_TOKEN', { required: true });
        const octokit = github.getOctokit(token);
        const pr = github.context.payload.pull_request;
        if (!pr) {
            core.setFailed('No pull request found in context.');
            return;
        }
        const prNumber = pr.number;
        const owner = github.context.repo.owner;
        const repo = github.context.repo.repo;
        // Find the jest-coverage artifact from the workflow run
        const { data: artifacts } = await octokit.rest.actions.listWorkflowRunArtifacts({
            owner,
            repo,
            run_id: github.context.runId,
        });
        const coverageArtifact = artifacts.artifacts.find((a) => a.name === 'jest-coverage');
        let coverageLink = '';
        if (coverageArtifact) {
            coverageLink = `https://github.com/${owner}/${repo}/suites/${github.context.runId}/artifacts/${coverageArtifact.id}`;
        }
        // Download and parse the coverage summary (if possible)
        // For now, just show a placeholder summary
        let summary = 'Coverage summary not available.';
        // TODO: Optionally, download and parse coverage-summary.json for real stats
        // Prepare the Test Coverage section
        let coverageSection = `\n### Test Coverage\n`;
        coverageSection += `- [Jest Coverage Report](${coverageLink})\n`;
        coverageSection += `- ${summary}\n`;
        // Append to the PR body
        let newBody = pr.body || '';
        newBody += coverageSection;
        await octokit.rest.pulls.update({
            owner,
            repo,
            pull_number: prNumber,
            body: newBody,
        });
        console.log('PR description updated with Test Coverage section.');
    }
    catch (error) {
        core.setFailed(error instanceof Error ? error.message : String(error));
    }
}
if (require.main === module) {
    run();
}
exports.default = run;
