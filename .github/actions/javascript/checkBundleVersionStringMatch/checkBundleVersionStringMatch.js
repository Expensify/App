const core = require('@actions/core');
const {execSync} = require('child_process');
const {PLIST_PATH} = require('../../../libs/nativeVersionUpdater');

const bundleVersion = execSync(`grep -A1 'CFBundleVersion' ${PLIST_PATH} | grep -v 'CFBundleVersion' | sed 's|[</string>,]||g'`).toString().trim();
const shortBundleVersion = execSync(`grep -A1 'CFBundleShortVersionString' ${PLIST_PATH} | grep -v 'CFBundleShortVersionString' | sed 's|[</string>,]||g'`).toString().trim();

console.log(`Bundle Version: ${bundleVersion}`);
console.log(`Short Bundle Version: ${shortBundleVersion}`);

const hasValue = shortBundleVersion && bundleVersion;
if (!hasValue) {
    console.log('Failed to get Bundle Versions from plist');
    core.setOutput('BUNDLE_VERSIONS_MATCH', false);
} else if (bundleVersion.includes(shortBundleVersion)) {
    console.log('Bundle Versions are compatible');
    core.setOutput('BUNDLE_VERSIONS_MATCH', true);
} else {
    console.log('Bundle Versions are not compatible');
    core.setOutput('BUNDLE_VERSIONS_MATCH', false);
}
