const path = require('path');

/**
 * Rewrites the App's Navigation module for Storybook so navigate and goBack land on the story's route stack.
 * A loader is used because `@libs` is a prefix alias that no alias entry for a single module can outrank.
 */
module.exports = function navigationStoryLoader(source) {
    const routerPath = JSON.stringify(path.resolve(__dirname, './storyRouter.tsx'));
    const renamed = source.replace(/export default \{/, 'const navigationForStorybook = {');
    return `import {withStoryRouter} from ${routerPath};\n${renamed}\nexport default withStoryRouter(navigationForStorybook);\n`;
};
