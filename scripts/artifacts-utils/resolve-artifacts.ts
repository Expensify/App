import parseCommandLineArguments from '../utils/parseCommandLineArguments';
import resolveArtifacts from './lib/artifactsResolver';

/**
 * CLI wrapper around the shared artifacts resolver for the native build systems
 * (Gradle and `patched_ios_artifacts.rb`), which cannot import the TS module.
 *
 * Usage:
 *   bun scripts/artifacts-utils/resolve-artifacts.ts \
 *       --platform=ios --hybrid=true --new-dot-root=.
 *
 * Prints the result as JSON to stdout (logs go to stderr) and always exits 0.
 */
const args = parseCommandLineArguments();
const platform = args.platform;
const isHybrid = args.hybrid === 'true';
const packageName = isHybrid ? 'react-hybrid' : 'react-standalone';

if (platform !== 'ios' && platform !== 'android') {
    process.stderr.write(`[PatchedArtifacts] Invalid or missing --platform "${platform ?? ''}" (expected "ios" or "android"); building from source.\n`);
    process.stdout.write(JSON.stringify({buildFromSource: true, version: null, packageName, artifactId: ''}));
    process.exit(0);
}

const options = {packageName, newDotRoot: args['new-dot-root'] ?? '.', isHybrid};
const resolution = platform === 'ios' ? resolveArtifacts({...options, platform: 'ios'}) : resolveArtifacts({...options, platform: 'android'});

resolution
    .then((result) => process.stdout.write(JSON.stringify(result)))
    .catch(() => {
        process.stdout.write(JSON.stringify({buildFromSource: true, version: null, packageName, artifactId: ''}));
    });
