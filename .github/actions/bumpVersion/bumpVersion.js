const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const core = require('@actions/core');
const github = require('@actions/github');
const semverClean = require('semver/functions/clean');
const getMajorVersion = require('semver/functions/major');
const getMinorVersion = require('semver/functions/minor');
const getPatchVersion = require('semver/functions/patch');
const getBuildVersion = require('semver/functions/prerelease');

// Use Github Actions' default environment variables to get repo information
// https://docs.github.com/en/free-pro-team@latest/actions/reference/environment-variables#default-environment-variables
const [repoOwner, repoName] = process.env.GITHUB_REPOSITORY.split('/');

/**
 * Pad a number to be three digits (with leading zeros if necessary).
 *
 * @param {Number} number - Must be an integer.
 * @returns {String} - A string representation of the number w/ length 3.
 */
function padToThreeDigits(number) {
    if (number >= 100) {
        return number.toString();
    }
    if (number >= 10) {
        return `0${number.toString()}`;
    }
    return `00${number.toString()}`;
}

/**
 * Generate the 12-digit versionCode for android.
 * This version code allocates three digits each for MAJOR, MINOR, PATCH, and BUILD versions.
 * As a result, our max version is 999.999.999-999.
 *
 * @param {String} npmVersion
 * @returns {String}
 */
function generateAndroidVersionCode(npmVersion) {
    return ''.concat(
        padToThreeDigits(getMajorVersion(npmVersion)),
        padToThreeDigits(getMinorVersion(npmVersion)),
        padToThreeDigits(getPatchVersion(npmVersion)),
        padToThreeDigits(getBuildVersion(npmVersion)),
    );
}

/**
 * Use the react-native-version package to update the version of a native platform.
 *
 * @param {String} platform – "ios" or "android"
 * @param {String} versionCode – The version code to update the native platform.
 */
function updateNativeVersion(platform, versionCode) {
    if (platform !== 'android' && platform !== 'ios') {
        console.error('Invalid native platform specified!', platform);
        core.setFailed();
    }

    // Note: We're using `exec` instead of the `react-native-version` javascript sdk to avoid a known issue
    // with `ncc` and `process.cwd` https://github.com/vercel/webpack-asset-relocator-loader/issues/112
    exec(`react-native-version --amend --target ${platform} --set-build ${versionCode}`)
        .then(() => {
            console.log(`Successfully updated ${platform} to ${versionCode}`);
        })
        .catch((err) => {
            console.error('Error updating native version:', `platform: ${platform}`, `versionCode: ${versionCode}`);
            core.setFailed(err);
        });
}

/**
 * A callback function for a successful `npm version` command.
 *
 * @param {String} newVersion
 */
function postVersionUpdateNative(newVersion) {
    const cleanNewVersion = semverClean(newVersion);
    console.log(`Updated npm version to ${cleanNewVersion}! Updating native versions...`);

    // The native version needs to be different on Android v.s. iOS
    const androidVersionCode = generateAndroidVersionCode(cleanNewVersion);
    console.log('Updating android:', `buildCode: ${androidVersionCode}`, `buildName: ${cleanNewVersion}`);
    updateNativeVersion('android', androidVersionCode);
    console.log(`Updating ios to ${cleanNewVersion}`);
    updateNativeVersion('ios', cleanNewVersion);
}

const MAX_RETRIES = 10;
let errCount = 0;
let shouldRetry;

do {
    shouldRetry = false;
    exec('npm version prerelease -m "Update version to %s"')
        .then(({stdout}) => {
            postVersionUpdateNative(stdout);
        })
        // eslint-disable-next-line no-loop-func
        .catch((err) => {
            console.log(err.stdout);
            console.log(err.stderr);

            // It's possible that two PRs were merged in rapid succession.
            // In this case, both PRs will attempt to update to the same npm version.
            // This will cause the deploy to fail with an exit code 128,
            // saying the git tag for that version already exists.
            if (errCount < MAX_RETRIES) {
                console.log(
                    'Err: npm version conflict, attempting to automatically resolve',
                    `retryCount: ${++errCount}`,
                );
                shouldRetry = true;
                const {version} = JSON.parse(fs.readFileSync('./package.json'));
                const currentPatchVersion = `v${version.slice(0, -4)}`;
                console.log('Current patch version:', currentPatchVersion);

                // Fetch tags
                console.log('Fetching tags from github...');
                const octokit = github.getOctokit(core.getInput('GITHUB_TOKEN', {required: true}));
                return octokit.repos.listTags({
                    owner: repoOwner,
                    repo: repoName,
                })
                    .then(githubResponse => ({currentPatchVersion, githubResponse}))
                    .catch(githubError => core.setFailed(githubError));
            }

            // Maximum retries reached, fail this action.
            core.setFailed(err);
        })
        .then(({currentPatchVersion, githubResponse}) => {
            // Find the highest build version git tag
            const tags = githubResponse.data.map(tag => tag.name);
            console.log('Tags: ', tags);
            const highestBuildNumber = Math.max(
                ...(tags
                    .filter(tag => tag.startsWith(currentPatchVersion))
                    .map(tag => tag.split('-')[1])
                ),
            );
            console.log('Highest build number from current patch version:', highestBuildNumber);

            // Bump the build number again
            const newBuildNumber = `${currentPatchVersion}-${highestBuildNumber + 1}`;
            console.log(`Setting npm version for this PR to ${newBuildNumber}`);
            return exec(`npm version ${newBuildNumber} -m "Update version to ${newBuildNumber}"`);
        })
        // eslint-disable-next-line no-loop-func
        .then(({stdout}) => {
            // NPM version successfully updated, update native versions - don't retry.
            postVersionUpdateNative(stdout);
            shouldRetry = false;
        })
        .catch(({stdout, stderr}) => {
            // Log errors and retry
            console.log(stdout);
            console.error(stderr);
        });
} while (shouldRetry);
