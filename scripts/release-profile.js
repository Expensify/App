#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs');
const {execSync} = require('child_process');

// Function to parse command-line arguments into a key-value object
function parseCommandLineArguments() {
    const args = process.argv.slice(2); // Skip node and script paths
    const argsMap = {};
    args.forEach((arg) => {
        const [key, value] = arg.split('=');
        if (key.startsWith('--')) {
            argsMap[key.substring(2)] = value;
        }
    });
    return argsMap;
}

// Function to find .cpuprofile files in the current directory
function findCpuProfileFiles() {
    const files = fs.readdirSync(process.cwd());
    // eslint-disable-next-line rulesdir/prefer-underscore-method
    return files.filter((file) => file.endsWith('.cpuprofile'));
}

const argsMap = parseCommandLineArguments();

// Determine sourcemapPath based on the platform flag passed
let sourcemapPath;
if (argsMap.platform === 'ios') {
    sourcemapPath = 'main.jsbundle.map';
} else if (argsMap.platform === 'android') {
    sourcemapPath = 'android/app/build/generated/sourcemaps/react/productionRelease/index.android.bundle.map';
} else {
    console.error('Please specify the platform using --platform=ios or --platform=android');
    process.exit(1);
}

// Attempt to find .cpuprofile files
const cpuProfiles = findCpuProfileFiles();
if (cpuProfiles.length === 0) {
    console.error('No .cpuprofile files found in the root directory.');
    process.exit(1);
} else if (cpuProfiles.length > 1) {
    console.error('Multiple .cpuprofile files found. Please specify which one to use by placing only one .cpuprofile in the root or specifying the filename as an argument.');
    process.exit(1);
} else {
    // Construct the command
    const cpuprofileName = cpuProfiles[0];
    const command = `npx react-native-release-profiler --local ${cpuprofileName} --sourcemap-path ${sourcemapPath}`;

    console.log(`Executing: ${command}`);

    // Execute the command
    try {
        const output = execSync(command, {stdio: 'inherit'});
        console.log(output.toString());
    } catch (error) {
        console.error(`Error executing command: ${error}`);
        process.exit(1);
    }
}
