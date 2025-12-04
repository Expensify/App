import DOMAIN_TO_RHP from './DOMAIN_TO_RHP';
import SEARCH_TO_RHP from './SEARCH_TO_RHP';
import SETTINGS_TO_RHP from './SETTINGS_TO_RHP';
import SIDEBAR_TO_RHP from './SIDEBAR_TO_RHP';
import SIDEBAR_TO_SPLIT from './SIDEBAR_TO_SPLIT';
import TAB_TO_FULLSCREEN from './TAB_TO_FULLSCREEN';
import WORKSPACE_TO_RHP from './WORKSPACE_TO_RHP';
import WORKSPACES_LIST_TO_RHP from './WORKSPACES_LIST_TO_RHP';

/**
 * This module manages the relationships between different fullscreen navigators and screens in the app.
 * It defines how screens in fullscreen navigator relate to screens in another navigator, particularly
 * for handling RHP (Right Hand Panel) navigation.
 *
 * For detailed information about setting the correct screen underneath RHP,
 * see the NAVIGATION.md documentation.
 */
function createInverseRelation<T extends string, K extends string>(relations: Partial<Record<T, K | K[]>>): Record<K, T> {
    const reversedRelations = {} as Record<K, T>;

    for (const [key, values] of Object.entries(relations)) {
        const valuesWithType = (Array.isArray(values) ? values : [values]) as K[];
        // eslint-disable-next-line unicorn/no-array-for-each
        valuesWithType.forEach((value: K) => {
            reversedRelations[value] = key as T;
        });
    }
    return reversedRelations;
}

const RHP_TO_SETTINGS = createInverseRelation(SETTINGS_TO_RHP);
const RHP_TO_WORKSPACE = createInverseRelation(WORKSPACE_TO_RHP);
const RHP_TO_SIDEBAR = createInverseRelation(SIDEBAR_TO_RHP);
const SPLIT_TO_SIDEBAR = createInverseRelation(SIDEBAR_TO_SPLIT);
const RHP_TO_WORKSPACES_LIST = createInverseRelation(WORKSPACES_LIST_TO_RHP);
const RHP_TO_SEARCH = createInverseRelation(SEARCH_TO_RHP);
const FULLSCREEN_TO_TAB = createInverseRelation(TAB_TO_FULLSCREEN);
const RHP_TO_DOMAIN = createInverseRelation(DOMAIN_TO_RHP);

export {
    SETTINGS_TO_RHP,
    RHP_TO_SETTINGS,
    RHP_TO_WORKSPACE,
    RHP_TO_SIDEBAR,
    RHP_TO_SEARCH,
    SEARCH_TO_RHP,
    SIDEBAR_TO_RHP,
    WORKSPACE_TO_RHP,
    SIDEBAR_TO_SPLIT,
    SPLIT_TO_SIDEBAR,
    TAB_TO_FULLSCREEN,
    FULLSCREEN_TO_TAB,
    RHP_TO_WORKSPACES_LIST,
    RHP_TO_DOMAIN,
};
