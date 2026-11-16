import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import Tooltip from '@components/Tooltip';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import * as PolicyCategoryActions from '@libs/actions/Policy/Category';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';
import Navigation from '@libs/Navigation/Navigation';
import appNavigationRef from '@libs/Navigation/navigationRef';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';

import WorkspaceCategoriesPage from '@pages/workspace/categories/WorkspaceCategoriesPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {PolicyCategories} from '@src/types/onyx';

import {PortalProvider} from '@gorhom/portal';
import {createNavigationContainerRef, NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import type * as MockReanimatedModalModule from '../utils/mockReanimatedModal';

import createMock from '../utils/createMock';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@src/components/ConfirmedRoute.tsx');
jest.mock('@components/Modal/ReanimatedModal', () => {
    const {default: MockReanimatedModal} = jest.requireActual<typeof MockReanimatedModalModule>('../utils/mockReanimatedModal');
    return MockReanimatedModal;
});

TestHelper.setupGlobalFetchMock();

const Stack = createPlatformStackNavigator<WorkspaceSplitNavigatorParamList>();

const renderPage = (initialRouteName: typeof SCREENS.WORKSPACE.CATEGORIES, initialParams: WorkspaceSplitNavigatorParamList[typeof SCREENS.WORKSPACE.CATEGORIES]) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <ModalProvider>
                    <NavigationContainer>
                        <Stack.Navigator initialRouteName={initialRouteName}>
                            <Stack.Screen
                                name={SCREENS.WORKSPACE.CATEGORIES}
                                component={WorkspaceCategoriesPage}
                                initialParams={initialParams}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </ModalProvider>
            </PortalProvider>
        </ComposeProviders>,
    );
};

const navigationRef = createNavigationContainerRef<WorkspaceSplitNavigatorParamList>();

function StackedScreen() {
    return null;
}

const renderPageUnderStackedScreen = (initialParams: WorkspaceSplitNavigatorParamList[typeof SCREENS.WORKSPACE.CATEGORIES]) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <ModalProvider>
                    <NavigationContainer ref={navigationRef}>
                        <Stack.Navigator initialRouteName={SCREENS.WORKSPACE.CATEGORIES}>
                            <Stack.Screen
                                name={SCREENS.WORKSPACE.CATEGORIES}
                                component={WorkspaceCategoriesPage}
                                initialParams={initialParams}
                            />
                            <Stack.Screen
                                name={SCREENS.WORKSPACE.TAGS}
                                component={StackedScreen}
                                initialParams={initialParams}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </ModalProvider>
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
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue(
            createMock<ResponsiveLayoutResult>({
                isSmallScreenWidth: false,
                shouldUseNarrowLayout: false,
            }),
        );
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.restoreAllMocks();
    });

    describe('Auto-categorize availability', () => {
        const getAutoCategorizeSwitch = () => screen.getByRole(CONST.ROLE.SWITCH, {name: TestHelper.translateLocal('workspace.categories.autoCategorizeNewExpenses')});
        const getCategoryTooltips = () =>
            screen.UNSAFE_queryAllByType(Tooltip).filter((tooltip) => tooltip.props.text === TestHelper.translateLocal('workspace.categories.enableAtLeastOneCategory'));

        beforeEach(() => {
            // Each test controls when a complete category fetch becomes available.
            jest.spyOn(PolicyCategoryActions, 'openPolicyCategoriesPage').mockImplementation(() => {});
        });

        it.each([
            {savedValue: true, categoryState: 'disabled'},
            {savedValue: false, categoryState: 'disabled'},
            {savedValue: undefined, categoryState: 'disabled'},
            {savedValue: true, categoryState: 'deleted'},
            {savedValue: false, categoryState: 'deleted'},
            {savedValue: true, categoryState: 'pending deletion'},
        ])('preserves the $savedValue preference while the last category is $categoryState', async ({savedValue, categoryState}) => {
            // Given a fully loaded workspace with an enabled category and a saved or default preference
            await TestHelper.signInWithTestUser();
            const policy = {
                ...LHNTestUtils.getFakePolicy(),
                role: CONST.POLICY.ROLE.ADMIN,
                areCategoriesEnabled: true,
                requiresCategory: false,
                autoCategorizeNewExpenses: savedValue,
                glCodes: true,
                showCategoryGLCodes: true,
            };
            const enabledCategory = {name: FIRST_CATEGORY, enabled: true};
            const setAutoCategorize = jest.spyOn(PolicyCategoryActions, 'setPolicyAutoCategorizeNewExpenses');
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
                await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy.id}`, {[FIRST_CATEGORY]: enabledCategory});
                await Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_POLICY_CATEGORIES_LOADING_STATE}${policy.id}`, {hasOnceLoaded: true});
            });
            const {unmount} = renderPage(SCREENS.WORKSPACE.CATEGORIES, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();
            fireEvent.press(screen.getByText(TestHelper.translateLocal('common.more')));
            await waitForBatchedUpdatesWithAct();
            expect(getAutoCategorizeSwitch()).toHaveProp('accessibilityState', {checked: savedValue ?? true, disabled: false});
            expect(getCategoryTooltips()).toHaveLength(0);

            // When the last category is disabled, deleted, or marked for optimistic deletion
            const unavailableCategories: PolicyCategories =
                categoryState === 'deleted'
                    ? {}
                    : {
                          [FIRST_CATEGORY]: {
                              ...enabledCategory,
                              enabled: categoryState === 'pending deletion',
                              ...(categoryState === 'pending deletion' ? {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE} : {}),
                          },
                      };
            await act(async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy.id}`, unavailableCategories);
            });
            await waitForBatchedUpdatesWithAct();

            // Then Auto-categorize is off and locked without changing the preference or the GL-code toggle
            expect(getAutoCategorizeSwitch()).toHaveProp('accessibilityState', {checked: false, disabled: true});
            expect(getCategoryTooltips()).toHaveLength(1);
            expect(screen.getByRole(CONST.ROLE.SWITCH, {name: TestHelper.translateLocal('workspace.categories.showCategoryGLCodes')})).toHaveProp('accessibilityState', {
                checked: true,
                disabled: false,
            });
            fireEvent.press(getAutoCategorizeSwitch());
            expect(setAutoCategorize).not.toHaveBeenCalled();
            // eslint-disable-next-line rulesdir/no-onyx-get-snapshot-key -- This workspace test has no SearchScopeProvider and verifies the unchanged live policy fixture.
            expect((await Onyx.get(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`))?.autoCategorizeNewExpenses).toBe(savedValue);

            // When a category is enabled again or the optimistic deletion rolls back
            await act(async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy.id}`, {[FIRST_CATEGORY]: enabledCategory});
            });
            await waitForBatchedUpdatesWithAct();

            // Then the saved/default display returns and the menu remains open
            expect(getAutoCategorizeSwitch()).toHaveProp('accessibilityState', {checked: savedValue ?? true, disabled: false});
            expect(getCategoryTooltips()).toHaveLength(0);
            expect(setAutoCategorize).not.toHaveBeenCalled();
            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it.each([false, true])('does not infer empty categories before a successful fetch (cached enabled category: %s)', async (hasCachedCategory) => {
            // Given hydrated cache data that may be incomplete and no successful full fetch
            await TestHelper.signInWithTestUser();
            const policy = {
                ...LHNTestUtils.getFakePolicy(),
                role: CONST.POLICY.ROLE.ADMIN,
                areCategoriesEnabled: true,
                autoCategorizeNewExpenses: true,
            };
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
                if (hasCachedCategory) {
                    await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy.id}`, {[FIRST_CATEGORY]: {name: FIRST_CATEGORY, enabled: true}});
                }
            });
            const {unmount} = renderPage(SCREENS.WORKSPACE.CATEGORIES, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();
            fireEvent.press(screen.getByText(TestHelper.translateLocal('common.more')));
            await waitForBatchedUpdatesWithAct();

            // Then the saved display is preserved and cached enabled categories introduce no new interaction restriction
            expect(getAutoCategorizeSwitch()).toHaveProp('accessibilityState', {checked: true, disabled: !hasCachedCategory});
            expect(getCategoryTooltips()).toHaveLength(0);

            // When a complete successful response establishes that the workspace is empty
            await act(async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy.id}`, {});
                await Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_POLICY_CATEGORIES_LOADING_STATE}${policy.id}`, {hasOnceLoaded: true});
            });
            await waitForBatchedUpdatesWithAct();

            // Then an actually empty workspace displays off with the explanation
            expect(getAutoCategorizeSwitch()).toHaveProp('accessibilityState', {checked: false, disabled: true});
            expect(getCategoryTooltips()).toHaveLength(1);
            unmount();
            await waitForBatchedUpdatesWithAct();
        });
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

        // Select categories to delete. Once the list loads, the sticky table header renders a second "Select all" checkbox
        const selectAll = screen.getAllByLabelText(TestHelper.translateLocal('workspace.common.selectAll')).at(0);

        if (!selectAll) {
            throw new Error('Select all button not found');
        }

        fireEvent.press(selectAll);

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

        // Select categories to disable. Once the list loads, the sticky table header renders a second "Select all" checkbox
        const selectAll = screen.getAllByLabelText(TestHelper.translateLocal('workspace.common.selectAll')).at(0);

        if (!selectAll) {
            throw new Error('Select all button not found');
        }

        fireEvent.press(selectAll);

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

    it('should build the same category route when the row is pressed again while the category page is stacked over the list', async () => {
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
        };

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy.id}`, categories);
        });

        const getActiveRoute = jest.spyOn(Navigation, 'getActiveRoute').mockReturnValue(ROUTES.WORKSPACE_CATEGORIES.getRoute(policy.id));
        const navigate = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
        jest.spyOn(appNavigationRef, 'isReady').mockReturnValue(true);
        jest.spyOn(appNavigationRef, 'getRootState').mockImplementation(() => navigationRef.getRootState());
        jest.spyOn(appNavigationRef, 'addListener').mockImplementation((event, callback) => navigationRef.addListener(event, callback));

        const {unmount} = renderPageUnderStackedScreen({policyID: policy.id});

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByText(FIRST_CATEGORY)).toBeOnTheScreen();
        });

        const categoryRoute = createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_CATEGORY_SETTINGS.getRoute(FIRST_CATEGORY), ROUTES.WORKSPACE_CATEGORIES.getRoute(policy.id));

        fireEvent.press(screen.getByText(FIRST_CATEGORY));
        await waitForBatchedUpdatesWithAct();

        expect(navigate.mock.calls.at(0)?.at(0)).toBe(categoryRoute);

        // A sibling stack screen stands in for the RHP category page that covers the list in the app, with the active route pointed at that page.
        getActiveRoute.mockReturnValue(categoryRoute);
        act(() => navigationRef.navigate(SCREENS.WORKSPACE.TAGS, {policyID: policy.id}));
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText(FIRST_CATEGORY, {includeHiddenElements: true}));
        await waitForBatchedUpdatesWithAct();

        expect(navigate.mock.calls.at(1)?.at(0)).toBe(categoryRoute);
        expect(JSON.stringify(getStateFromPath(categoryRoute))).not.toContain(SCREENS.NOT_FOUND);

        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});
