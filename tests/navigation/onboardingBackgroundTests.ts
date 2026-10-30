import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';

import NAVIGATORS from '@src/NAVIGATORS';

function getBackgroundFullScreenName(path: string): string | undefined {
    const state = getAdaptedStateFromPath(path, undefined);
    const tabRoute = state?.routes?.findLast((route) => route.name === NAVIGATORS.TAB_NAVIGATOR);
    const tabState = tabRoute?.state;
    return tabState?.routes?.at(tabState.index ?? (tabState.routes?.length ?? 1) - 1)?.name;
}

describe('onboarding background on a fresh load', () => {
    it('restores the report behind a join-workspace code screen', () => {
        expect(getBackgroundFullScreenName('/onboarding/private-domain?isJoinWorkspaceTask=true&reportID=add-work-email-task-report')).toBe(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
    });
});
