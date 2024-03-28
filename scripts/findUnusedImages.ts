import fs from 'fs';
import type {PathOrFileDescriptor} from 'fs';
import path from 'path';

/**
 * Regular expression to match the asset imports
 *
 * It matches the following imports:
 * 1. import assetName from '@assets/images/some-asset.png';
 * 2. import assetName from '@assets/images/some-folder/some-asset.png';
 * 3. import assetName from '@assets/images/some-folder/some_asset.svg';
 */
const regexToMatchAssetImport = /import\s+([a-zA-Z][a-zA-Z0-9_-]*)\s+from\s+['"]@assets\/images\/(?:[\w-_]+\/)*([a-zA-Z][a-zA-Z0-9_-]+\.[a-zA-Z]+)['"]/g;

// Function to recursively get all files in a directory
function getAllFiles(dir: string, fileList: string[] = []) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllFiles(filePath, fileList);
        } else {
            fileList.push(filePath);
        }
    });
    return fileList;
}

// Function to parse imports from a file
function parseImports(filePath: PathOrFileDescriptor) {
    const content = fs.readFileSync(filePath, 'utf8');

    const matches = [];
    let match = regexToMatchAssetImport.exec(content);
    while (match !== null) {
        matches.push({
            assetName: match[1],
            imagePath: match?.[0]?.split('@')?.pop()?.slice(0, -1) ?? '',
        });
        match = regexToMatchAssetImport.exec(content);
    }
    return matches;
}

function containsNumber(str: string) {
    // Check if the string contains any digit between 0 and 9
    return /\d/.test(str);
}

// MCCGroupIcons are used in the app dynamically
const MCCGroupIcons = ['Airlines', 'Commuter', 'Gas', 'Goods', 'Groceries', 'Hotel', 'Mail', 'Meals', 'Rental', 'Services', 'Taxi', 'Miscellaneous', 'Utilities'];

function isWhiteList(assetName: string) {
    // We have assets named like Avatar1, Avatar2, Avatar3, etc. which are used in the app
    if (assetName.includes('Avatar') && containsNumber(assetName)) {
        return true;
    }

    // We have assets named like Workspace1, Workspace2, WorkspaceA, etc. which are used in the app
    if (assetName.includes('Workspace')) {
        return true;
    }

    // Do not remove the logo assets like productionLogo, devLogo, etc.
    if (assetName.includes('Logo')) {
        return true;
    }

    if (assetName === 'ConciergeAvatar') {
        return true;
    }

    if (assetName === 'NotificationsAvatar') {
        return true;
    }

    if (assetName.includes('GenericBank')) {
        return true;
    }

    if (assetName === 'FrequentlyUsed' || assetName === 'History') {
        return true;
    }

    if (MCCGroupIcons.includes(assetName)) {
        return true;
    }

    return false;
}

// Main function to find unused assets
function findUnusedAssets(projectDir: string) {
    const allFiles = getAllFiles(projectDir);
    const assetMap = new Set<string>();
    const unusedAssets = new Map<string, string>();

    // Parse imports from all the files and add them to the assetMap and unusedAssets map
    allFiles.forEach((file) => {
        const imports = parseImports(file);
        imports.forEach((imp) => {
            const {assetName, imagePath} = imp;
            assetMap.add(assetName);
            unusedAssets.set(assetName, imagePath);
        });
    });

    /**
     * Check if the asset is used in any of the files
     * We do a nested loop here to check if the asset is used in any of the files
     * If the asset is used in any of the files, we remove it from the unusedAssets map,
     * so whatever is left in the unusedAssets map is the unused assets.
     */
    assetMap.forEach((assetName) => {
        let hasMatch = false;
        allFiles.forEach((file) => {
            const content = fs.readFileSync(file, 'utf8');
            const regex = new RegExp(`import {?${assetName}}?`);
            if (content.includes(`.${assetName}`)) {
                unusedAssets.delete(assetName);
                hasMatch = true;
            } else if (content.match(regex) && !file.includes('src/components/Icon/')) {
                unusedAssets.delete(assetName);
                hasMatch = true;
            }
        });

        if (!hasMatch && isWhiteList(assetName)) {
            unusedAssets.delete(assetName);
        }
    });

    return {assetMap, unusedAssets};
}

// Function to delete unused assets
function removeUnusedAssets(unusedAssets: Map<string, string>) {
    unusedAssets.forEach((assetName) => {
        fs.unlinkSync(assetName);
    });

    if (unusedAssets.size === 0) {
        // eslint-disable-next-line no-console
        console.log('No unused assets found');
    }

    if (unusedAssets.size > 0) {
        // eslint-disable-next-line no-console
        console.log('Unused assets have been removed successfully, you may want to remove the imports from the files as well.');
    }
}

const {unusedAssets} = findUnusedAssets('./src');
removeUnusedAssets(unusedAssets);
