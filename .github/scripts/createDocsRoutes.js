const yaml = require('js-yaml');
const fs = require('fs');
const _ = require('underscore');

const warnMessage = (platform) => `Number of hubs in _routes.yml does not match number of hubs in docs/${platform}/articles. Please update _routes.yml with hub info.`;
const disclaimer = '# This file is auto-generated. Do not edit it directly. Use npm run createDocsRoutes instead.\n';
const docsDir = `${process.cwd()}/docs`;
const routes = yaml.load(fs.readFileSync(`${docsDir}/_data/_routes.yml`, 'utf8'));
const platformNames = {
    expensifyClassic: 'expensify-classic',
    newExpensify: 'new-expensify',
};

/**
 * @param {String} str - The string to convert to title case
 * @returns {String}
 */
function toTitleCase(str) {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1));
}

/**
 * @param {String} filename - The name of the file
 * @returns {Object}
 */
function getArticleObj(filename) {
    const href = filename.replace('.md', '');
    return {
        href,
        title: toTitleCase(href.replaceAll('-', ' ')),
    };
}

/**
 * If the article / sections exist in the hub, then push the entry to the array.
 * Otherwise, create the array and push the entry to it.
 * @param {*} hubs - The hubs array
 * @param {*} hub - The hub we are iterating
 * @param {*} key - If we want to push sections / articles
 * @param {*} entry - The article / section to push
 */
function pushOrCreateEntry(hubs, hub, key, entry) {
    const hubObj = _.find(hubs, (obj) => obj.href === hub);
    if (hubObj[key]) {
        hubObj[key].push(entry);
    } else {
        hubObj[key] = [entry];
    }
}

/**
 * Add articles and sections to hubs
 * @param {Array} hubs - The hubs inside docs/articles/ for a platform
 * @param {String} platformName - Expensify Classic or New Expensify
 * @param {Array} routeHubs - The hubs insude docs/data/_routes.yml for a platform
 */
function createHubsWithArticles(hubs, platformName, routeHubs) {
    _.each(hubs, (hub) => {
        // Iterate through each directory in articles
        fs.readdirSync(`${docsDir}/articles/${platformName}/${hub}`).forEach((fileOrFolder) => {
            // If the directory content is a markdown file, then it is an article
            if (fileOrFolder.endsWith('.md')) {
                const articleObj = getArticleObj(fileOrFolder);
                pushOrCreateEntry(routeHubs, hub, 'articles', articleObj);
                return;
            }

            // For readability, we will use the term section to refer to subfolders
            const section = fileOrFolder;
            const articles = [];

            // Each subfolder will be a section containing articles
            fs.readdirSync(`${docsDir}/articles/${platformName}/${hub}/${section}`).forEach((subArticle) => {
                articles.push(getArticleObj(subArticle));
            });

            pushOrCreateEntry(routeHubs, hub, 'sections', {
                href: section,
                title: toTitleCase(section.replaceAll('-', ' ')),
                articles,
            });
        });
    });
}

function run() {
    const expensifyClassicArticleHubs = fs.readdirSync(`${docsDir}/articles/${platformNames.expensifyClassic}`);
    const newExpensifyArticleHubs = fs.readdirSync(`${docsDir}/articles/${platformNames.newExpensify}`);

    const expensifyClassicRoute = _.find(routes.platforms, (platform) => platform.href === platformNames.expensifyClassic);
    const newExpensifyRoute = _.find(routes.platforms, (platform) => platform.href === platformNames.newExpensify);

    if (expensifyClassicArticleHubs.length !== expensifyClassicRoute.hubs.length) {
        console.error(warnMessage(platformNames.expensifyClassic));
        process.exit(1);
    }

    if (newExpensifyArticleHubs.length !== newExpensifyRoute.hubs.length) {
        console.error(warnMessage(platformNames.newExpensify));
        process.exit(1);
    }

    createHubsWithArticles(expensifyClassicArticleHubs, platformNames.expensifyClassic, expensifyClassicRoute.hubs);
    createHubsWithArticles(newExpensifyArticleHubs, platformNames.newExpensify, newExpensifyRoute.hubs);

    // Convert the object to YAML and write it to the file
    let yamlString = yaml.dump(routes);
    yamlString = disclaimer + yamlString;
    fs.writeFileSync(`${docsDir}/_data/routes.yml`, yamlString);
}

try {
    run();
} catch (error) {
    console.error('A problem occurred while trying to read the directories.', error);
    process.exit(1);
}
