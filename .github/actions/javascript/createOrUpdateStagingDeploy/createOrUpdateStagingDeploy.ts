import * as core from '@actions/core';
import {format} from 'date-fns/format';
import fs from 'fs';
import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';
import type {StagingDeployCashData} from '@github/libs/GithubUtils';
import GitUtils from '@github/libs/GitUtils';

type IssuesCreateResponse = Awaited<ReturnType<typeof GithubUtils.octokit.issues.create>>['data'];

type PackageJson = {
    version: string;
};

async function run(): Promise<IssuesCreateResponse | void> {
    // Note: require('package.json').version does not work because ncc will resolve that to a plain string at compile time
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8')) as PackageJson;
    // The checklist will use the package.json version, e.g. '1.2.3-4'
    const newVersion = packageJson.version;
    // The staging tag will use the package.json version with a '-staging' suffix, e.g. '1.2.3-4-staging'
    const newStagingTag = `${packageJson.version}-staging`;

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
        const mostRecentChecklist = recentDeployChecklists.at(0);

        if (!mostRecentChecklist) {
            throw new Error('Could not find the most recent checklist');
        }

        const shouldCreateNewDeployChecklist = mostRecentChecklist.state !== 'open';
        const previousChecklist = shouldCreateNewDeployChecklist ? mostRecentChecklist : recentDeployChecklists.at(1);
        if (shouldCreateNewDeployChecklist) {
            console.log('Latest StagingDeployCash is closed, creating a new one.', mostRecentChecklist);
        } else {
            console.log('Latest StagingDeployCash is open, updating it instead of creating a new one.', 'Current:', mostRecentChecklist, 'Previous:', previousChecklist);
        }

        if (!previousChecklist) {
            throw new Error('Could not find the previous checklist');
        }

        // Parse the data from the previous and current checklists into the format used to generate the checklist
        const previousChecklistData = GithubUtils.getStagingDeployCashData(previousChecklist);
        const currentChecklistData: StagingDeployCashData | undefined = shouldCreateNewDeployChecklist ? undefined : GithubUtils.getStagingDeployCashData(mostRecentChecklist);

        // Find the list of PRs merged between the current checklist and the previous checklist
        const mergedPRs = await GitUtils.getPullRequestsDeployedBetween(previousChecklistData.tag, newStagingTag, CONST.APP_REPO);

        // mergedPRs includes cherry-picked PRs that have already been released with previous checklist, so we need to filter these out
        const previousPRNumbers = new Set(previousChecklistData.PRList.map((pr) => pr.number));
        const previousMobileExpensifyPRNumbers = new Set(previousChecklistData.PRListMobileExpensify.map((pr) => pr.number));
        core.startGroup('Filtering PRs:');
        core.info('mergedPRs includes cherry-picked PRs that have already been released with previous checklist, so we need to filter these out');
        core.info(`Found ${previousPRNumbers.size} PRs in the previous checklist:`);
        core.info(JSON.stringify(Array.from(previousPRNumbers)));
        const newPRNumbers = mergedPRs.filter((prNum) => !previousPRNumbers.has(prNum));
        core.info(`Found ${newPRNumbers.length} PRs deployed since the previous checklist:`);
        core.info(JSON.stringify(newPRNumbers));

        // Filter out cherry-picked PRs that were released with the previous checklist
        const removedPRs = mergedPRs.filter((prNum) => previousPRNumbers.has(prNum));
        if (removedPRs.length > 0) {
            core.info(`⚠️⚠️ Filtered out the following cherry-picked PRs that were released with the previous checklist: ${removedPRs.join(', ')} ⚠️⚠️`);
        }
        core.endGroup();
        console.info(`[api] Checklist PRs: ${newPRNumbers.join(', ')}`);

        // Get merged Mobile-Expensify PRs
        let mergedMobileExpensifyPRs: number[] = [];
        try {
            const allMobileExpensifyPRs = await GitUtils.getPullRequestsDeployedBetween(previousChecklistData.tag, newStagingTag, CONST.MOBILE_EXPENSIFY_REPO);
            mergedMobileExpensifyPRs = allMobileExpensifyPRs.filter((prNum) => !previousMobileExpensifyPRNumbers.has(prNum));

            console.info(`Found ${allMobileExpensifyPRs.length} total Mobile-Expensify PRs, ${mergedMobileExpensifyPRs.length} new ones after filtering:`);
            console.info(`Mobile-Expensify PRs: ${mergedMobileExpensifyPRs.join(', ')}`);

            // Log the Mobile-Expensify PRs that were filtered out
            const removedMobileExpensifyPRs = allMobileExpensifyPRs.filter((prNum) => previousMobileExpensifyPRNumbers.has(prNum));
            if (removedMobileExpensifyPRs.length > 0) {
                core.info(`⚠️⚠️ Filtered out the following cherry-picked Mobile-Expensify PRs that were released with the previous checklist: ${removedMobileExpensifyPRs.join(', ')} ⚠️⚠️`);
            }
        } catch (error) {
            // Check if this is a forked repository
            if (process.env.GITHUB_REPOSITORY !== `${CONST.GITHUB_OWNER}/${CONST.APP_REPO}`) {
                console.warn(
                    "⚠️ Unable to fetch Mobile-Expensify PRs because this workflow is running on a forked repository and secrets aren't accessble. This is expected for development/testing on forks.",
                );
            } else {
                console.error('Failed to fetch Mobile-Expensify PRs:', error);
            }
        }

        // Next, we generate the checklist body
        let checklistBody = '';
        let checklistAssignees: string[] = [];
        if (shouldCreateNewDeployChecklist) {
            const stagingDeployCashBodyAndAssignees = await GithubUtils.generateStagingDeployCashBodyAndAssignees(
                newVersion,
                newPRNumbers.map((value) => GithubUtils.getPullRequestURLFromNumber(value, CONST.APP_REPO_URL)),
                mergedMobileExpensifyPRs.map((value) => GithubUtils.getPullRequestURLFromNumber(value, CONST.MOBILE_EXPENSIFY_URL)),
                [], // verifiedPRList
                [], // verifiedPRListMobileExpensify
                [], // deployBlockers
                [], // resolvedDeployBlockers
                [], // resolvedInternalQAPRs
                false, // isFirebaseChecked
                false, // isGHStatusChecked
            );
            if (stagingDeployCashBodyAndAssignees) {
                checklistBody = stagingDeployCashBodyAndAssignees.issueBody;
                checklistAssignees = stagingDeployCashBodyAndAssignees.issueAssignees.filter(Boolean) as string[];
            }
        } else {
            // Generate the updated PR list, preserving the previous state of `isVerified` for existing PRs
            const PRList = newPRNumbers.map((prNum) => {
                const indexOfPRInCurrentChecklist = currentChecklistData?.PRList.findIndex((pr) => pr.number === prNum) ?? -1;
                const isVerified = indexOfPRInCurrentChecklist >= 0 ? currentChecklistData?.PRList[indexOfPRInCurrentChecklist].isVerified : false;
                return {
                    number: prNum,
                    url: GithubUtils.getPullRequestURLFromNumber(prNum, CONST.APP_REPO_URL),
                    isVerified,
                };
            });

            // Generate the updated Mobile-Expensify PR list, preserving the previous state of `isVerified` for existing PRs
            const PRListMobileExpensify = mergedMobileExpensifyPRs.map((prNum) => {
                const indexOfPRInCurrentChecklist = currentChecklistData?.PRListMobileExpensify.findIndex((pr) => pr.number === prNum) ?? -1;
                const isVerified = indexOfPRInCurrentChecklist >= 0 ? currentChecklistData?.PRListMobileExpensify[indexOfPRInCurrentChecklist].isVerified : false;
                return {
                    number: prNum,
                    url: GithubUtils.getPullRequestURLFromNumber(prNum, CONST.MOBILE_EXPENSIFY_URL),
                    isVerified,
                };
            });

            // Generate the deploy blocker list, preserving the previous state of `isResolved`
            const openDeployBlockers = await GithubUtils.paginate(GithubUtils.octokit.issues.listForRepo, {
                log: console,
                owner: CONST.GITHUB_OWNER,
                repo: CONST.APP_REPO,
                labels: CONST.LABELS.DEPLOY_BLOCKER,
            });

            // First, make sure we include all current deploy blockers
            const deployBlockers = openDeployBlockers.map((deployBlocker) => {
                const indexInCurrentChecklist = currentChecklistData?.deployBlockers.findIndex((item) => item.number === deployBlocker.number) ?? -1;
                const isResolved = indexInCurrentChecklist >= 0 ? currentChecklistData?.deployBlockers[indexInCurrentChecklist].isResolved : false;
                return {
                    number: deployBlocker.number,
                    url: deployBlocker.html_url,
                    isResolved,
                };
            });

            // Then make sure we include any demoted or closed blockers as well, and just check them off automatically
            for (const deployBlocker of currentChecklistData?.deployBlockers ?? []) {
                const isResolved = deployBlockers.findIndex((openBlocker) => openBlocker.number === deployBlocker.number) < 0;
                deployBlockers.push({
                    ...deployBlocker,
                    isResolved,
                });
            }

            // Include any existing Mobile-Expensify PRs from the current checklist that aren't in the new merged list
            for (const existingPR of currentChecklistData?.PRListMobileExpensify ?? []) {
                const isAlreadyIncluded = PRListMobileExpensify.findIndex((pr) => pr.number === existingPR.number) >= 0;
                if (!isAlreadyIncluded) {
                    PRListMobileExpensify.push(existingPR);
                }
            }

            const didVersionChange = newVersion !== currentChecklistData?.version;
            const stagingDeployCashBodyAndAssignees = await GithubUtils.generateStagingDeployCashBodyAndAssignees(
                newVersion,
                PRList.map((pr) => pr.url),
                PRListMobileExpensify.map((pr) => pr.url),
                PRList.filter((pr) => pr.isVerified).map((pr) => pr.url),
                PRListMobileExpensify.filter((pr) => pr.isVerified).map((pr) => pr.url),
                deployBlockers.map((blocker) => blocker.url),
                deployBlockers.filter((blocker) => blocker.isResolved).map((blocker) => blocker.url),
                currentChecklistData?.internalQAPRList.filter((pr) => pr.isResolved).map((pr) => pr.url),
                didVersionChange ? false : currentChecklistData.isFirebaseChecked,
                didVersionChange ? false : currentChecklistData.isGHStatusChecked,
            );
            if (stagingDeployCashBodyAndAssignees) {
                checklistBody = stagingDeployCashBodyAndAssignees.issueBody;
                checklistAssignees = stagingDeployCashBodyAndAssignees.issueAssignees.filter(Boolean) as string[];
            }
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
                title: `Deploy Checklist: New Expensify ${format(new Date(), CONST.DATE_FORMAT_STRING)}`,
                labels: [CONST.LABELS.STAGING_DEPLOY, CONST.LABELS.LOCK_DEPLOY],
                assignees: [CONST.APPLAUSE_BOT as string].concat(checklistAssignees),
            });
            console.log(`Successfully created new StagingDeployCash! 🎉 ${newChecklist.html_url}`);
            return newChecklist;
        }

        const {data: updatedChecklist} = await GithubUtils.octokit.issues.update({
            ...defaultPayload,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            issue_number: currentChecklistData?.number ?? 0,
        });
        console.log(`Successfully updated StagingDeployCash! 🎉 ${updatedChecklist.html_url}`);
        return updatedChecklist;
    } catch (err: unknown) {
        console.error('An unknown error occurred!', err);
        core.setFailed(err as Error);
    }
}

if (require.main === module) {
    run();
}

export default run;
