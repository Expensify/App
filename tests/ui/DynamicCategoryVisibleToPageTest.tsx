import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import PersonalDetailsByLoginProvider from '@components/PersonalDetailsByLoginProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import {clearWorkspaceCategoriesSelectedForBulkEdit} from '@libs/actions/Policy/Category';
import Growl from '@libs/Growl';
import Navigation from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import {cancelSpan, endSpan} from '@libs/telemetry/activeSpans';
import type * as ActiveSpans from '@libs/telemetry/activeSpans';

import type {SettingsNavigatorParamList} from '@navigation/types';

import DynamicCategoryVisibleToPage from '@pages/workspace/categories/DynamicCategoryVisibleToPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {PolicyCategories} from '@src/types/onyx';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import type * as MockReanimatedModalModule from '../utils/mockReanimatedModal';

import createMock from '../utils/createMock';
import getOnyxValue from '../utils/getOnyxValue';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@src/components/ConfirmedRoute.tsx');
jest.mock('@libs/telemetry/activeSpans', () => ({
    ...jest.requireActual<typeof ActiveSpans>('@libs/telemetry/activeSpans'),
    endSpan: jest.fn(),
    cancelSpan: jest.fn(),
}));
jest.mock('@components/Modal/ReanimatedModal', () => {
    const {default: MockReanimatedModal} = jest.requireActual<typeof MockReanimatedModalModule>('../utils/mockReanimatedModal');
    return MockReanimatedModal;
});

const mockFetch = TestHelper.setupGlobalFetchMock();

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

type VisibleToScreenName = typeof SCREENS.WORKSPACE.DYNAMIC_CATEGORY_VISIBLE_TO | typeof SCREENS.WORKSPACE.DYNAMIC_CATEGORIES_BULK_VISIBLE_TO;

const renderScreen = (screenName: VisibleToScreenName, initialParams: SettingsNavigatorParamList[VisibleToScreenName]) =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider, PersonalDetailsByLoginProvider]}>
            <PortalProvider>
                <ModalProvider>
                    <NavigationContainer>
                        <Stack.Navigator initialRouteName={screenName}>
                            <Stack.Screen
                                name={screenName}
                                component={DynamicCategoryVisibleToPage}
                                initialParams={initialParams}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </ModalProvider>
            </PortalProvider>
        </ComposeProviders>,
    );

const renderPage = (initialParams: SettingsNavigatorParamList[typeof SCREENS.WORKSPACE.DYNAMIC_CATEGORY_VISIBLE_TO]) =>
    renderScreen(SCREENS.WORKSPACE.DYNAMIC_CATEGORY_VISIBLE_TO, initialParams);

/** Opens the page from the Categories list's bulk menu, which reads the selected categories from memory instead of the route. */
const renderBulkPage = (policyID: string) => renderScreen(SCREENS.WORKSPACE.DYNAMIC_CATEGORIES_BULK_VISIBLE_TO, {policyID});

describe('DynamicCategoryVisibleToPage', () => {
    const adminAccountID = 1;
    const adminEmail = 'admin@example.com';
    const bobAccountID = 2;
    const bobEmail = 'bob@example.com';
    const carolAccountID = 3;
    const carolEmail = 'carol@example.com';

    const policy = {
        ...LHNTestUtils.getFakePolicy(),
        role: CONST.POLICY.ROLE.ADMIN,
        type: CONST.POLICY.TYPE.CORPORATE,
        areCategoriesEnabled: true,
        employeeList: {
            [adminEmail]: {email: adminEmail, role: CONST.POLICY.ROLE.ADMIN},
            [bobEmail]: {email: bobEmail, role: CONST.POLICY.ROLE.USER},
            [carolEmail]: {email: carolEmail, role: CONST.POLICY.ROLE.USER},
        },
    };

    // Meals is restricted to the admin and Carol, so Fees is the only category Bob can use.
    const policyCategories: PolicyCategories = {
        Fees: {name: 'Fees', enabled: true, visibleTo: null},
        Meals: {name: 'Meals', enabled: true, visibleTo: {[adminAccountID]: true, [carolAccountID]: true}},
    };

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await TestHelper.signInWithTestUser(adminAccountID, adminEmail, undefined, 'Admin');
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [adminAccountID]: TestHelper.buildPersonalDetails(adminEmail, adminAccountID, 'Admin'),
                [bobAccountID]: TestHelper.buildPersonalDetails(bobEmail, bobAccountID, 'Bob'),
                [carolAccountID]: TestHelper.buildPersonalDetails(carolEmail, carolAccountID, 'Carol'),
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy.id}`, policyCategories);
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
        mockFetch.resume();
        jest.restoreAllMocks();
    });

    it('blocks removing a member whose only category this is', async () => {
        // Given the Fees "Visible to" page, where Bob can't use any other category
        const {unmount} = renderPage({policyID: policy.id, categoryName: 'Fees'});
        await waitForBatchedUpdatesWithAct();
        expect(await screen.findByText('Bob User')).toBeOnTheScreen();

        // When the admin unchecks Bob and saves
        fireEvent.press(screen.getByText('Bob User'));
        fireEvent.press(screen.getByText('Save'));
        await waitForBatchedUpdatesWithAct();

        // Then the remove-access modal names Fees, and Fees stays open to everyone since nothing was saved
        expect(await screen.findByText('Can’t remove access to Fees')).toBeOnTheScreen();
        const categories = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy.id}`);
        expect(categories?.Fees?.visibleTo).toBeUndefined();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('restricts the category to the checked members when every removed member keeps another category', async () => {
        // Given the Fees "Visible to" page, where Carol can still use Meals
        mockFetch.pause();
        const {unmount} = renderPage({policyID: policy.id, categoryName: 'Fees'});
        await waitForBatchedUpdatesWithAct();
        expect(await screen.findByText('Carol User')).toBeOnTheScreen();

        // When the admin unchecks Carol and saves
        fireEvent.press(screen.getByText('Carol User'));
        fireEvent.press(screen.getByText('Save'));
        await waitForBatchedUpdatesWithAct();

        // Then Fees is optimistically restricted to the admin and Bob, with the change pending
        const categories = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy.id}`);
        expect(categories?.Fees?.visibleTo).toEqual({[adminAccountID]: true, [bobAccountID]: true});
        expect(categories?.Fees?.pendingFields?.visibleTo).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('blocks the page for a disabled category, since the server rejects visibility changes on it', async () => {
        // Given Fees was disabled
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy.id}`, {Fees: {enabled: false}});
        });

        // When the admin opens its "Visible to" page, for example from a deep link
        const {unmount} = renderPage({policyID: policy.id, categoryName: 'Fees'});
        await waitForBatchedUpdatesWithAct();

        // Then the page is blocked instead of listing the members
        expect(await screen.findByText("Hmm... it's not here")).toBeOnTheScreen();
        expect(screen.queryByText('Bob User')).not.toBeOnTheScreen();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('stays on screen while it closes after unchecking every member disables the category', async () => {
        // Given the Meals "Visible to" page, where the admin and Carol are checked and every member can still use Fees
        mockFetch.pause();
        const {unmount} = renderPage({policyID: policy.id, categoryName: 'Meals'});
        await waitForBatchedUpdatesWithAct();
        expect(await screen.findByText('Carol User')).toBeOnTheScreen();

        // When the admin unchecks every member and saves
        fireEvent.press(screen.getByText('Admin User'));
        fireEvent.press(screen.getByText('Carol User'));
        fireEvent.press(screen.getByText('Save'));
        await waitForBatchedUpdatesWithAct();

        // Then Meals is disabled with the change pending, and the page doesn't swap to not found while it closes
        const categories = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy.id}`);
        expect(categories?.Meals?.enabled).toBe(false);
        expect(categories?.Meals?.pendingFields?.enabled).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
        expect(screen.queryByText("Hmm... it's not here")).not.toBeOnTheScreen();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('keeps the search input when no member matches the search', async () => {
        // Given the Fees "Visible to" page, whose search input sits inside the member list
        const {unmount} = renderPage({policyID: policy.id, categoryName: 'Fees'});
        await waitForBatchedUpdatesWithAct();
        expect(await screen.findByText('Bob User')).toBeOnTheScreen();

        // When the admin searches for a name no member has
        fireEvent.changeText(screen.getByLabelText('Search'), 'xxxx');

        // Then the list says there are no results, and the search input stays so the admin can change the search
        expect(await screen.findByText('No results found', {includeHiddenElements: true})).toBeOnTheScreen();
        expect(screen.getByLabelText('Search')).toBeOnTheScreen();
        expect(screen.queryByText('Bob User')).not.toBeOnTheScreen();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('ends the open span once the member list renders, and cancels it on leaving', async () => {
        // Given the Fees "Visible to" page with the workspace's members loaded, and no span calls from earlier tests
        jest.mocked(endSpan).mockClear();
        jest.mocked(cancelSpan).mockClear();
        const {unmount} = renderPage({policyID: policy.id, categoryName: 'Fees'});
        await waitForBatchedUpdatesWithAct();
        expect(await screen.findByText('Bob User')).toBeOnTheScreen();

        // Then the span ends, since the list has members to show
        expect(endSpan).toHaveBeenCalledWith(CONST.TELEMETRY.SPAN_OPEN_CATEGORY_VISIBLE_TO);

        // When the admin leaves the page
        unmount();
        await waitForBatchedUpdatesWithAct();

        // Then the span is cancelled too, which is a no-op for a span that already ended
        expect(cancelSpan).toHaveBeenCalledWith(CONST.TELEMETRY.SPAN_OPEN_CATEGORY_VISIBLE_TO);
    });

    it('keeps the open span running while the workspace members are still loading', async () => {
        // Given the Fees "Visible to" page opened before the workspace's members have loaded, and no span calls from earlier tests
        jest.mocked(endSpan).mockClear();
        jest.mocked(cancelSpan).mockClear();
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, {employeeList: null});
        });
        const {unmount} = renderPage({policyID: policy.id, categoryName: 'Fees'});
        await waitForBatchedUpdatesWithAct();

        // Then the span doesn't end, since there's no member list to measure yet
        expect(endSpan).not.toHaveBeenCalledWith(CONST.TELEMETRY.SPAN_OPEN_CATEGORY_VISIBLE_TO);

        // When the admin leaves before the members load
        unmount();
        await waitForBatchedUpdatesWithAct();

        // Then the span is cancelled, so the P95 doesn't count a page that never showed its list
        expect(cancelSpan).toHaveBeenCalledWith(CONST.TELEMETRY.SPAN_OPEN_CATEGORY_VISIBLE_TO);
    });

    describe('bulk edit from the Categories list', () => {
        const selectCategoriesForBulkEdit = async (categoryNames: string[], policyID = policy.id) => {
            await act(async () => {
                await Onyx.set(ONYXKEYS.RAM_ONLY_WORKSPACE_CATEGORIES_SELECTED_FOR_BULK_EDIT, {policyID, categoryNames});
            });
        };

        // Travel stays open to everyone, so a member unchecked from the selected categories can still use it.
        const addTravelCategory = async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy.id}`, {Travel: {name: 'Travel', enabled: true}});
            });
        };

        it('sets the checked members on every selected category, starting with nobody checked', async () => {
            // Given Fees and Meals were selected on the Categories list, while every member can still use Travel
            mockFetch.pause();
            const goBack = jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
            const growlSuccess = jest.spyOn(Growl, 'success').mockImplementation(() => {});
            await addTravelCategory();
            await selectCategoriesForBulkEdit(['Fees', 'Meals']);
            const {unmount} = renderBulkPage(policy.id);
            await waitForBatchedUpdatesWithAct();
            expect(await screen.findByText('Bob User')).toBeOnTheScreen();

            // When the admin checks Bob and saves
            fireEvent.press(screen.getByText('Bob User'));
            fireEvent.press(screen.getByText('Save'));
            await waitForBatchedUpdatesWithAct();

            // Then both categories are restricted to Bob alone, which also shows that nobody started checked, and Travel is left alone
            const categories = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy.id}`);
            expect(categories?.Fees?.visibleTo).toEqual({[bobAccountID]: true});
            expect(categories?.Meals?.visibleTo).toEqual({[bobAccountID]: true});
            expect(categories?.Fees?.pendingFields?.visibleTo).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            expect(categories?.Travel?.visibleTo).toBeUndefined();

            // And the page goes back, clearing the selection once it's gone, and confirms how many categories and members were set
            expect(goBack.mock.calls.at(0)?.at(1)).toEqual({afterTransition: clearWorkspaceCategoriesSelectedForBulkEdit});
            expect(growlSuccess).toHaveBeenCalledWith({bodyText: 'Set 2 categories for 1 member. This replaces their current category visibility.'});

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('opens every selected category to everyone when every member is checked', async () => {
            // Given Fees and Meals were selected on the Categories list, and Meals is restricted to the admin and Carol
            mockFetch.pause();
            jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
            const growlSuccess = jest.spyOn(Growl, 'success').mockImplementation(() => {});
            await selectCategoriesForBulkEdit(['Fees', 'Meals']);
            const {unmount} = renderBulkPage(policy.id);
            await waitForBatchedUpdatesWithAct();
            expect(await screen.findByText('Bob User')).toBeOnTheScreen();

            // When the admin checks every member and saves
            fireEvent.press(screen.getByText('Admin User'));
            fireEvent.press(screen.getByText('Bob User'));
            fireEvent.press(screen.getByText('Carol User'));
            fireEvent.press(screen.getByText('Save'));
            await waitForBatchedUpdatesWithAct();

            // Then Meals is open to everyone again, and the toast counts every member
            const categories = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy.id}`);
            expect(categories?.Meals?.visibleTo).toBeUndefined();
            expect(categories?.Meals?.pendingFields?.visibleTo).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            expect(growlSuccess).toHaveBeenCalledWith({bodyText: 'Set 2 categories for 3 members. This replaces their current category visibility.'});

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('disables every selected category when no member is checked, without a toast', async () => {
            // Given Meals and Travel were selected on the Categories list, while every member can still use Fees
            mockFetch.pause();
            jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
            const growlSuccess = jest.spyOn(Growl, 'success').mockImplementation(() => {});
            await addTravelCategory();
            await selectCategoriesForBulkEdit(['Meals', 'Travel']);
            const {unmount} = renderBulkPage(policy.id);
            await waitForBatchedUpdatesWithAct();
            expect(await screen.findByText('Bob User')).toBeOnTheScreen();

            // When the admin saves without checking anyone
            fireEvent.press(screen.getByText('Save'));
            await waitForBatchedUpdatesWithAct();

            // Then both categories are disabled, the page doesn't swap to not found while it closes, and no toast claims
            // members were set, since disabled categories go back to everyone if they're enabled again
            const categories = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy.id}`);
            expect(categories?.Meals?.enabled).toBe(false);
            expect(categories?.Travel?.enabled).toBe(false);
            expect(categories?.Fees?.enabled).toBe(true);
            expect(screen.queryByText("Hmm... it's not here")).not.toBeOnTheScreen();
            expect(growlSuccess).not.toHaveBeenCalled();

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it("doesn't save before the workspace members load, since an empty list would disable every selected category", async () => {
            // Given Meals and Travel were selected on the Categories list, and the workspace's members haven't loaded yet
            const goBack = jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
            await addTravelCategory();
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, {employeeList: null});
            });
            await selectCategoriesForBulkEdit(['Meals', 'Travel']);
            const {unmount} = renderBulkPage(policy.id);
            await waitForBatchedUpdatesWithAct();
            expect(await screen.findByText('Save')).toBeOnTheScreen();

            // When the admin presses Save
            fireEvent.press(screen.getByText('Save'));
            await waitForBatchedUpdatesWithAct();

            // Then nothing is saved and the page stays open, so the categories keep their members
            const categories = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy.id}`);
            expect(categories?.Meals?.enabled).toBe(true);
            expect(categories?.Travel?.enabled).toBe(true);
            expect(goBack).not.toHaveBeenCalled();

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('blocks the save when a member would be left without any category', async () => {
            // Given Fees and Meals were selected on the Categories list, and they're the workspace's only categories
            await selectCategoriesForBulkEdit(['Fees', 'Meals']);
            const {unmount} = renderBulkPage(policy.id);
            await waitForBatchedUpdatesWithAct();
            expect(await screen.findByText('Bob User')).toBeOnTheScreen();

            // When the admin checks everyone but Bob and saves
            fireEvent.press(screen.getByText('Admin User'));
            fireEvent.press(screen.getByText('Carol User'));
            fireEvent.press(screen.getByText('Save'));
            await waitForBatchedUpdatesWithAct();

            // Then the remove-access modal is shown for both categories, and nothing is saved
            expect(await screen.findByText('Can’t remove access to these categories')).toBeOnTheScreen();
            const categories = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy.id}`);
            expect(categories?.Fees?.visibleTo).toBeUndefined();
            expect(categories?.Meals?.visibleTo).toEqual({[adminAccountID]: true, [carolAccountID]: true});

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('leaves out the selected categories that are disabled, since the server rejects visibility changes on them', async () => {
            // Given Fees and a disabled Meals were selected on the Categories list, while every member can still use Travel
            mockFetch.pause();
            jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
            const growlSuccess = jest.spyOn(Growl, 'success').mockImplementation(() => {});
            await addTravelCategory();
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy.id}`, {Meals: {enabled: false}});
            });
            await selectCategoriesForBulkEdit(['Fees', 'Meals']);
            const {unmount} = renderBulkPage(policy.id);
            await waitForBatchedUpdatesWithAct();
            expect(await screen.findByText('Bob User')).toBeOnTheScreen();

            // When the admin checks Bob and saves
            fireEvent.press(screen.getByText('Bob User'));
            fireEvent.press(screen.getByText('Save'));
            await waitForBatchedUpdatesWithAct();

            // Then only Fees is restricted to Bob, and the toast counts only Fees
            const categories = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy.id}`);
            expect(categories?.Fees?.visibleTo).toEqual({[bobAccountID]: true});
            expect(categories?.Meals?.visibleTo).toEqual({[adminAccountID]: true, [carolAccountID]: true});
            expect(growlSuccess).toHaveBeenCalledWith({bodyText: 'Set 1 category for 1 member. This replaces their current category visibility.'});

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it.each([
            {description: 'nothing is selected, as after a refresh', categoryNames: undefined, selectedOnPolicyID: undefined},
            {description: 'the categories were selected on another workspace', categoryNames: ['Fees'], selectedOnPolicyID: 'otherPolicy'},
            {description: 'every selected category is disabled', categoryNames: ['Disabled'], selectedOnPolicyID: undefined},
        ])('blocks the page when $description', async ({categoryNames, selectedOnPolicyID}) => {
            // Given the bulk-edit selection has no enabled category of this workspace
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy.id}`, {Disabled: {name: 'Disabled', enabled: false}});
            });
            if (categoryNames) {
                await selectCategoriesForBulkEdit(categoryNames, selectedOnPolicyID);
            }

            // When the bulk "Visible to" page opens
            const {unmount} = renderBulkPage(policy.id);
            await waitForBatchedUpdatesWithAct();

            // Then it's blocked instead of listing the members, since saving would change nothing
            expect(await screen.findByText("Hmm... it's not here")).toBeOnTheScreen();
            expect(screen.queryByText('Bob User')).not.toBeOnTheScreen();

            unmount();
            await waitForBatchedUpdatesWithAct();
        });
    });
});
