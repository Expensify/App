/*
 * Bun bundler plugin that resolves App tsconfig path aliases for the victory-chart-renderer CLI bundle.
 */
import type {BunPlugin} from 'bun';
import {existsSync} from 'node:fs';
import {join, resolve} from 'node:path';

const ALIAS_ENTRIES = [
    ['@components/', 'src/components/'],
    ['@assets/', 'assets/'],
    ['@libs/', 'src/libs/'],
    ['@styles/', 'src/styles/'],
    ['@hooks/', 'src/hooks/'],
    ['@src/', 'src/'],
    ['@navigation/', 'src/libs/Navigation/'],
    ['@userActions/', 'src/libs/actions/'],
    ['@selectors/', 'src/selectors/'],
] as const;

export default function createAppPathAliasPlugin(repoRoot: string, stubRoot: string): BunPlugin {
    const resolvedRepoRoot = resolve(repoRoot);
    const logStub = resolve(stubRoot, 'expensify-log/index.ts');
    const activeSpansStub = resolve(stubRoot, 'telemetry-activeSpans/index.ts');

    return {
        name: 'victory-chart-renderer-app-aliases',
        setup(build) {
            build.onResolve({filter: /^@libs\/telemetry\/activeSpans$/}, () => ({
                path: activeSpansStub,
            }));

            build.onResolve({filter: /^@libs\/Log$/}, () => ({
                path: logStub,
            }));

            build.onResolve({filter: /^@(components|assets|libs|styles|hooks|src|navigation|userActions|selectors)\//}, (args) => {
                for (const [prefix, relativeTargetDir] of ALIAS_ENTRIES) {
                    if (!args.path.startsWith(prefix)) {
                        continue;
                    }

                    const relativePath = args.path.slice(prefix.length);
                    const targetDir = join(resolvedRepoRoot, relativeTargetDir);
                    const candidates = [
                        `${join(targetDir, relativePath)}.ts`,
                        `${join(targetDir, relativePath)}.tsx`,
                        join(targetDir, relativePath, 'index.ts'),
                        join(targetDir, relativePath, 'index.tsx'),
                    ];

                    for (const candidate of candidates) {
                        if (existsSync(candidate)) {
                            return {path: candidate};
                        }
                    }

                    return {path: join(targetDir, relativePath)};
                }

                return undefined;
            });
        },
    };
}
