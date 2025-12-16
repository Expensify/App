import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import WorkspaceCategoriesPage from '@pages/workspace/categories/WorkspaceCategoriesPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.unmock('react-native-reanimated');
jest.unmock('react-native-worklets');

jest.mock('@src/components/ConfirmedRoute.tsx');

TestHelper.setupGlobalFetchMock();

const Stack = createPlatformStackNavigator<WorkspaceSplitNavigatorParamList>();

const renderPage = (initialRouteName: typeof SCREENS.WORKSPACE.CATEGORIES, initialParams: WorkspaceSplitNavigatorParamList[typeof SCREENS.WORKSPACE.CATEGORIES]) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={initialRouteName}>
                        <Stack.Screen
                            name={SCREENS.WORKSPACE.CATEGORIES}
                            component={WorkspaceCategoriesPage}
                            initialParams={initialParams}
                        />
                    </Stack.Navigator>
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
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });
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

        const dropdownMenuButtonTestID = 'WorkspaceCategoriesPage-header-dropdown-menu-button';

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
            const deleteText = TestHelper.translateLocal('workspace.categories.deleteCategories');
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
            const confirmModalPrompt = TestHelper.translateLocal('workspace.categories.deleteCategoriesPrompt');
            expect(screen.getByText(confirmModalPrompt)).toBeOnTheScreen();
        });

        // Verify the delete button in the modal is visible
        await waitFor(() => {
            const deleteConfirmButton = screen.getByLabelText(TestHelper.translateLocal('common.delete'));
            expect(deleteConfirmButton).toBeOnTheScreen();
        });

        // Click the delete button in the confirmation modal
        const deleteConfirmButton = screen.getByLabelText(TestHelper.translateLocal('common.delete'));
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
    it('should show a blocking modal when trying to disable the only enabled category when policy has requiresCategory set to true', async () => {
        await TestHelper.signInWithTestUser();

        const policy = {
            ...LHNTestUtils.getFakePolicy(),
            role: CONST.POLICY.ROLE.ADMIN,
            areCategoriesEnabled: true,
            requiresCategory: true,
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

        const dropdownMenuButtonTestID = 'WorkspaceCategoriesPage-header-dropdown-menu-button';

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
            const disableText = TestHelper.translateLocal('workspace.categories.disableCategories');
            expect(screen.getByText(disableText)).toBeOnTheScreen();
        });

        // Find and verify "Disable categories" dropdown menu item
        const disableMenuItem = screen.getByTestId('PopoverMenuItem-Disable categories');
        expect(disableMenuItem).toBeOnTheScreen();

        // Create a mock event object that matches GestureResponderEvent. Needed for onPress in MenuItem to be called
        const mockEvent = {
            nativeEvent: {},
            type: 'press',
            target: disableMenuItem,
            currentTarget: disableMenuItem,
        };
        fireEvent.press(disableMenuItem, mockEvent);

        await waitForBatchedUpdatesWithAct();

        // After clicking disable categories dropdown menu item, verify the blocking modal appears
        await waitFor(() => {
            const blockingPrompt = TestHelper.translateLocal('workspace.categories.cannotDeleteOrDisableAllCategories.title');
            expect(screen.getByText(blockingPrompt)).toBeOnTheScreen();
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});
