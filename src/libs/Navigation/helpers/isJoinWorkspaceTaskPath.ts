import {getSearchParamFromPath} from '@libs/Url';

import ROUTES from '@src/ROUTES';

const JOIN_WORKSPACE_TASK_PATHS = new Set<string>([ROUTES.ONBOARDING_WORK_EMAIL.route, ROUTES.ONBOARDING_WORK_EMAIL_VALIDATION.route, ROUTES.ONBOARDING_WORKSPACES.route]);

function getPathname(path: string) {
    return path.replace(/^\//, '').split(/[?#]/, 1).at(0) ?? '';
}

function hasJoinWorkspaceTaskParam(path: string) {
    return getSearchParamFromPath(path, 'isJoinWorkspaceTask') === 'true';
}

function isJoinWorkspaceTaskPath(path: string) {
    return JOIN_WORKSPACE_TASK_PATHS.has(getPathname(path)) && hasJoinWorkspaceTaskParam(path);
}

function isOnboardingPath(path: string) {
    const pathname = getPathname(path);
    return pathname === ROUTES.ONBOARDING_ROOT.route || pathname.startsWith(`${ROUTES.ONBOARDING_ROOT.route}/`);
}

export {hasJoinWorkspaceTaskParam, isOnboardingPath};
export default isJoinWorkspaceTaskPath;
