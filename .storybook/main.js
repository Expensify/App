module.exports = {
    framework: '@storybook/react-webpack5',
    core: {
        builder: {
            name: '@storybook/builder-webpack5',
            options: {
                lazyCompilation: true,
            },
        },
    },
    stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: ['@storybook/addon-essentials', '@storybook/addon-a11y', '@storybook/addon-react-native-web'],
    staticDirs: ['./public', {from: '../assets/css', to: 'css'}, {from: '../assets/fonts/web', to: 'fonts'}],
    managerHead: (head) => `
        ${head}
        ${process.env.ENV === 'staging' ? '<meta name="robots" content="noindex">' : ''}
    `,
    docs: {
        autodocs: true
    },
};
