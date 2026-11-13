import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import PersonalDetailsByLoginProvider from '@components/PersonalDetailsByLoginProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

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
jest.mock('@components/Modal/ReanimatedModal', () => {
    const {default: MockReanimatedModal} = jest.requireActual<typeof MockReanimatedModalModule>('../utils/mockReanimatedModal');
    return MockReanimatedModal;
});

const mockFetch = TestHelper.setupGlobalFetchMock();

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

const renderPage = (initialParams: SettingsNavigatorParamList[typeof SCREENS.WORKSPACE.DYNAMIC_CATEGORY_VISIBLE_TO]) =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider, PersonalDetailsByLoginProvider]}>
            <PortalProvider>
                <ModalProvider>
                    <NavigationContainer>
                        <Stack.Navigator initialRouteName={SCREENS.WORKSPACE.DYNAMIC_CATEGORY_VISIBLE_TO}>
                            <Stack.Screen
                                name={SCREENS.WORKSPACE.DYNAMIC_CATEGORY_VISIBLE_TO}
                                component={DynamicCategoryVisibleToPage}
                                initialParams={initialParams}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </ModalProvider>
            </PortalProvider>
        </ComposeProviders>,
    );

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
});
