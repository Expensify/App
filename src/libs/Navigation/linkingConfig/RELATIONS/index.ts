import FULLSCREEN_TO_TAB from './FULLSCREEN_TO_TAB';
import SEARCH_TO_RHP from './SEARCH_TO_RHP';
import SETTINGS_TO_RHP from './SETTINGS_TO_RHP';
import SIDEBAR_TO_RHP from './SIDEBAR_TO_RHP';
import SIDEBAR_TO_SPLIT from './SIDEBAR_TO_SPLIT';
import WORKSPACE_TO_RHP from './WORKSPACE_TO_RHP';

function createInverseRelation<T extends string, K extends string>(relations: Partial<Record<T, K | K[]>>): Record<K, T> {
    const reversedRelations = {} as Record<K, T>;

    Object.entries(relations).forEach(([key, values]) => {
        const valuesWithType = (Array.isArray(values) ? values : [values]) as K[];
        valuesWithType.forEach((value: K) => {
            reversedRelations[value] = key as T;
        });
    });
    return reversedRelations;
}

const RHP_TO_SETTINGS = createInverseRelation(SETTINGS_TO_RHP);
const RHP_TO_WORKSPACE = createInverseRelation(WORKSPACE_TO_RHP);
const RHP_TO_SIDEBAR = createInverseRelation(SIDEBAR_TO_RHP);
const SPLIT_TO_SIDEBAR = createInverseRelation(SIDEBAR_TO_SPLIT);

export {SETTINGS_TO_RHP, RHP_TO_SETTINGS, RHP_TO_WORKSPACE, RHP_TO_SIDEBAR, SEARCH_TO_RHP, SIDEBAR_TO_RHP, WORKSPACE_TO_RHP, SIDEBAR_TO_SPLIT, SPLIT_TO_SIDEBAR, FULLSCREEN_TO_TAB};
