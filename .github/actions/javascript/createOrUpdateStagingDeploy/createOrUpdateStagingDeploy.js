const _ = require('underscore');
const core = require('@actions/core');
const moment = require('moment');
const CONST = require('../../../libs/CONST');
const GithubUtils = require('../../../libs/GithubUtils');
const GitUtils = require('../../../libs/GitUtils');

async function run() {
    const newVersion = core.getInput('NPM_VERSION');
    console.log('New version found from action input:', newVersion);

    try {
        // Start by fetching the list of recent StagingDeployCash issues, along with the list of open deploy blockers
        const {data: recentDeployChecklists} = await GithubUtils.octokit.issues.listForRepo({
            log: console,
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            labels: CONST.LABELS.STAGING_DEPLOY,
            state: 'all',
        });

        // Look at the state of the most recent StagingDeployCash,
        // if it is open then we'll update the existing one, otherwise, we'll create a new one.
        const mostRecentChecklist = recentDeployChecklists[0];
        const shouldCreateNewDeployChecklist = mostRecentChecklist.state !== 'open';
        const previousChecklist = shouldCreateNewDeployChecklist ? mostRecentChecklist : recentDeployChecklists[1];
        if (shouldCreateNewDeployChecklist) {
            console.log('Latest StagingDeployCash is closed, creating a new one.', mostRecentChecklist);
        } else {
            console.log('Latest StagingDeployCash is open, updating it instead of creating a new one.', 'Current:', mostRecentChecklist, 'Previous:', previousChecklist);
        }

        // Parse the data from the previous and current checklists into the format used to generate the checklist
        const previousChecklistData = GithubUtils.getStagingDeployCashData(previousChecklist);
        const currentChecklistData = shouldCreateNewDeployChecklist ? {} : GithubUtils.getStagingDeployCashData(mostRecentChecklist);

        // Find the list of PRs merged between the current checklist and the previous checklist
        // Note that any time we're creating a new checklist we MUST have `NPM_VERSION` passed in as an input
        const newTag = newVersion || _.get(currentChecklistData, 'tag');
        const mergedPRs = await GitUtils.getPullRequestsMergedBetween(previousChecklistData.tag, newTag);

        // Next, we generate the checklist body
        let checklistBody = '';
        if (shouldCreateNewDeployChecklist) {
            checklistBody = await GithubUtils.generateStagingDeployCashBody(newTag, _.map(mergedPRs, GithubUtils.getPullRequestURLFromNumber));
        } else {
            // Generate the updated PR list, preserving the previous state of `isVerified` for existing PRs
            const PRList = _.reduce(
                mergedPRs,
                (memo, prNum) => {
                    const indexOfPRInCurrentChecklist = _.findIndex(currentChecklistData.PRList, (pr) => pr.number === prNum);
                    const isVerified = indexOfPRInCurrentChecklist >= 0 ? currentChecklistData.PRList[indexOfPRInCurrentChecklist].isVerified : false;
                    memo.push({
                        number: prNum,
                        url: GithubUtils.getPullRequestURLFromNumber(prNum),
                        isVerified,
                    });
                    return memo;
                },
                [],
            );

            // Generate the deploy blocker list, preserving the previous state of `isResolved`
            const {data: openDeployBlockers} = await GithubUtils.octokit.issues.listForRepo({
                log: console,
                owner: CONST.GITHUB_OWNER,
                repo: CONST.APP_REPO,
                labels: CONST.LABELS.DEPLOY_BLOCKER,
            });

            // First, make sure we include all current deploy blockers
            const deployBlockers = _.reduce(
                openDeployBlockers,
                (memo, deployBlocker) => {
                    const {html_url, number} = deployBlocker;
                    const indexInCurrentChecklist = _.findIndex(currentChecklistData.deployBlockers, (item) => item.number === number);
                    const isResolved = indexInCurrentChecklist >= 0 ? currentChecklistData.deployBlockers[indexInCurrentChecklist].isResolved : false;
                    memo.push({
                        number,
                        url: html_url,
                        isResolved,
                    });
                    return memo;
                },
                [],
            );

            // Then make sure we include any demoted or closed blockers as well, and just check them off automatically
            for (const deployBlocker of currentChecklistData.deployBlockers) {
                const isResolved = _.findIndex(deployBlockers, (openBlocker) => openBlocker.number === deployBlocker.number) < 0;
                deployBlockers.push({
                    ...deployBlocker,
                    isResolved,
                });
            }

            const didVersionChange = newVersion ? newVersion !== currentChecklistData.tag : false;
            checklistBody = await GithubUtils.generateStagingDeployCashBody(
                newTag,
                _.pluck(PRList, 'url'),
                _.pluck(_.where(PRList, {isVerified: true}), 'url'),
                _.pluck(deployBlockers, 'url'),
                _.pluck(_.where(deployBlockers, {isResolved: true}), 'url'),
                _.pluck(_.where(currentChecklistData.internalQAPRList, {isResolved: true}), 'url'),
                didVersionChange ? false : currentChecklistData.isTimingDashboardChecked,
                didVersionChange ? false : currentChecklistData.isFirebaseChecked,
                didVersionChange ? false : currentChecklistData.isGHStatusChecked,
            );
        }

        // Finally, create or update the checklist
        const defaultPayload = {
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            body: checklistBody,
        };

        if (shouldCreateNewDeployChecklist) {
            const {data: newChecklist} = await GithubUtils.octokit.issues.create({
                ...defaultPayload,
                title: `Deploy Checklist: New Expensify ${moment().format('YYYY-MM-DD')}`,
                labels: [CONST.LABELS.STAGING_DEPLOY],
                assignees: [CONST.APPLAUSE_BOT],
            });
            console.log(`Successfully created new StagingDeployCash! 🎉 ${newChecklist.html_url}`);
            return newChecklist;
        }

        const {data: updatedChecklist} = await GithubUtils.octokit.issues.update({
            ...defaultPayload,
            issue_number: currentChecklistData.number,
        });
        console.log(`Successfully updated StagingDeployCash! 🎉 ${updatedChecklist.html_url}`);
        return updatedChecklist;
    } catch (err) {
        console.error('An unknown error occurred!', err);
        core.setFailed(err);
    }
}

if (require.main === module) {
    run();
}

module.exports = run;
