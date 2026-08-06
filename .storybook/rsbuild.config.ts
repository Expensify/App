import type {RsbuildConfig} from '@rsbuild/core';

import {mergeRsbuildConfig} from '@rsbuild/core';

// Storybook 10 loads TS files directly and requires .ts extension for ESM imports
// @ts-expect-error -- Can't use .ts extensions without allowImportingTsExtensions in tsconfig
import mockPaths from './mockPaths.ts';

let envFile: string;
switch (process.env.ENV) {
    case 'production':
        envFile = '.env.production';
        break;
    case 'staging':
        envFile = '.env.staging';
        break;
    default:
        envFile = '.env';
}

const rsbuildFinal = async (config: RsbuildConfig): Promise<RsbuildConfig> => {
    // Storybook 10 loads TS files directly and requires .ts extension for ESM imports
    // @ts-expect-error -- Can't use .ts extensions without allowImportingTsExtensions in tsconfig
    const {getSharedConfiguration} = await import('../config/rsbuild/rsbuild.common.ts');
    const shared: RsbuildConfig = getSharedConfiguration({file: envFile, platform: 'web'});

    return mergeRsbuildConfig(shared, config, {
        resolve: {
            // `react-native-config`/`react-native$` are intentionally not repeated here since
            // they're already set in `shared.resolve.alias` and `mergeRsbuildConfig` keeps both.
            alias: mockPaths,
        },
    });
};

export default rsbuildFinal;
