import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxProvider from '@components/OnyxProvider';
import {CurrentReportIDContextProvider} from '@components/withCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';
import * as Localize from '@libs/Localize';
import createResponsiveStackNavigator from '@navigation/AppNavigator/createResponsiveStackNavigator';
import type {FullScreenNavigatorParamList} from '@navigation/types';
import WorkspaceCategoriesPage from '@pages/workspace/categories/WorkspaceCategoriesPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

TestHelper.setupGlobalFetchMock();

const RootStack = createResponsiveStackNavigator<FullScreenNavigatorParamList>();

const renderPage = (initialRouteName: typeof SCREENS.WORKSPACE.CATEGORIES, initialParams: FullScreenNavigatorParamList[typeof SCREENS.WORKSPACE.CATEGORIES]) => {
    return render(
        <ComposeProviders components={[OnyxProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <RootStack.Navigator initialRouteName={initialRouteName}>
                        <RootStack.Screen
                            name={SCREENS.WORKSPACE.CATEGORIES}
                            component={WorkspaceCategoriesPage}
                            initialParams={initialParams}
                        />
                    </RootStack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
};

describe('WorkspaceCategories', () => {
    const FIRST_CATEGORY = 'categoryOne';
    const SECOND_CATEGORY = 'categoryTwo';

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue({
            isSmallScreenWidth: false,
            shouldUseNarrowLayout: false,
        } as ResponsiveLayoutResult);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it('should delete categories through UI interactions', async () => {
        await TestHelper.signInWithTestUser();

        const policy = {
            ...LHNTestUtils.getFakePolicy(),
            role: CONST.POLICY.ROLE.ADMIN,
            areCategoriesEnabled: true,
        };

        const categories = {
            [FIRST_CATEGORY]: {
                name: FIRST_CATEGORY,
                enabled: true,
            },
            [SECOND_CATEGORY]: {
                name: SECOND_CATEGORY,
                enabled: true,
            },
        };

        // Initialize categories
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy.id}`, categories);
        });

        const {unmount} = renderPage(SCREENS.WORKSPACE.CATEGORIES, {policyID: policy.id});

        await waitForBatchedUpdatesWithAct();

        // Wait for initial render and verify categories are visible
        await waitFor(() => {
            expect(screen.getByText(FIRST_CATEGORY)).toBeOnTheScreen();
        });
        await waitFor(() => {
            expect(screen.getByText(SECOND_CATEGORY)).toBeOnTheScreen();
        });

        // Select categories to delete by clicking their checkboxes
        fireEvent.press(screen.getByTestId(`TableListItemCheckbox-${FIRST_CATEGORY}`));
        fireEvent.press(screen.getByTestId(`TableListItemCheckbox-${SECOND_CATEGORY}`));

        const dropdownMenuButtonTestID = `${WorkspaceCategoriesPage.displayName}-header-dropdown-menu-button`;

        // Wait for selection mode to be active and click the dropdown menu button
        await waitFor(() => {
            expect(screen.getByTestId(dropdownMenuButtonTestID)).toBeOnTheScreen();
        });

        // Click the "2 selected" button to open the menu
        const dropdownButton = screen.getByTestId(dropdownMenuButtonTestID);
        fireEvent.press(dropdownButton);

        await waitForBatchedUpdatesWithAct();

        // Wait for menu items to be visible
        await waitFor(() => {
            const deleteText = Localize.translateLocal('workspace.categories.deleteCategories');
            expect(screen.getByText(deleteText)).toBeOnTheScreen();
        });

        // Find and verify "Delete categories" dropdown menu item
        const deleteMenuItem = screen.getByTestId('PopoverMenuItem-Delete categories');
        expect(deleteMenuItem).toBeOnTheScreen();

        // Create a mock event object that matches GestureResponderEvent. Needed for onPress in MenuItem to be called
        const mockEvent = {
            nativeEvent: {},
            type: 'press',
            target: deleteMenuItem,
            currentTarget: deleteMenuItem,
        };
        fireEvent.press(deleteMenuItem, mockEvent);

        await waitForBatchedUpdatesWithAct();

        // After clicking delete categories dropdown menu item, verify the confirmation modal appears
        await waitFor(() => {
            const confirmModalPrompt = Localize.translateLocal('workspace.categories.deleteCategoriesPrompt');
            expect(screen.getByText(confirmModalPrompt)).toBeOnTheScreen();
        });

        // Verify the delete button in the modal is visible
        await waitFor(() => {
            const deleteConfirmButton = screen.getByLabelText(Localize.translateLocal('common.delete'));
            expect(deleteConfirmButton).toBeOnTheScreen();
        });

        // Click the delete button in the confirmation modal
        const deleteConfirmButton = screen.getByLabelText(Localize.translateLocal('common.delete'));
        fireEvent.press(deleteConfirmButton);

        await waitForBatchedUpdatesWithAct();

        // Verify the categories are deleted from the UI
        await waitFor(() => {
            expect(screen.queryByText(FIRST_CATEGORY)).not.toBeOnTheScreen();
        });
        await waitFor(() => {
            expect(screen.queryByText(SECOND_CATEGORY)).not.toBeOnTheScreen();
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});
