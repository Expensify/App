const yaml = require('js-yaml');
const fs = require('fs');
const _ = require('underscore');

const warn = 'Number of hubs in _routes.yml does not match number of hubs in docs/articles. Please update _routes.yml with hub info.';
const disclaimer = '# This file is auto-generated. Do not edit it directly. Use npm run createDocsRoutes instead.\n';
const docsDir = `${process.cwd()}/docs`;
const routes = yaml.load(fs.readFileSync(`${docsDir}/_data/_routes.yml`, 'utf8'));

/**
 * @param {String} str - The string to convert to title case
 * @returns {String}
 */
function toTitleCase(str) {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
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
 * If the articlea / sections exist in the hub, then push the entry to the array.
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

function run() {
    const hubs = fs.readdirSync(`${docsDir}/articles`);
    if (hubs.length !== routes.hubs.length) {
        // If new hubs have been added without metadata addition to _routes.yml
        console.error(warn);
        process.exit(1);
    }
    _.each(hubs, (hub) => {
        // Iterate through each directory in articles
        fs.readdirSync(`${docsDir}/articles/${hub}`).forEach((fileOrFolder) => {
            // If the directory content is a markdown file, then it is an article
            if (fileOrFolder.endsWith('.md')) {
                const articleObj = getArticleObj(fileOrFolder);
                pushOrCreateEntry(routes.hubs, hub, 'articles', articleObj);
                return;
            }

            // For readability, we will use the term section to refer to subfolders
            const section = fileOrFolder;
            const articles = [];

            // Each subfolder will be a section containing articles
            fs.readdirSync(`${docsDir}/articles/${hub}/${section}`).forEach((subArticle) => {
                articles.push(getArticleObj(subArticle));
            });

            pushOrCreateEntry(routes.hubs, hub, 'sections', {
                href: section,
                title: toTitleCase(section.replaceAll('-', ' ')),
                articles,
            });
        });
    });

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
