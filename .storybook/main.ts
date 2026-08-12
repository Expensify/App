import type {StorybookConfig} from 'storybook-react-rsbuild';

// Storybook 10 loads TS files directly and requires .ts extension for ESM imports
// @ts-expect-error -- Can't use .ts extensions without allowImportingTsExtensions in tsconfig
import rsbuildFinal from './rsbuild.config.ts';

const main: StorybookConfig = {
    stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
    staticDirs: ['./public', {from: '../assets/css', to: 'css'}, {from: '../assets/fonts/web', to: 'fonts'}],
    core: {},

    managerHead: (head) => `
        ${head}
        ${process.env.ENV === 'staging' ? '<meta name="robots" content="noindex">' : ''}
    `,
    framework: {
        name: 'storybook-react-rsbuild',
        options: {},
    },
    rsbuildFinal,
    docs: {},
    typescript: {
        reactDocgen: false,
    },
};

export default main;
