import * as core from '@actions/core';
// Import just the one Google API we use rather than the `googleapis` mega-package, which carries every
// Google API and bundles to ~770k lines per action. The `auth` export is the same AuthPlus instance that
// the mega-package exposes under its `google` namespace.
import {androidpublisher, auth as googleAuth} from '@googleapis/androidpublisher';

const PACKAGE_NAME = core.getInput('PACKAGE_NAME', {required: true});
const GOOGLE_KEY_FILE = core.getInput('GOOGLE_KEY_FILE', {required: true});

async function getAndroidRolloutPercentage() {
    const auth = new googleAuth.GoogleAuth({
        keyFile: GOOGLE_KEY_FILE,
        scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });

    const androidApi = androidpublisher({
        version: 'v3',
        auth,
    });

    try {
        // The Google Play API requires an edit ID to make changes to the app
        const editResponse = await androidApi.edits.insert({
            packageName: PACKAGE_NAME,
        });
        const editId = editResponse.data.id ?? 'undefined';

        // Get the production track status
        const trackResponse = await androidApi.edits.tracks.get({
            packageName: PACKAGE_NAME,
            editId,
            track: 'production',
        });

        const userFraction = trackResponse.data.releases?.[0]?.userFraction ?? '-1';
        console.log('Track response', JSON.stringify(trackResponse.data));
        console.log('Current Android rollout percentage:', userFraction);

        core.setOutput('CURRENT_ROLLOUT_PERCENTAGE', userFraction);
    } catch (error) {
        console.error('Error checking track status:', error);
        process.exit(1);
    }
}

getAndroidRolloutPercentage().then(() => {});
