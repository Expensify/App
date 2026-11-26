import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import Navigation from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';

import WorkspaceOverviewPage from '@pages/workspace/WorkspaceOverviewPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

TestHelper.setupGlobalFetchMock();

const POLICY_ID = 'overview-currency-error-test';
// Any microsecond timestamp works as the error key, since the page shows the latest error for the field
const ERROR_KEY = 1;
const CURRENCY_ERROR_MESSAGE = 'Unable to change the report currency';
const OWNER_EMAIL = 'test@user.com';
const OWNER_ACCOUNT_ID = 1;

const Stack = createPlatformStackNavigator<WorkspaceSplitNavigatorParamList>();

const setupPolicy = async (policyOverrides: Partial<Policy>) => {
    await act(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
            ...LHNTestUtils.getFakePolicy(POLICY_ID),
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.ADMIN,
            owner: OWNER_EMAIL,
            outputCurrency: CONST.CURRENCY.USD,
            ...policyOverrides,
        });
    });
};

const renderPage = () =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <ModalProvider>
                    <NavigationContainer>
                        <Stack.Navigator initialRouteName={SCREENS.WORKSPACE.PROFILE}>
                            <Stack.Screen
                                name={SCREENS.WORKSPACE.PROFILE}
                                component={WorkspaceOverviewPage}
                                initialParams={{policyID: POLICY_ID}}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </ModalProvider>
            </PortalProvider>
        </ComposeProviders>,
    );

const queryCurrencyError = () => screen.queryByText(CURRENCY_ERROR_MESSAGE);

describe('WorkspaceOverviewPage currency error', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });
        const wideLayout: ResponsiveLayoutResult = {
            shouldUseNarrowLayout: false,
            isSmallScreenWidth: false,
            isInNarrowPaneModal: false,
            isExtraSmallScreenHeight: false,
            isMediumScreenWidth: false,
            isLargeScreenWidth: true,
            isExtraLargeScreenWidth: false,
            isExtraSmallScreenWidth: false,
            isSmallScreen: false,
            onboardingIsMediumOrLargerScreenWidth: true,
            isInLandscapeMode: false,
        };
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue(wideLayout);
        await TestHelper.signInWithTestUser(OWNER_ACCOUNT_ID, OWNER_EMAIL);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it('shows the error under the currency row when the server rejects a currency change', async () => {
        // Given a workspace whose currency change was rejected, so updateGeneralSettings' failure data left an error on outputCurrency
        await setupPolicy({errorFields: {outputCurrency: {[ERROR_KEY]: CURRENCY_ERROR_MESSAGE}}});

        // When the admin opens the workspace overview
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the error is shown under the currency row instead of the currency quietly reverting
        expect(queryCurrencyError()).toBeOnTheScreen();
    });

    it('keeps the workspace name as an unlimited heading and opens its editor', async () => {
        // Given an admin viewing a workspace with a long name.
        const name = 'Workspace with a long name that must stay readable';
        await setupPolicy({name});
        const navigate = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When the composed name row is pressed.
        fireEvent.press(screen.getByRole('link', {name: `Workspace name, ${name}`}), {nativeEvent: {}, preventDefault: jest.fn()});

        // Then the name retains heading semantics and the original rename destination.
        expect(screen.getByText(name)).toHaveProp('accessibilityRole', CONST.ROLE.HEADER);
        expect(screen.getByText(name)).toHaveProp('numberOfLines', 0);
        expect(navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_OVERVIEW_NAME.getRoute(POLICY_ID));
        navigate.mockRestore();
    });

    it('shows no currency error when the last currency change succeeded', async () => {
        // Given a workspace with no error left on its currency
        await setupPolicy({});

        // When the admin opens the workspace overview
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then no error appears, so the error above comes from outputCurrency and not from anything else on the page
        expect(queryCurrencyError()).not.toBeOnTheScreen();
    });
});
