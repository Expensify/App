#!/usr/bin/env ts-node

/* eslint-disable @typescript-eslint/naming-convention */

/**
 * This script helps to symbolicate a .cpuprofile file that was obtained from a specific (staging) app version (usually provided by a user using the app).
 *
 * @abstract
 *
 * 1. When creating a new deployment in our github actions, we upload the source map for android and iOS as artifacts.
 * 2. The profiles created by the app on the user's device have the app version encoded in the filename.
 * 3. This script takes in a .cpuprofile file, reads the app version from the filename, and downloads the corresponding source map from the artifacts using github's API.
 * 4. It then uses the source map to symbolicate the .cpuprofile file using the `react-native-release-profiler` cli.
 *
 * @note For downloading an artifact a github token is required.
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
    Logger.log('Symbolicates a .cpuprofile file obtained from a specific app version by downloading the source map from the github action runs.');
    Logger.log('Usage: npm run symbolicate-profile -- --profile=<filename> --platform=<ios|android>');
    Logger.log('Options:');
    Logger.log('  --profile=<filename>          The .cpuprofile file to symbolicate');
    Logger.log('  --platform=<ios|android>      The platform for which the source map was uploaded');
    Logger.log('  --gh-token                    Token to use for requests send to the GitHub API. By default tries to pick up from the environment variable GITHUB_TOKEN');
    Logger.log('  --help                        Display this help message');
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

function getWorkflowRunArtifact() {
    const artifactName = `${argsMap.platform}-sourcemap-${appVersion}`;
    Logger.info(`Fetching sourcemap artifact with name "${artifactName}"`);
    return octokit
        .request('GET /repos/{owner}/{repo}/actions/artifacts', {
            owner: OWNER,
            repo: REPO,
            per_page: 1,
            name: artifactName,
        })
        .then((artifactsResponse) => {
            const artifact = artifactsResponse.data.artifacts[0];
            if (artifact === undefined) {
                throw new Error(`Could not find the artifact ${artifactName}!`);
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

    const destination = path.join(sourcemapDir, `${argsMap.platform}-sourcemap-${appVersion}.zip`);
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

// Symbolicate using the downloaded source map
function symbolicateProfile() {
    const command = `npx react-native-release-profiler --local ${argsMap.profile} --sourcemap-path ${localSourceMapPath}`;
    execSync(command, {stdio: 'inherit'});
}

// #endregion

// Step: check if source map locally already exists (if so we can skip the download)
if (fs.existsSync(localSourceMapPath)) {
    Logger.success(`Found local source map at ${localSourceMapPath}`);
    Logger.info('Skipping download step');
    symbolicateProfile();
} else {
    // Step: Download the source map for the app version:
    getWorkflowRunArtifact()
        .then((artifactId) => getDownloadUrl(artifactId))
        .then((downloadUrl) => downloadFile(downloadUrl))
        .then((zipPath) => unpackZipFile(zipPath))
        .then(() => renameDownloadedSourcemapFile())
        .then(() => symbolicateProfile());
}
