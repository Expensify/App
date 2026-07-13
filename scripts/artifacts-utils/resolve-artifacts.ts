import parseCommandLineArguments from '../utils/parseCommandLineArguments';
import resolveArtifacts, {type Platform} from './lib/artifactsResolver';

/**
 * Thin CLI entry point around the shared artifacts resolver, invoked by the
 * native build systems (Gradle `ExpensiUtils.gradle` and iOS
 * `patched_ios_artifacts.rb`) which cannot import the TS module directly.
 *
 * Usage:
 *   tsx scripts/artifacts-utils/resolve-artifacts.ts \
 *       --platform=ios --package=react-hybrid --hybrid=true --new-dot-root=.
 *
 * Prints the resolution result as JSON to stdout (logs go to stderr). It always
 * exits 0 with a valid JSON payload — a failure resolves to `buildFromSource`.
 */
const args = parseCommandLineArguments();
const platform = args.platform as Platform;
const packageName = args.package ?? '';

resolveArtifacts({
    platform,
    packageName,
    newDotRoot: args['new-dot-root'] ?? '.',
    isHybrid: args.hybrid === 'true',
})
    .then((result) => process.stdout.write(JSON.stringify(result)))
    .catch(() => {
        // Never fail the build over resolution — fall back to building from source.
        process.stdout.write(JSON.stringify({buildFromSource: true, version: null, packageName, artifactId: ''}));
    });
