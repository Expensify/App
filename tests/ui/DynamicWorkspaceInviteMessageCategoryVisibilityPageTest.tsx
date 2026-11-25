import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import type {SettingsNavigatorParamList} from '@navigation/types';

import DynamicWorkspaceInviteMessageCategoryVisibilityPage from '@pages/workspace/DynamicWorkspaceInviteMessageCategoryVisibilityPage';

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
jest.mock('@components/Modal/ReanimatedModal', () => {
    const {default: MockReanimatedModal} = jest.requireActual<typeof MockReanimatedModalModule>('../utils/mockReanimatedModal');
    return MockReanimatedModal;
});

TestHelper.setupGlobalFetchMock();

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

const renderPage = (policyID: string) =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <ModalProvider>
                    <NavigationContainer>
                        <Stack.Navigator initialRouteName={SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_INVITE_MESSAGE_CATEGORY_VISIBILITY}>
                            <Stack.Screen
                                name={SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_INVITE_MESSAGE_CATEGORY_VISIBILITY}
                                component={DynamicWorkspaceInviteMessageCategoryVisibilityPage}
                                initialParams={{policyID}}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </ModalProvider>
            </PortalProvider>
        </ComposeProviders>,
    );

describe('DynamicWorkspaceInviteMessageCategoryVisibilityPage', () => {
    const adminAccountID = 1;
    const adminEmail = 'admin@example.com';

    const policy = {
        ...LHNTestUtils.getFakePolicy(),
        role: CONST.POLICY.ROLE.ADMIN,
        type: CONST.POLICY.TYPE.CORPORATE,
        areCategoriesEnabled: true,
        employeeList: {
            [adminEmail]: {email: adminEmail, role: CONST.POLICY.ROLE.ADMIN},
        },
    };

    const policyCategories: PolicyCategories = {
        Fuel: {name: 'Fuel', enabled: true, visibleTo: null},
        Meals: {name: 'Meals', enabled: true, visibleTo: null},
        Travel: {name: 'Travel', enabled: true, visibleTo: null},
    };

    const draftKey = `${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_CATEGORY_VISIBILITY_DRAFT}${policy.id}` as const;

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await TestHelper.signInWithTestUser(adminAccountID, adminEmail, undefined, 'Admin');
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
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
        jest.restoreAllMocks();
    });

    it('saves the checked categories as the draft when some are unchecked', async () => {
        // Given no draft, so the members being invited can use every category and every row starts checked
        const {unmount} = renderPage(policy.id);
        await waitForBatchedUpdatesWithAct();
        expect(await screen.findByText('Travel')).toBeOnTheScreen();

        // When the admin unchecks Travel and saves
        fireEvent.press(screen.getByText('Travel'));
        fireEvent.press(screen.getByText('Save'));
        await waitForBatchedUpdatesWithAct();

        // Then the draft holds the categories still checked, which the invite sends instead of calling the API now
        expect(await getOnyxValue(draftKey)).toEqual(['Fuel', 'Meals']);

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('clears the draft when every category ends up checked', async () => {
        // Given a draft that limits the members being invited to Meals
        await act(async () => {
            await Onyx.set(draftKey, ['Meals']);
        });
        const {unmount} = renderPage(policy.id);
        await waitForBatchedUpdatesWithAct();
        expect(await screen.findByText('Fuel')).toBeOnTheScreen();

        // When the admin checks Fuel and Travel too and saves
        fireEvent.press(screen.getByText('Fuel'));
        fireEvent.press(screen.getByText('Travel'));
        fireEvent.press(screen.getByText('Save'));
        await waitForBatchedUpdatesWithAct();

        // Then the draft is gone, since no draft is what leaves the members unrestricted
        expect(await getOnyxValue(draftKey)).toBeUndefined();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it("keeps the admin's checks while the categories are read again, as on reconnect", async () => {
        // Given no draft, with the category list already on screen
        const {unmount} = renderPage(policy.id);
        await waitForBatchedUpdatesWithAct();
        expect(await screen.findByText('Travel')).toBeOnTheScreen();

        // When the admin unchecks Travel, and then the categories are read again, as when the app reconnects
        fireEvent.press(screen.getByText('Travel'));
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_POLICY_CATEGORIES_LOADING_STATE}${policy.id}`, {isLoading: true, hasOnceLoaded: false});
        });
        await waitForBatchedUpdatesWithAct();

        // Then the list stays on screen instead of a spinner, and saving keeps Travel unchecked
        expect(screen.getByText('Travel')).toBeOnTheScreen();
        fireEvent.press(screen.getByText('Save'));
        await waitForBatchedUpdatesWithAct();
        expect(await getOnyxValue(draftKey)).toEqual(['Fuel', 'Meals']);

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it("doesn't save when every category is unchecked, since a member needs at least one", async () => {
        // Given a draft that limits the members being invited to Meals
        await act(async () => {
            await Onyx.set(draftKey, ['Meals']);
        });
        const {unmount} = renderPage(policy.id);
        await waitForBatchedUpdatesWithAct();
        expect(await screen.findByText('Meals')).toBeOnTheScreen();

        // When the admin unchecks Meals, leaving nothing checked, and saves
        fireEvent.press(screen.getByText('Meals'));
        fireEvent.press(screen.getByText('Save'));
        await waitForBatchedUpdatesWithAct();

        // Then the same modal as the member's Category visibility page explains why, and the draft is unchanged
        expect(await screen.findByText(TestHelper.translateLocal('workspace.people.categoryVisibilityRequiredModal.title'))).toBeOnTheScreen();
        expect(await getOnyxValue(draftKey)).toEqual(['Meals']);

        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});
