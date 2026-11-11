import {describe, expect, it} from 'bun:test';

import {readFileSync} from 'fs';
import {fileURLToPath} from 'url';

import findLostCacheGuards from '../../scripts/utils/findLostCacheGuards';

const rolePagePath = fileURLToPath(new URL('../../src/pages/workspace/members/WorkspaceMemberDetailsRolePage.tsx', import.meta.url));
const sharedRouteDeclaration = '    const memberDetailsRoute = ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, routeAccountID);\n';

// The hook input must not prevent caching the shared route and the handler used by the rendered role list.
const cachedRolePage = `
import {useSingleExecution, useRedirectSubmitWorkspaceFeatureUpgrade, ROUTES, Navigation, RoleList} from './dependencies';
function WorkspaceMemberDetailsRolePage({policyID, routeAccountID}) {
    const {singleExecution} = useSingleExecution();
    useRedirectSubmitWorkspaceFeatureUpgrade({backTo: ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, routeAccountID)});
${sharedRouteDeclaration}
    const saveRole = () => Navigation.goBack(memberDetailsRoute);
    return <RoleList navigateBackTo={memberDetailsRoute} onConfirm={singleExecution(saveRole)} />;
}
`;

describe('Workspace member Role compiler caching', () => {
    it('detects the original route and Save-handler caching regression', () => {
        // Given the shared route is moved before the final hook and also used as that hook's input
        const uncachedRolePage = cachedRolePage
            .replace(sharedRouteDeclaration, '')
            .replace('    useRedirectSubmitWorkspaceFeatureUpgrade(', `${sharedRouteDeclaration}    useRedirectSubmitWorkspaceFeatureUpgrade(`)
            .replace('backTo: ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, routeAccountID)', 'backTo: memberDetailsRoute');

        // When the actual compiler compares this arrangement with the cached reference
        const lostGuards = findLostCacheGuards(cachedRolePage, uncachedRolePage, rolePagePath);

        // Then the reference demonstrably requires both cache guards, so the production assertion cannot pass vacuously
        expect(lostGuards).toEqual([
            {functionName: 'WorkspaceMemberDetailsRolePage', call: 'ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute'},
            {functionName: 'WorkspaceMemberDetailsRolePage', call: 'singleExecution'},
        ]);
    });

    it('preserves the route and Save-handler cache guards in the production page', () => {
        // Given the actual Role page, including its member resolution, permission guards and conditional return
        const source = readFileSync(rolePagePath, 'utf8');

        // When the same compiler analysis used by CI compares it with the cached reference
        const lostGuards = findLostCacheGuards(cachedRolePage, source, rolePagePath);

        // Then production preserves both guards instead of merely compiling successfully
        expect(lostGuards).toEqual([]);
    });
});
