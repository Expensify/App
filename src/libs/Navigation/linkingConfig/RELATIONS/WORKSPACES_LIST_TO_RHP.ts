import type {WorkspaceDuplicateNavigatorParamList} from '@navigation/types';
import SCREENS from '@src/SCREENS';

const WORKSPACES_LIST_TO_RHP: Partial<Record<keyof WorkspaceDuplicateNavigatorParamList, string[]>> = {
    [SCREENS.WORKSPACE_DUPLICATE.ROOT]: [SCREENS.WORKSPACE_DUPLICATE.SELECT_FEATURES, SCREENS.WORKSPACE_DUPLICATE.ROOT],
};

export default WORKSPACES_LIST_TO_RHP;
