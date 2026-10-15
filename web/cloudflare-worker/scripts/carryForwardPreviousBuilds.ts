/**
 * Copies files from previous web builds into the current one when the current build doesn't have them, so tabs still
 * running an older build can load its chunks after a deploy. Files with fixed names exist in every build and are
 * never replaced, so in practice only content-hashed and versioned files are carried forward.
 *
 *   node scripts/carryForwardPreviousBuilds.ts <current dist> <previous dist>...
 *
 * List previous builds newest first.
 */
import {copyFileSync, existsSync, mkdirSync, readdirSync} from 'node:fs';
import path from 'node:path';

const UNPUBLISHED_FILE = /\.(?:br|map)$/;

function carryForwardPreviousBuilds(currentBuildDir: string, previousBuildDirs: string[]): number {
    let copiedCount = 0;
    for (const previousBuildDir of previousBuildDirs) {
        for (const relativePath of readdirSync(previousBuildDir, {recursive: true, withFileTypes: true})) {
            if (!relativePath.isFile() || UNPUBLISHED_FILE.test(relativePath.name)) {
                continue;
            }

            const sourcePath = path.join(relativePath.parentPath, relativePath.name);
            const targetPath = path.join(currentBuildDir, path.relative(previousBuildDir, sourcePath));
            if (existsSync(targetPath)) {
                continue;
            }

            mkdirSync(path.dirname(targetPath), {recursive: true});
            copyFileSync(sourcePath, targetPath);
            copiedCount++;
        }
    }
    return copiedCount;
}

if (import.meta.main) {
    const [currentBuildDir, ...previousBuildDirs] = process.argv.slice(2);
    if (!currentBuildDir || previousBuildDirs.length === 0) {
        console.error('Usage: node scripts/carryForwardPreviousBuilds.ts <current dist> <previous dist>...');
        process.exit(1);
    }
    const copiedCount = carryForwardPreviousBuilds(currentBuildDir, previousBuildDirs);
    console.log(`Carried forward ${copiedCount} files from ${previousBuildDirs.length} previous builds.`);
}

export default carryForwardPreviousBuilds;
