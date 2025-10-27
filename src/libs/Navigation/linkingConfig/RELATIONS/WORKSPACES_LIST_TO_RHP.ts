import type {DomainModalNavigatorParamList, WorkspaceDuplicateNavigatorParamList} from '@navigation/types';
import SCREENS from '@src/SCREENS';

const WORKSPACES_LIST_TO_RHP = {
    [SCREENS.WORKSPACES_LIST]: [SCREENS.WORKSPACE_DUPLICATE.SELECT_FEATURES, SCREENS.WORKSPACE_DUPLICATE.ROOT, SCREENS.DOMAIN.DOMAIN_VERIFIED, SCREENS.DOMAIN.VERIFY_DOMAIN] satisfies Array<
        keyof WorkspaceDuplicateNavigatorParamList | keyof DomainModalNavigatorParamList
    >,
} as Record<typeof SCREENS.WORKSPACES_LIST, string[]>;

export default WORKSPACES_LIST_TO_RHP;
