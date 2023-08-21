import * as fs from 'fs';
import * as path from 'path';

/**
 * Mapbox SDK Configuration Script for iOS and Android
 * ===================================================
 *
 * Purpose:
 * --------
 * This script configures the development environment to download Mapbox SDKs
 * for both iOS and Android builds. We use Mapbox to display maps in the App. As Mapbox SDKs
 * are closed-sourced, we need to authenticate with Mapbox during the download.
 *
 * Background:
 * -----------
 * To build the App, a machine requires a Mapbox token with the necessary permissions to download SDKs.
 * This token needs to be saved in relevant files, enabling tools like CocoaPods for iOS or Gradle
 * for Android to access the Mapbox SDK during the build process.
 *
 * The `.netrc` file for iOS Configuration:
 * ----------------------------------------
 * The token for iOS is stored in the `.netrc` file located in the user's home directory.
 * This file is used in Unix-like systems to store credentials for remote machine access.
 *
 * The `gradle.properties` file for Android Configuration:
 * -------------------------------------------------------
 * The token for Android is stored in the `gradle.properties` file located in the .gradle directory
 * in the user's home. This is accessed by the Android build system during the SDK download.
 *
 * Usage:
 * ------
 * To run this script, pass the secret Mapbox access token as a command-line argument:
 * `ts-node ./scripts/setup-mapbox-sdk.ts YOUR_MAPBOX_ACCESS_TOKEN`
 */

const NETRC_PATH = path.join(process.env.HOME || '', '.netrc');
const USER_GRADLE_DIR = path.join(process.env.HOME || '', '.gradle');
const GRADLE_PROPERTIES_PATH = path.join(USER_GRADLE_DIR, 'gradle.properties');

export async function saveMapboxToken(token: string) {
    try {
        // iOS Configuration for .netrc
        console.log(`Configuring ${NETRC_PATH} for Mapbox iOS SDK download`);
        if (fs.existsSync(NETRC_PATH) && fs.readFileSync(NETRC_PATH, 'utf8').includes('api.mapbox.com')) {
            const updatedContent = fs.readFileSync(NETRC_PATH, 'utf8').replace(/password .*/, `password ${token}`);
            fs.writeFileSync(NETRC_PATH, updatedContent, 'utf8');
            console.log(`Token was updated in ${NETRC_PATH}`);
        } else {
            fs.appendFileSync(NETRC_PATH, `machine api.mapbox.com\nlogin mapbox\npassword ${token}\n`, 'utf8');
            console.log(`${NETRC_PATH} was configured with new credentials`);
        }

        // Set the permissions of the .netrc file to ensure it's kept private
        await fs.chmodSync(NETRC_PATH, 0o600);

        // Ensure the .gradle directory exists
        if (!fs.existsSync(USER_GRADLE_DIR)) {
            fs.mkdirSync(USER_GRADLE_DIR);
        }

        // Android Configuration for gradle.properties
        console.log(`\nConfiguring ${GRADLE_PROPERTIES_PATH} for Mapbox Android SDK download`);
        if (fs.existsSync(GRADLE_PROPERTIES_PATH) && fs.readFileSync(GRADLE_PROPERTIES_PATH, 'utf8').includes('MAPBOX_DOWNLOADS_TOKEN')) {
            const updatedContent = fs.readFileSync(GRADLE_PROPERTIES_PATH, 'utf8').replace(/MAPBOX_DOWNLOADS_TOKEN=.*/, `MAPBOX_DOWNLOADS_TOKEN=${token}`);
            fs.writeFileSync(GRADLE_PROPERTIES_PATH, updatedContent, 'utf8');
            console.log(`Token was updated in ${GRADLE_PROPERTIES_PATH}`);
        } else {
            fs.appendFileSync(GRADLE_PROPERTIES_PATH, `MAPBOX_DOWNLOADS_TOKEN=${token}\n`, 'utf8');
            console.log(`${GRADLE_PROPERTIES_PATH} was configured with new credentials`);
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error:', error.message);
            process.exit(1);
        }
    }
}
