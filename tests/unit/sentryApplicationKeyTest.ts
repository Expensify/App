import fs from 'fs';
import path from 'path';

/**
 * Guard for the one seam `thirdPartyErrorFilterIntegration` cannot check itself.
 *
 * `@sentry/webpack-plugin` stamps every chunk with an application key at build time, and the integration
 * treats any frame that does not carry that key as third-party. The two halves live in different worlds
 * (build config and app source) and can only agree by literal string, so a rename on one side would leave
 * the integration tagging `third_party_code` on every error we report instead of failing loudly.
 */
const BUILD_CONFIG = path.join(__dirname, '..', '..', 'config', 'rsbuild', 'rsbuild.common.ts');
const INTEGRATIONS = path.join(__dirname, '..', '..', 'src', 'libs', 'telemetry', 'integrations', 'index.web.ts');

function readMatch(file: string, pattern: RegExp): string | undefined {
    return pattern.exec(fs.readFileSync(file, 'utf8'))?.[1];
}

describe('Sentry application key', () => {
    it('is the same string in the bundler plugin and in the third-party error filter', () => {
        const stampedByBundler = readMatch(BUILD_CONFIG, /applicationKey:\s*'([^']+)'/);
        const expectedAtRuntime = readMatch(INTEGRATIONS, /filterKeys:\s*\[\s*'([^']+)'/);

        expect(stampedByBundler).toBeDefined();
        expect(expectedAtRuntime).toBe(stampedByBundler);
    });
});
