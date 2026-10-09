import {describe, expect, it} from 'bun:test';

import {isRecord} from '@libs/ObjectUtils';

import {ESLint, Linter} from 'eslint';
import {fileURLToPath} from 'node:url';

const projectRoot = fileURLToPath(new URL('../..', import.meta.url));

/** A plugin is an object of optional members, so a record of objects is what the plugins of a config are. */
function isPluginRecord(value: unknown): value is NonNullable<Linter.Config['plugins']> {
    return isRecord(value) && Object.values(value).every(isRecord);
}

/** The parts of an effective config a rule needs to run on its own: the plugins it comes from and the settings it reads. */
function pickPluginsAndSettings(config: unknown): Required<Pick<Linter.Config, 'plugins' | 'settings'>> {
    if (!isRecord(config) || !isPluginRecord(config.plugins) || !isRecord(config.settings)) {
        throw new Error('The effective config resolves without plugins or settings.');
    }
    return {plugins: config.plugins, settings: config.settings};
}

describe('ESLint configuration', () => {
    it('checks the dependencies of useScreenActivityEffect like useEffect', async () => {
        // Given the effective repository config for a hook file and the React Hooks plugin it resolves
        const eslint = new ESLint({cwd: projectRoot});
        const config: unknown = await eslint.calculateConfigForFile('src/hooks/useScreenActivityEffect.ts');
        const {plugins, settings} = pickPluginsAndSettings(config);

        expect(plugins['react-hooks']).toBeDefined();
        expect(settings['react-hooks']).toEqual({additionalEffectHooks: '(useScreenActivityEffect)'});

        // When exhaustive-deps checks a call site which omits one reactive value from its dependency list
        const messages = new Linter({configType: 'flat'}).verify(
            `function Probe(value) {
                useScreenActivityEffect(() => console.log(value), []);
            }`,
            [
                {
                    languageOptions: {ecmaVersion: 2022, sourceType: 'module'},
                    plugins,
                    settings,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    rules: {'react-hooks/exhaustive-deps': 'error'},
                },
            ],
        );

        // Then the custom hook reports the same missing dependency that useEffect would report
        expect(messages).toHaveLength(1);
        expect(messages.at(0)?.ruleId).toBe('react-hooks/exhaustive-deps');
        expect(messages.at(0)?.message).toContain("missing dependency: 'value'");
    });
});
