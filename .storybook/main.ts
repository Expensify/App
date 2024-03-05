type Dir = {
    from: string;
    to: string;
};

type Main = {
    stories: string[];
    addons: string[];
    staticDirs: Array<string | Dir>;
    core: {
        builder: string;
    };
    managerHead: (head: string) => string;
};

const main: Main = {
    stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: ['@storybook/addon-essentials', '@storybook/addon-a11y', '@storybook/addon-react-native-web'],
    staticDirs: ['./public', {from: '../assets/css', to: 'css'}, {from: '../assets/fonts/web', to: 'fonts'}],
    core: {
        builder: 'webpack5',
    },
    managerHead: (head: string) => `
        ${head}
        ${process.env.ENV === 'staging' ? '<meta name="robots" content="noindex">' : ''}
    `,
};

export default main;
