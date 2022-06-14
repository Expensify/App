const {notarize} = require('electron-notarize');
const electron = require('../config/electronBuilder.config');

exports.default = function notarizing(context) {
    const {electronPlatformName, appOutDir} = context;
    if (electronPlatformName !== 'darwin') {
        return;
    }

    const appName = context.packager.appInfo.productFilename;

    return notarize({
        tool: 'notarytool',
        appBundleId: electron.appId,
        appPath: `${appOutDir}/${appName}.app`,
        appleId: process.env.APPLE_ID,
        appleIdPassword: process.env.APPLE_ID_PASSWORD,
        teamId: '368M544MTT',
    });
};
