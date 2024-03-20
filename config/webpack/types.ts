import type {Configuration} from 'webpack';

type EnvFile = {
    envFile?: string;
    platform?: 'web' | 'desktop';
};

type WebpackConfig = Configuration;

// eslint-disable-next-line import/prefer-default-export
export type {EnvFile, WebpackConfig};
