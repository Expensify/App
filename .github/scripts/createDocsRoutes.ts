import fs from 'fs';
import yaml from 'js-yaml';
import type {ValueOf} from 'type-fest';

type Article = {
    href: string;
    title: string;
    order?: number;
};

type Section = {
    href: string;
    title: string;
    articles?: Article[];
    sections?: Section[];
};

type Hub = {
    href: string;
    title: string;
    description: string;
    icon: string;
    articles?: Article[];
    sections?: Section[];
};

type Platform = {
    href: string;
    hubs: Hub[];
};

type DocsRoutes = {
    platforms: Platform[];
};

type HubEntriesKey = 'sections' | 'articles';

const warnMessage = (platform: string): string => `Number of hubs in _routes.yml does not match number of hubs in docs/${platform}/articles. Please update _routes.yml with hub info.`;
const disclaimer = '# This file is auto-generated. Do not edit it directly. Use npm run createDocsRoutes instead.\n';
const docsDir = `${process.cwd()}/docs`;
const routes = yaml.load(fs.readFileSync(`${docsDir}/_data/_routes.yml`, 'utf8')) as DocsRoutes;
const platformNames = {
    expensifyClassic: 'expensify-classic',
    newExpensify: 'new-expensify',
    travel: 'travel',
} as const;

/**
 * @param str - The string to convert to title case
 */
function toTitleCase(str: string): string {
    return str
        .split(' ')
        .map((word, index) => {
            if (index !== 0 && (word.toLowerCase() === 'a' || word.toLowerCase() === 'the' || word.toLowerCase() === 'and')) {
                return word.toLowerCase();
            }
            return word.charAt(0).toUpperCase() + word.substring(1);
        })
        .join(' ');
}

/**
 * @param filename - The name of the file
 * @param order - Optional order from front matter
 */
function getArticleObj(filename: string, order?: number): Article {
    const href = filename.replace('.md', '');
    return {
        href,
        title: toTitleCase(href.replaceAll('-', ' ')),
        order,
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
function pushOrCreateEntry<TKey extends HubEntriesKey>(hubs: Hub[], hub: string, key: TKey, entry: TKey extends 'sections' ? Section : Article) {
    const hubObj = hubs.find((obj) => obj.href === hub);

    if (!hubObj) {
        return;
    }

    if (hubObj[key]) {
        hubObj[key]?.push(entry);
    } else {
        hubObj[key] = [entry];
    }
}

function getOrderFromArticleFrontMatter(path: string): number | undefined {
    try {
        const frontmatter = fs.readFileSync(path, 'utf8').split('---').at(1);
        if (!frontmatter) {
            return undefined;
        }
        const frontmatterObject = yaml.load(frontmatter) as Record<string, unknown>;
        return frontmatterObject.order as number | undefined;
    } catch {
        return undefined;
    }
}

/**
 * Build a section from a directory path, with optional parent path for nested href
 */
function buildSection(platformName: string, hub: string, sectionPath: string, parentHref: string): Section {
    const sectionName = sectionPath.split('/').pop() ?? sectionPath;
    const fullPath = `${docsDir}/articles/${platformName}/${hub}/${sectionPath}`;
    const articles: Article[] = [];
    const childSections: Section[] = [];
    const href = parentHref ? `${parentHref}/${sectionName}` : sectionName;

    for (const entry of fs.readdirSync(fullPath)) {
        const entryPath = `${fullPath}/${entry}`;
        if (entry.endsWith('.md')) {
            const order = getOrderFromArticleFrontMatter(entryPath);
            articles.push(getArticleObj(entry, order));
        } else if (fs.statSync(entryPath).isDirectory()) {
            childSections.push(buildSection(platformName, hub, `${sectionPath}/${entry}`, href));
        }
    }

    const section: Section = {
        href,
        title: toTitleCase(sectionName.replaceAll('-', ' ')),
        ...(articles.length > 0 && {articles}),
        ...(childSections.length > 0 && {sections: childSections}),
    };
    return section;
}

/**
 * Flatten sections for lookup by full path (e.g. netsuite/troubleshooting/connection-errors)
 */
function flattenSections(sections: Section[]): Section[] {
    const result: Section[] = [];
    for (const s of sections) {
        result.push(s);
        if (s.sections?.length) {
            result.push(...flattenSections(s.sections));
        }
    }
    return result;
}

/**
 * Add articles and sections to hubs
 * @param hubs - The hubs inside docs/articles/ for a platform
 * @param platformName - Expensify Classic or New Expensify
 * @param routeHubs - The hubs inside docs/data/_routes.yml for a platform
 */
function createHubsWithArticles(hubs: string[], platformName: ValueOf<typeof platformNames>, routeHubs: Hub[]) {
    for (const hub of hubs) {
        const basePath = `${docsDir}/articles/${platformName}/${hub}`;

        for (const fileOrFolder of fs.readdirSync(basePath)) {
            if (fileOrFolder.endsWith('.md')) {
                const articleObj = getArticleObj(fileOrFolder);
                pushOrCreateEntry(routeHubs, hub, 'articles', articleObj);
                continue;
            }

            const sectionPath = fileOrFolder;
            const section = buildSection(platformName, hub, sectionPath, '');
            pushOrCreateEntry(routeHubs, hub, 'sections', section);
        }

        // Add flat section list for nested section page lookup
        const hubObj = routeHubs.find((obj) => obj.href === hub);
        if (hubObj?.sections?.length) {
            (hubObj as Hub & {flatSections?: Section[]}).flatSections = flattenSections(hubObj.sections);
        }
    }
}

function run() {
    const expensifyClassicArticleHubs = fs.readdirSync(`${docsDir}/articles/${platformNames.expensifyClassic}`);
    const newExpensifyArticleHubs = fs.readdirSync(`${docsDir}/articles/${platformNames.newExpensify}`);
    const travelArticleHubs = fs.readdirSync(`${docsDir}/articles/${platformNames.travel}`);

    const expensifyClassicRoute = routes.platforms.find((platform) => platform.href === platformNames.expensifyClassic);
    const newExpensifyRoute = routes.platforms.find((platform) => platform.href === platformNames.newExpensify);
    const travelRoute = routes.platforms.find((platform) => platform.href === platformNames.travel);

    if (expensifyClassicArticleHubs.length !== expensifyClassicRoute?.hubs.length) {
        console.error(warnMessage(platformNames.expensifyClassic));
        process.exit(1);
    }

    if (newExpensifyArticleHubs.length !== newExpensifyRoute?.hubs.length) {
        console.error(warnMessage(platformNames.newExpensify));
        process.exit(1);
    }

    if (travelArticleHubs.length !== travelRoute?.hubs.length) {
        console.error(warnMessage(platformNames.travel));
        process.exit(1);
    }

    createHubsWithArticles(expensifyClassicArticleHubs, platformNames.expensifyClassic, expensifyClassicRoute.hubs);
    createHubsWithArticles(newExpensifyArticleHubs, platformNames.newExpensify, newExpensifyRoute.hubs);
    createHubsWithArticles(travelArticleHubs, platformNames.travel, travelRoute.hubs);

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
