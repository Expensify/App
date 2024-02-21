module.exports = {
    framework: '@storybook/react-webpack5',
    stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: ['@storybook/addon-essentials', '@storybook/addon-a11y',
        {
            name: '@storybook/addon-react-native-web',
            options: {
                modulesToAlias: {
                    'react-native': 'react-native-web',
                },
                modulesToTranspile: ['@onfido/react-native-sdk', '@rnmapbox/maps', 'lottie-react-native', '@ua/react-native-airship'],
            },
        }
    ],
    staticDirs: ['./public', {from: '../assets/css', to: 'css'}, {from: '../assets/fonts/web', to: 'fonts'}],
    managerHead: (head) => `
        ${head}
        ${process.env.ENV === 'staging' ? '<meta name="robots" content="noindex">' : ''}
    `,
    core: {
        builder: 'webpack5',
    },
    docs: {
        autodocs: true
    },
};
