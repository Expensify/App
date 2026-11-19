import {expect, test} from 'bun:test';

/** Small Lottie archives must load as files because they have no data URL MIME type. */
import {createRsbuild} from '@rsbuild/core';
import {mkdtemp, readFile, readdir, rm} from 'fs/promises';
import {tmpdir} from 'os';
import path from 'path';

import {getSharedConfiguration} from '../../config/rsbuild/rsbuild.common';

test('emits small Lottie animations as resource files', async () => {
    // Given an animation smaller than Rsbuild's default inline limit
    const animationPath = path.resolve(import.meta.dir, '../../assets/animations/SparkleRotate.lottie');
    const animation = await readFile(animationPath);
    expect(animation.byteLength).toBeLessThan(4096);
    const outputPath = await mkdtemp(path.join(tmpdir(), 'lottie-assets-'));
    const shared = getSharedConfiguration({isDevServer: true});
    const configureRspack = shared.tools?.rspack;

    try {
        // When the app's shared web configuration bundles the animation
        const rsbuild = await createRsbuild({
            rsbuildConfig: {
                ...shared,
                source: {...shared.source, entry: {main: animationPath}},
                output: {distPath: {root: outputPath}},
                performance: {buildCache: false},
                tools: {
                    ...shared.tools,
                    rspack: async (config, utils) => {
                        const configured = typeof configureRspack === 'function' ? ((await configureRspack(config, utils)) ?? config) : config;
                        return {...configured, cache: false};
                    },
                },
            },
        });
        await rsbuild.build();

        // Then the player can fetch the unchanged archive instead of an unsupported data URL
        const files = await readdir(outputPath, {recursive: true});
        const animations = files.filter((file) => file.endsWith('.lottie'));
        expect(animations).toHaveLength(1);
        expect(await readFile(path.join(outputPath, animations.at(0) ?? ''))).toEqual(animation);
    } finally {
        await rm(outputPath, {recursive: true, force: true});
    }
});
