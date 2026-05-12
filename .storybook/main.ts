import type {StorybookConfig} from 'storybook/internal/types';

const main: StorybookConfig = {
    stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: ['@storybook/addon-a11y', '@storybook/addon-webpack5-compiler-babel', '@storybook/addon-docs'],
    staticDirs: ['./public', {from: '../assets/css', to: 'css'}, {from: '../assets/fonts/web', to: 'fonts'}],
    core: {},

    managerHead: (head) => `
        ${head}
        ${process.env.ENV === 'staging' ? '<meta name="robots" content="noindex">' : ''}
    `,
    framework: {
        name: '@storybook/react-webpack5',
        options: {},
    },
    docs: {},
};

export default main;
