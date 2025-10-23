import type {DomainModalNavigatorParamList, WorkspaceDuplicateNavigatorParamList} from '@navigation/types';
import SCREENS from '@src/SCREENS';

const WORKSPACES_LIST_TO_RHP: Partial<Record<keyof WorkspaceDuplicateNavigatorParamList | keyof DomainModalNavigatorParamList, string[]>> = {
    [SCREENS.WORKSPACE_DUPLICATE.ROOT]: [SCREENS.WORKSPACE_DUPLICATE.SELECT_FEATURES, SCREENS.WORKSPACE_DUPLICATE.ROOT],
    [SCREENS.DOMAIN.VERIFY_DOMAIN]: [SCREENS.DOMAIN.DOMAIN_VERIFIED, SCREENS.DOMAIN.VERIFY_DOMAIN],
};

export default WORKSPACES_LIST_TO_RHP;
