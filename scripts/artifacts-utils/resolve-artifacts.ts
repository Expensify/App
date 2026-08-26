import type {SourceBuild} from './lib/artifactsResolver';

import parseCommandLineArguments from '../utils/parseCommandLineArguments';
import resolveArtifacts from './lib/artifactsResolver';

/**
 * CLI wrapper around the shared artifacts resolver for the native build systems
 * (Gradle and `patched_ios_artifacts.rb`), which cannot import the TS module.
 *
 * Usage:
 *   bun scripts/artifacts-utils/resolve-artifacts.ts \
 *       --platform=ios --package=react-hybrid --hybrid=true --new-dot-root=.
 *
 * Prints the result as JSON to stdout (logs go to stderr) and always exits 0.
 */
const args = parseCommandLineArguments();
const platform = args.platform;
const packageName = args.package ?? '';

if (platform !== 'ios' && platform !== 'android') {
    const reason = `Invalid or missing --platform "${platform ?? ''}" (expected "ios" or "android").`;
    process.stderr.write(`[PatchedArtifacts] ${reason} Building from source.\n`);
    process.stdout.write(JSON.stringify({buildFromSource: true, version: null, packageName, artifactId: '', reason} satisfies SourceBuild));
    process.exit(0);
}

const options = {packageName, newDotRoot: args['new-dot-root'] ?? '.', isHybrid: args.hybrid === 'true'};
const resolution = platform === 'ios' ? resolveArtifacts({...options, platform: 'ios'}) : resolveArtifacts({...options, platform: 'android'});

resolution
    .then((result) => process.stdout.write(JSON.stringify(result)))
    .catch((error: unknown) => {
        const reason = `The resolver rejected unexpectedly: ${error instanceof Error ? error.message : String(error)}`;
        process.stdout.write(JSON.stringify({buildFromSource: true, version: null, packageName, artifactId: '', reason} satisfies SourceBuild));
    });
