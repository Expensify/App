// storybook/no-uninstalled-addons: every addon listed here has to be a real dependency
const config = {
    stories: ['../src/**/*.stories.tsx'],
    addons: ['@storybook/addon-not-installed-anywhere'],
};

export default config;
