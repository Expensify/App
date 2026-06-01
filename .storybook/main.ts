import type {StorybookConfig} from '@storybook/react-webpack5';

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
    typescript: {
        // Extract prop documentation from TypeScript types so every story gets auto-generated controls and a prop table.
        reactDocgen: 'react-docgen-typescript',
        reactDocgenTypescriptOptions: {
            shouldExtractLiteralValuesFromEnum: true,
            shouldRemoveUndefinedFromOptional: true,
            // Only document a component's own props, not the hundreds inherited from node_modules (e.g. React Native View props).
            propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
        },
    },
};

export default main;
