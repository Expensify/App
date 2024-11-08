import { google } from 'googleapis';
import GithubUtils from "@github/libs/GithubUtils";
import * as core from '@actions/core';

const PACKAGE_NAME = process.env.PACKAGE_NAME;
const GOOGLE_KEY_FILE = process.env.GOOGLE_KEY_FILE;
const REPO_OWNER = process.env.REPO_OWNER || '';
const REPO_NAME = process.env.REPO_NAME || '';
const HALTED_STATUS = 'halted';

async function checkAndroidStatus() {
    const auth = new google.auth.GoogleAuth({
        keyFile: GOOGLE_KEY_FILE,
        scopes: ['https://www.googleapis.com/auth/androidpublisher']
    });

    const androidApi = google.androidpublisher({
        version: 'v3',
        auth: auth
    });

    try {
        // Insert an edit to get an edit ID
        const editResponse = await androidApi.edits.insert({
            packageName: PACKAGE_NAME,
        });
        const editId = editResponse.data.id;

        // Get the production track status
        const trackResponse = await androidApi.edits.tracks.get({
            packageName: PACKAGE_NAME,
            editId: editId!,
            track: 'production',
        });

        const status = trackResponse.data.releases?.[0]?.status || 'undefined';
        console.log('Track status:', status);

        // Check if the status is halted
        const HALTED = status === HALTED_STATUS;
        core.setOutput('HALTED', HALTED);
    } catch (error) {
        console.error('Error checking track status:', error);
        process.exit(1);
    }
}

async function getLatestReleaseDate() {
    const { data } = await GithubUtils.octokit.repos.getLatestRelease({
        owner: REPO_OWNER,
        repo: REPO_NAME,
    });

    const releaseDate = data.published_at?.split('T')[0];
    if (!releaseDate) {
        throw new Error('Unable to retrieve the latest release date from GitHub');
    }

    console.log('Latest release date:', releaseDate);
    return releaseDate;
}

function calculateRolloutPercentage(releaseDate: string): number {
    const release = new Date(releaseDate);
    const current = new Date();
    const daysSinceRelease = Math.floor((current.getTime() - release.getTime()) / (1000 * 60 * 60 * 24));
    console.log('Days since release:', daysSinceRelease);

    if (daysSinceRelease <= 0) return 0;
    if (daysSinceRelease === 1) return 1;
    if (daysSinceRelease === 2) return 2;
    if (daysSinceRelease === 3) return 5;
    if (daysSinceRelease === 4) return 10;
    if (daysSinceRelease === 5) return 20;
    if (daysSinceRelease === 6) return 50;
    return 100;
}

checkAndroidStatus()
    .then(getLatestReleaseDate)
    .then((releaseDate) => {
        const rolloutPercentage = calculateRolloutPercentage(releaseDate);
        console.log('Rollout percentage:', rolloutPercentage);
        core.setOutput('ROLLOUT_PERCENTAGE', rolloutPercentage);
});
