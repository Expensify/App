import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxProvider from '@components/OnyxProvider';
import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';
import {translateLocal} from '@libs/Localize';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import WorkspaceTagsPage from '@pages/workspace/tags/WorkspaceTagsPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

TestHelper.setupGlobalFetchMock();
jest.mock('@components/ConfirmedRoute.tsx');

jest.unmock('react-native-reanimated');

const Stack = createPlatformStackNavigator<WorkspaceSplitNavigatorParamList>();

const renderPage = (initialRouteName: typeof SCREENS.WORKSPACE.TAGS, initialParams: WorkspaceSplitNavigatorParamList[typeof SCREENS.WORKSPACE.TAGS]) => {
    return render(
        <ComposeProviders components={[OnyxProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={initialRouteName}>
                        <Stack.Screen
                            name={SCREENS.WORKSPACE.TAGS}
                            component={WorkspaceTagsPage}
                            initialParams={initialParams}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
};

describe('WorkspaceTags', () => {
    const FIRST_TAG = 'Tag One';
    const SECOND_TAG = 'Tag Two';

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue({
            isSmallScreenWidth: true,
            shouldUseNarrowLayout: true,
        } as ResponsiveLayoutResult);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it('should show select option when the item is not selected and deselect option when the item is selected', async () => {
        await TestHelper.signInWithTestUser();

        const policy = {
            ...LHNTestUtils.getFakePolicy(),
            role: CONST.POLICY.ROLE.ADMIN,
            areTagsEnabled: true,
            requiresTag: true,
        };

        const tags = {
            TagListOne: {
                name: 'TagListOne',
                required: true,
                orderWeight: 1,
                tags: {
                    [FIRST_TAG]: {
                        name: FIRST_TAG,
                        enabled: true,
                    },
                    [SECOND_TAG]: {
                        name: SECOND_TAG,
                        enabled: true,
                    },
                },
            },
        };

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy.id}`, tags);
        });

        const {unmount} = renderPage(SCREENS.WORKSPACE.TAGS, {policyID: policy.id});

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByText(FIRST_TAG)).toBeOnTheScreen();
        });
        await waitFor(() => {
            expect(screen.getByText(SECOND_TAG)).toBeOnTheScreen();
        });

        // Long press on the first tag to trigger the select action

        fireEvent(screen.getByTestId(`base-list-item-Tag One`), 'onLongPress');

        await waitForBatchedUpdatesWithAct();

        // Wait for the "Select" option to appear
        await waitFor(() => {
            expect(screen.getByText(translateLocal('common.select'))).toBeOnTheScreen();
        });

        // Find and click the "Select" menu item. Using getByText, since testID is not reliable here
        const selectMenuItem = screen.getByText(translateLocal('common.select'));
        expect(selectMenuItem).toBeOnTheScreen();

        // Create a mock event object that matches GestureResponderEvent. Needed for onPress in MenuItem to be called
        const mockEvent = {
            nativeEvent: {},
            type: 'press',
            target: selectMenuItem,
            currentTarget: selectMenuItem,
        };
        fireEvent.press(selectMenuItem, mockEvent);

        await waitForBatchedUpdatesWithAct();

        // Long press again on the second tag to trigger the deselect action
        fireEvent(screen.getByTestId('base-list-item-Tag One'), 'onLongPress');
        await waitForBatchedUpdatesWithAct();

        // Wait for the "Deselect" option to appear
        await waitFor(() => {
            expect(screen.getByText(translateLocal('common.deselect'))).toBeOnTheScreen();
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});
