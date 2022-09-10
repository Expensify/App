module.exports = {
    stories: [
        '../src/**/*.stories.mdx',
        '../src/**/*.stories.@(js|jsx|ts|tsx)',
    ],
    addons: [
        '@storybook/addon-essentials',
        '@storybook/addon-a11y',
        '@storybook/addon-react-native-web',
    ],
    staticDirs: [
        './public',
        '../assets/css',
    ],
    core: {
        builder: 'webpack5',
    },
};
