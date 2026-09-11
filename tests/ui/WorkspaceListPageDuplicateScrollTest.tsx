import {act, render} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {WorkspaceNavigatorParamList} from '@libs/Navigation/types';

import WorkspacesListPage from '@pages/workspace/WorkspacesListPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const mockScrollToIndex = jest.fn();
const mockProcessedWorkspaces = [{policyID: 'existing-policy'}, {policyID: 'duplicate-policy'}];

jest.mock('@components/Tables/WorkspaceListTable', () => {
    const ReactLocal = jest.requireActual<typeof React>('react');

    function MockWorkspaceListTable({ref}: {ref?: React.Ref<{getProcessedData: () => typeof mockProcessedWorkspaces; scrollToIndex: typeof mockScrollToIndex}>}) {
        ReactLocal.useImperativeHandle(ref, () => ({
            getProcessedData: () => mockProcessedWorkspaces,
            scrollToIndex: mockScrollToIndex,
        }));
        return null;
    }

    return {
        __esModule: true,
        default: MockWorkspaceListTable,
    };
});

const Stack = createPlatformStackNavigator<WorkspaceNavigatorParamList>();

function renderPage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={SCREENS.WORKSPACES_LIST}>
                        <Stack.Screen
                            name={SCREENS.WORKSPACES_LIST}
                            component={WorkspacesListPage}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
}

describe('WorkspaceListPage duplicate workspace scrolling', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it('centers the optimistic duplicate so the sticky table header does not cover it', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}duplicate-policy`, {
            id: 'duplicate-policy',
            name: 'Duplicate workspace',
            role: CONST.POLICY.ROLE.ADMIN,
            type: CONST.POLICY.TYPE.TEAM,
        });
        await Onyx.set(ONYXKEYS.DUPLICATE_WORKSPACE, {
            policyID: 'duplicate-policy',
            name: 'Duplicate workspace',
        });

        renderPage();
        await waitForBatchedUpdatesWithAct();

        expect(mockScrollToIndex).toHaveBeenCalledWith({
            index: 1,
            animated: false,
            viewPosition: 0.5,
        });
    });
});
