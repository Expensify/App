"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var js_yaml_1 = require("js-yaml");
var warnMessage = function (platform) { return "Number of hubs in _routes.yml does not match number of hubs in docs/".concat(platform, "/articles. Please update _routes.yml with hub info."); };
var disclaimer = '# This file is auto-generated. Do not edit it directly. Use npm run createDocsRoutes instead.\n';
var docsDir = "".concat(process.cwd(), "/docs");
var routes = js_yaml_1.default.load(fs_1.default.readFileSync("".concat(docsDir, "/_data/_routes.yml"), 'utf8'));
var platformNames = {
    expensifyClassic: 'expensify-classic',
    newExpensify: 'new-expensify',
};
/**
 * @param str - The string to convert to title case
 */
function toTitleCase(str) {
    return str
        .split(' ')
        .map(function (word, index) {
        if (index !== 0 && (word.toLowerCase() === 'a' || word.toLowerCase() === 'the' || word.toLowerCase() === 'and')) {
            return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.substring(1);
    })
        .join(' ');
}
/**
 * @param filename - The name of the file
 */
function getArticleObj(filename, order) {
    var href = filename.replace('.md', '');
    return {
        href: href,
        title: toTitleCase(href.replaceAll('-', ' ')),
        order: order,
    };
}
/**
 * If the article / sections exist in the hub, then push the entry to the array.
 * Otherwise, create the array and push the entry to it.
 * @param hubs - The hubs array
 * @param hub - The hub we are iterating
 * @param key - If we want to push sections / articles
 * @param entry - The article / section to push
 */
function pushOrCreateEntry(hubs, hub, key, entry) {
    var _a;
    var hubObj = hubs.find(function (obj) { return obj.href === hub; });
    if (!hubObj) {
        return;
    }
    if (hubObj[key]) {
        (_a = hubObj[key]) === null || _a === void 0 ? void 0 : _a.push(entry);
    }
    else {
        hubObj[key] = [entry];
    }
}
function getOrderFromArticleFrontMatter(path) {
    var frontmatter = fs_1.default.readFileSync(path, 'utf8').split('---').at(1);
    if (!frontmatter) {
        return;
    }
    var frontmatterObject = js_yaml_1.default.load(frontmatter);
    return frontmatterObject.order;
}
/**
 * Add articles and sections to hubs
 * @param hubs - The hubs inside docs/articles/ for a platform
 * @param platformName - Expensify Classic or New Expensify
 * @param routeHubs - The hubs insude docs/data/_routes.yml for a platform
 */
function createHubsWithArticles(hubs, platformName, routeHubs) {
    hubs.forEach(function (hub) {
        // Iterate through each directory in articles
        fs_1.default.readdirSync("".concat(docsDir, "/articles/").concat(platformName, "/").concat(hub)).forEach(function (fileOrFolder) {
            // If the directory content is a markdown file, then it is an article
            if (fileOrFolder.endsWith('.md')) {
                var articleObj = getArticleObj(fileOrFolder);
                pushOrCreateEntry(routeHubs, hub, 'articles', articleObj);
                return;
            }
            // For readability, we will use the term section to refer to subfolders
            var section = fileOrFolder;
            var articles = [];
            // Each subfolder will be a section containing articles
            fs_1.default.readdirSync("".concat(docsDir, "/articles/").concat(platformName, "/").concat(hub, "/").concat(section)).forEach(function (subArticle) {
                var order = getOrderFromArticleFrontMatter("".concat(docsDir, "/articles/").concat(platformName, "/").concat(hub, "/").concat(section, "/").concat(subArticle));
                articles.push(getArticleObj(subArticle, order));
            });
            pushOrCreateEntry(routeHubs, hub, 'sections', {
                href: section,
                title: toTitleCase(section.replaceAll('-', ' ')),
                articles: articles,
            });
        });
    });
}
function run() {
    var expensifyClassicArticleHubs = fs_1.default.readdirSync("".concat(docsDir, "/articles/").concat(platformNames.expensifyClassic));
    var newExpensifyArticleHubs = fs_1.default.readdirSync("".concat(docsDir, "/articles/").concat(platformNames.newExpensify));
    var expensifyClassicRoute = routes.platforms.find(function (platform) { return platform.href === platformNames.expensifyClassic; });
    var newExpensifyRoute = routes.platforms.find(function (platform) { return platform.href === platformNames.newExpensify; });
    if (expensifyClassicArticleHubs.length !== (expensifyClassicRoute === null || expensifyClassicRoute === void 0 ? void 0 : expensifyClassicRoute.hubs.length)) {
        console.error(warnMessage(platformNames.expensifyClassic));
        process.exit(1);
    }
    if (newExpensifyArticleHubs.length !== (newExpensifyRoute === null || newExpensifyRoute === void 0 ? void 0 : newExpensifyRoute.hubs.length)) {
        console.error(warnMessage(platformNames.newExpensify));
        process.exit(1);
    }
    createHubsWithArticles(expensifyClassicArticleHubs, platformNames.expensifyClassic, expensifyClassicRoute.hubs);
    createHubsWithArticles(newExpensifyArticleHubs, platformNames.newExpensify, newExpensifyRoute.hubs);
    // Convert the object to YAML and write it to the file
    var yamlString = js_yaml_1.default.dump(routes);
    yamlString = disclaimer + yamlString;
    fs_1.default.writeFileSync("".concat(docsDir, "/_data/routes.yml"), yamlString);
}
try {
    run();
}
catch (error) {
    console.error('A problem occurred while trying to read the directories.', error);
    process.exit(1);
}
