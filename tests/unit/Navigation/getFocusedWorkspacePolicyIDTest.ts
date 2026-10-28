import getFocusedWorkspacePolicyID from '@libs/Navigation/helpers/getFocusedWorkspacePolicyID';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {NavigationState, PartialState} from '@react-navigation/native';

type State = PartialState<NavigationState>;

const POLICY_ID = 'ABC123';

describe('getFocusedWorkspacePolicyID', () => {
    it('returns undefined for undefined state', () => {
        // Given no navigation state yet
        // When the focused workspace is read
        const policyID = getFocusedWorkspacePolicyID(undefined);

        // Then there is none
        expect(policyID).toBeUndefined();
    });

    it('returns the policyID of a focused workspace page', () => {
        // Given a workspace categories page focused under the workspace navigator
        const state: State = {
            routes: [
                {
                    name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                    state: {
                        routes: [{name: SCREENS.REPORT, params: {reportID: '1'}}],
                    },
                },
                {
                    name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
                    state: {
                        routes: [
                            {
                                name: SCREENS.WORKSPACE.CATEGORIES,
                                params: {policyID: POLICY_ID},
                            },
                        ],
                    },
                },
            ],
        };

        // When the focused workspace is read
        const policyID = getFocusedWorkspacePolicyID(state);

        // Then it is the workspace on screen, not the report left behind it
        expect(policyID).toBe(POLICY_ID);
    });

    it('returns undefined when the focused screen shows a report', () => {
        // Given a report focused in the RHP on top of a workspace page
        const state: State = {
            index: 1,
            routes: [
                {
                    name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
                    state: {
                        routes: [
                            {
                                name: SCREENS.WORKSPACE.CATEGORIES,
                                params: {policyID: POLICY_ID},
                            },
                        ],
                    },
                },
                {
                    name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
                    state: {
                        routes: [
                            {
                                name: SCREENS.RIGHT_MODAL.SEARCH_REPORT,
                                params: {reportID: '2', policyID: POLICY_ID},
                            },
                        ],
                    },
                },
            ],
        };

        // When the focused workspace is read
        const policyID = getFocusedWorkspacePolicyID(state);

        // Then the report takes precedence and no workspace is returned
        expect(policyID).toBeUndefined();
    });

    it('returns undefined when the focused screen has no policyID', () => {
        // Given a report focused in the inbox
        const state: State = {
            routes: [
                {
                    name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                    state: {
                        routes: [{name: SCREENS.REPORT, params: {reportID: '1'}}],
                    },
                },
            ],
        };

        // When the focused workspace is read
        const policyID = getFocusedWorkspacePolicyID(state);

        // Then there is none
        expect(policyID).toBeUndefined();
    });
});
