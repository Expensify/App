#!/usr/bin/env ts-node

/* eslint-disable @typescript-eslint/naming-convention */

/**
 * This script helps to symbolicate a .cpuprofile file that was obtained from a specific (staging) app version (usually provided by a user using the app).
 *
 * @abstract
 *
 * 1. When creating a new deployment in our github actions, we upload the source map for android and iOS as artifacts.
 * 2. The profiles created by the app on the user's device have the app version encoded in the filename.
 * 3. This script takes in a .cpuprofile file, reads the app version from the filename, and downloads the corresponding source map from the artifacts.
 * 4. It then uses the source map to symbolicate the .cpuprofile file using the `react-native-release-profiler` cli.
 */
import {Octokit} from '@octokit/core';
import {execSync} from 'child_process';
import fs from 'fs';
import https from 'https';
import path from 'path';
import * as Logger from './utils/Logger';
import parseCommandLineArguments from './utils/parseCommandLineArguments';

const argsMap = parseCommandLineArguments();

// #region Input validation
if (Object.keys(argsMap).length === 0 || argsMap.help !== undefined) {
    Logger.log('Symbolicates a .cpuprofile file obtained from a specific app version.');
    Logger.log('Usage: npm run symbolicate-profile -- --profile=<filename> --platform=<ios|android>');
    Logger.log('Options:');
    Logger.log('  --profile=<filename>   The .cpuprofile file to symbolicate');
    Logger.log('  --platform=<ios|android>   The platform for which the source map was uploaded');
    Logger.log('  --gh-token   Token to use for requests send to the GitHub API. By default tries to pick up from the environment variable GITHUB_TOKEN');
    Logger.log('  --help   Display this help message');
    process.exit(0);
}

if (argsMap.profile === undefined) {
    Logger.error('Please specify the .cpuprofile file to symbolicate using --profile=<filename>');
    process.exit(1);
}
if (!fs.existsSync(argsMap.profile)) {
    Logger.error(`File ${argsMap.profile} does not exist.`);
    process.exit(1);
}

if (argsMap.platform === undefined) {
    Logger.error('Please specify the platform using --platform=ios or --platform=android');
    process.exit(1);
}

const githubToken = argsMap.ghToken ?? process.env.GITHUB_TOKEN;
if (githubToken === undefined) {
    Logger.error('No GitHub token provided. Either set a GITHUB_TOKEN environment variable or pass it using --gh-token');
    process.exit(1);
}
// #endregion

// #region Get the app version

// Formatted as "Profile_trace_for_1.4.81-9.cpuprofile"
const appVersionRegex = /\d+\.\d+\.\d+(-\d+)?/;
const appVersion = argsMap.profile.match(appVersionRegex)?.[0];
if (appVersion === undefined) {
    Logger.error('Could not extract the app version from the profile filename.');
    process.exit(1);
}
Logger.info(`Found app version ${appVersion} in the profile filename`);
// #endregion

// #region Utility functions
// We need the token for the download step
const octokit = new Octokit({auth: githubToken});
const OWNER = 'Expensify';
const REPO = 'App';

function getWorkflowId() {
    // Step 1: Find the workflow id
    // Note: we could hard code it, but this way its simpler if the job changes in the future
    const workflowFile = '.github/workflows/platformDeploy.yml';
    Logger.info(`Fetching workflow id for the source map job from ${workflowFile}`);

    return octokit
        .request('GET /repos/{owner}/{repo}/actions/workflows', {
            owner: OWNER,
            repo: REPO,
            per_page: 100,
        })
        .then((workflowsResponse) => {
            const workflow = workflowsResponse.data.workflows.find(({path}) => path === workflowFile);
            if (workflow === undefined) {
                throw new Error(`Could not find the workflow file ${workflowFile} in results! Has it been renamed?`);
            }
            return workflow.id;
        })
        .catch((error) => {
            Logger.error('Failed to fetch workflows to get the id for the source map job');
            Logger.error(error);
            throw error;
        });
}

function getWorkflowRun(workflowId: number) {
    Logger.info(`Fetching workflow runs for workflow id ${workflowId} for branch ${appVersion}`);
    return octokit
        .request('GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs', {
            owner: OWNER,
            repo: REPO,
            workflow_id: workflowId,
            // For each app version a new branch is created, so we can filter by branch.
            branch: appVersion,
            // There should only be one successful deploy job for a given app version
            per_page: 1,
            // Note: the workflow run could fail for different jobs. If its completed its possible the sourcemaps have been uploaded.
            // If the source map is not present, we will fail on the next step.
            status: 'completed',
        })
        .then((runsResponse) => {
            if (runsResponse.data.total_count === 0) {
                throw new Error(`No successful runs found for the app version ${appVersion}!\nAre you sure the job the upload source map job run successfully?`);
            }

            const run = runsResponse.data.workflow_runs[0];
            if (run.status !== 'success') {
                Logger.warn(`The run ${Logger.formatLink(run.id, run.html_url)} was not successful. The source map _might_ not be uploaded.`);
            } else {
                Logger.success(`Found successful run ${Logger.formatLink(run.id, run.html_url)} for app version ${appVersion}`);
            }

            return run.id;
        })
        .catch((error) => {
            Logger.error('Failed to fetch workflow runs for the app version');
            Logger.error(error);
            throw error;
        });
}

function getWorkflowRunArtifact(runId: number, platform: 'ios' | 'android') {
    const artefactName = `${platform}-sourcemap`;
    Logger.info(`Fetching sourcemap artifact for run id ${runId} with name "${artefactName}"`);
    return octokit
        .request('GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts', {
            owner: OWNER,
            repo: REPO,
            run_id: runId,
            name: artefactName,
        })
        .then((artifactsResponse) => {
            const artifact = artifactsResponse.data.artifacts.find(({name}) => name === artefactName);
            if (artifact === undefined) {
                throw new Error(`Could not find the artifact ${artefactName} in results!`);
            }
            return artifact.id;
        })
        .catch((error) => {
            Logger.error('Failed to get artifact!');
            Logger.error(error);
            throw error;
        });
}

function getDownloadUrl(artifactId: number) {
    // https://docs.github.com/en/rest/actions/artifacts?apiVersion=2022-11-28#download-an-artifact
    // Gets a redirect URL to download an archive for a repository. This URL expires after 1 minute.
    // Look for Location: in the response header to find the URL for the download.

    Logger.log(`Getting download URL for artifact…`);
    return octokit
        .request('GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format}', {
            owner: OWNER,
            repo: REPO,
            artifact_id: artifactId,
            archive_format: 'zip',
        })
        .then((response) => {
            // The response should be a redirect to the actual download URL
            const downloadUrl = response.url;

            if (downloadUrl === undefined) {
                throw new Error(`Could not find the download URL in:\n${JSON.stringify(response, null, 2)}`);
            }

            return downloadUrl;
        })
        .catch((error) => {
            Logger.error('Failed to download artifact!');
            Logger.error(error);
            throw error;
        });
}

const dirName = '.sourcemaps';
const sourcemapDir = path.join(process.cwd(), dirName);

function downloadFile(url: string) {
    Logger.log(`Downloading file from URL: ${url}`);
    if (!fs.existsSync(sourcemapDir)) {
        Logger.info(`Creating download directory ${sourcemapDir}`);
        fs.mkdirSync(sourcemapDir);
    }

    const destination = path.join(sourcemapDir, `${argsMap.platform}-${appVersion}-sourcemap.zip`);
    const file = fs.createWriteStream(destination);
    return new Promise<string>((resolve, reject) => {
        https
            .get(url, (response) => {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    Logger.success(`Downloaded file to ${destination}`);
                    resolve(destination);
                });
            })
            .on('error', (error) => {
                fs.unlink(destination, () => {
                    reject(error);
                });
            });
    });
}

function unpackZipFile(zipPath: string) {
    Logger.info(`Unpacking file ${zipPath}`);
    const command = `unzip -o ${zipPath} -d ${sourcemapDir}`;
    execSync(command, {stdio: 'inherit'});
    Logger.info(`Deleting zip file ${zipPath}`);
    return new Promise<void>((resolve, reject) => {
        fs.unlink(zipPath, (error) => (error ? reject(error) : resolve()));
    });
}

const localSourceMapPath = path.join(sourcemapDir, `${appVersion}-${argsMap.platform}.map`);
function renameDownloadedSourcemapFile() {
    const androidName = 'index.android.bundle.map';
    const iosName = 'main.jsbundle.map';
    const downloadSourcemapPath = path.join(sourcemapDir, argsMap.platform === 'ios' ? iosName : androidName);

    if (!fs.existsSync(downloadSourcemapPath)) {
        Logger.error(`Could not find the sourcemap file ${downloadSourcemapPath}`);
        process.exit(1);
    }

    Logger.info(`Renaming sourcemap file to ${localSourceMapPath}`);
    fs.renameSync(downloadSourcemapPath, localSourceMapPath);
}

// #endregion

// Step: check if source map locally already exists (if so we can skip the download)
if (fs.existsSync(localSourceMapPath)) {
    Logger.success(`Found local source map at ${localSourceMapPath}`);
    Logger.info('Skipping download step');
} else {
    // Step: Download the source map for the app version:
    getWorkflowId()
        .then((workflowId) => getWorkflowRun(workflowId))
        .then((runId) => getWorkflowRunArtifact(runId, argsMap.platform as 'ios' | 'android'))
        .then((artifactId) => getDownloadUrl(artifactId))
        .then((downloadUrl) => downloadFile(downloadUrl))
        .then((zipPath) => unpackZipFile(zipPath))
        .then(() => renameDownloadedSourcemapFile());
}
