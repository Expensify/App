import type {DynamicRouteSuffix, Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import combineDynamicRoutePathAndSuffix from './combineDynamicRoutePathAndSuffix';
import splitPathAndQuery from './splitPathAndQuery';

/**
 * Appends a registered dynamic suffix onto an explicit base path. Use when the active URL is not
 * the prefix you need (e.g. categories list + `imported` after stripping `import` from the import screen).
 */
export default function appendDynamicRouteSuffixToBasePath(basePath: string, suffix: DynamicRouteSuffix): Route {
    const normalizedBase = basePath.replace(/^\/+/, '');
    const [pathWithoutQuery] = splitPathAndQuery(normalizedBase);
    if (!pathWithoutQuery) {
        return ROUTES.HOME;
    }
    return combineDynamicRoutePathAndSuffix(normalizedBase, suffix);
}
