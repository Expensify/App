import getReusableReportsTabStateKey from '@components/Navigation/NavigationTabBar/getReusableReportsTabStateKey';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {NavigationState, PartialState} from '@react-navigation/native';

type BuildRootStateOptions = {
    tabStateKey?: string;
    reportID?: string;
    reportActionID?: string;
    includeReportsState?: boolean;
    olderTabStateKey?: string;
};

function buildRootState({
    tabStateKey = 'tab-state',
    reportID = '123',
    reportActionID,
    includeReportsState = true,
    olderTabStateKey,
}: BuildRootStateOptions = {}): PartialState<NavigationState> {
    const reportsRoute = {
        key: 'reports-route',
        name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
        ...(includeReportsState
            ? {
                  state: {
                      key: 'reports-state',
                      index: 1,
                      routes: [
                          {key: 'inbox-route', name: SCREENS.INBOX},
                          {key: 'report-route', name: SCREENS.REPORT, params: {reportID, ...(reportActionID ? {reportActionID} : {})}},
                      ],
                  },
              }
            : {}),
    };
    const tabRoute = {
        key: `${tabStateKey}-route`,
        name: NAVIGATORS.TAB_NAVIGATOR,
        state: {
            key: tabStateKey,
            index: 1,
            routes: [{key: 'home-route', name: SCREENS.HOME}, reportsRoute],
        },
    };
    const routes = olderTabStateKey
        ? [
              {
                  key: `${olderTabStateKey}-route`,
                  name: NAVIGATORS.TAB_NAVIGATOR,
                  state: {key: olderTabStateKey, index: 0, routes: [{key: 'older-home-route', name: SCREENS.HOME}]},
              },
              tabRoute,
          ]
        : [tabRoute];

    return {key: 'root-state', index: routes.length - 1, routes} satisfies PartialState<NavigationState>;
}

describe('getReusableReportsTabStateKey', () => {
    it('returns the active tab state key for the preserved report', () => {
        expect(getReusableReportsTabStateKey(buildRootState(), '123', undefined, false)).toBe('tab-state');
    });

    it('uses the newest tab navigator instance', () => {
        expect(getReusableReportsTabStateKey(buildRootState({olderTabStateKey: 'older-tab'}), '123', undefined, false)).toBe('tab-state');
    });

    it('returns the tab state key when the report action still exists', () => {
        expect(getReusableReportsTabStateKey(buildRootState({reportActionID: '456'}), '123', '456', true)).toBe('tab-state');
    });

    it('does not reuse the tab when the report action was removed', () => {
        expect(getReusableReportsTabStateKey(buildRootState({reportActionID: '456'}), '123', '456', false)).toBeUndefined();
    });

    it('does not reuse a different report', () => {
        expect(getReusableReportsTabStateKey(buildRootState({reportID: '999'}), '123', undefined, false)).toBeUndefined();
    });

    it('does not reuse an uninitialized reports navigator', () => {
        expect(getReusableReportsTabStateKey(buildRootState({includeReportsState: false}), '123', undefined, false)).toBeUndefined();
    });
});
