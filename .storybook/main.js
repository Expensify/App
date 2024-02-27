module.exports = {
    framework: '@storybook/react-webpack5',
    core: {
        builder: {
            name: '@storybook/builder-webpack5',
        },
    },
    stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: ['@storybook/addon-essentials', '@storybook/addon-a11y',
        {
            name: '@storybook/addon-react-native-web',
            options: {
                modulesToTranspile: ['@onfido/react-native-sdk', '@rnmapbox/maps', '@ua/react-native-airship'],
                babelPlugins: [
                    "@babel/plugin-transform-class-properties",
                    "@babel/plugin-transform-private-methods",
                    "@babel/plugin-transform-private-property-in-object",
                ],
            },
        }
    ],
    staticDirs: ['./public', {from: '../assets/css', to: 'css'}, {from: '../assets/fonts/web', to: 'fonts'}],
    managerHead: (head) => `
        ${head}
        ${process.env.ENV === 'staging' ? '<meta name="robots" content="noindex">' : ''}
    `,
    docs: {
        autodocs: true
    },
};
