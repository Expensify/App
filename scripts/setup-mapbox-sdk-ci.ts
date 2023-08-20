import {saveMapboxToken} from './setup-mapbox-sdk';

const token = process.argv[2];

// Check if the token is provided on the command argument
if (token === undefined) {
    console.error('Error: An argument is required for this script.');
    console.error('Usage: ts-node ./scripts/setup-mapbox-sdk-ci.ts <YOUR_MAPBOX_TOKEN>');
    process.exit(1); // Exit with a failure status
}

saveMapboxToken(token);
