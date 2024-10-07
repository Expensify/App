import SEARCH_TO_RHP from './SEARCH_TO_RHP';
import SETTINGS_TO_RHP from './SETTINGS_TO_RHP';
import SIDEBAR_TO_RHP from './SIDEBAR_TO_RHP';
import SIDEBAR_TO_SPLIT from './SIDEBAR_TO_SPLIT';
import WORKSPACE_TO_RHP from './WORKSPACE_TO_RHP';

// @TODO: fix types
function createInverseRelation<T extends string, K extends string>(relations: Record<T, K[]>): Record<K, T> {
    const reversedRelations = {} as Record<K, T>;

    Object.entries(relations).forEach(([key, values]) => {
        const valuesWithType = values as K[];
        valuesWithType.forEach((value: K) => {
            reversedRelations[value] = key as T;
        });
    });
    return reversedRelations;
}

export default {
    SETTINGS_TO_RHP,
    RHP_TO_SETTINGS: createInverseRelation(SETTINGS_TO_RHP),
    RHP_TO_WORKSPACE: createInverseRelation(WORKSPACE_TO_RHP),
    RHP_TO_SIDEBAR: createInverseRelation(SIDEBAR_TO_RHP),
    SEARCH_TO_RHP,
    SIDEBAR_TO_RHP,
    WORKSPACE_TO_RHP,
    SIDEBAR_TO_SPLIT,
};
