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
        {from: '../assets/css', to: 'css'},
        {from: '../assets/fonts/web', to: 'fonts'},
    ],
    core: {
        builder: 'webpack5',
    },
};
