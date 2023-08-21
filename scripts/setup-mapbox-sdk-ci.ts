/**
 * Mapbox SDK CI Configuration Script
 * ===================================
 *
 * A script tailored for Continuous Integration (CI) environments to set up the Mapbox SDK.
 * Takes a Mapbox access token as a command-line argument and configures the SDK appropriately.
 *
 * Usage:
 * `ts-node ./scripts/setup-mapbox-sdk-ci.ts YOUR_MAPBOX_ACCESS_TOKEN`
 */

import {saveMapboxToken} from './setup-mapbox-sdk';

const token = process.argv[2];

// Check if the token is provided on the command argument
if (token === undefined) {
    console.error('Error: An argument is required for this script.');
    console.error('Usage: ts-node ./scripts/setup-mapbox-sdk-ci.ts <YOUR_MAPBOX_TOKEN>');
    process.exit(1); // Exit with a failure status
}

saveMapboxToken(token);
