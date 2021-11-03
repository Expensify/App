const core = require('@actions/core');
const {execSync} = require('child_process');
const {PLIST_PATH} = require('../../libs/nativeVersionUpdater');

const bundleVersion = execSync(`/usr/libexec/PlistBuddy -c "Print :CFBundleVersion" ${PLIST_PATH}`);
const shortBundleVersion = execSync(`/usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" ${PLIST_PATH}`);

if (shortBundleVersion !== bundleVersion.split('-')[0]) {
    console.log('Bundle Versions do not match');
    core.setOutput('BUNDLE_VERSIONS_MATCH', false);
} else {
    console.log('Bundle Versions match');
    core.setOutput('BUNDLE_VERSIONS_MATCH', true);
}
