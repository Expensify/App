/* eslint-disable @typescript-eslint/naming-convention */
import {act, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import type {SettingsNavigatorParamList} from '@navigation/types';

import DynamicWorkspaceViewTagsPage from '@pages/workspace/tags/DynamicWorkspaceViewTagsPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

TestHelper.setupGlobalFetchMock();

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

const renderPage = (initialParams: SettingsNavigatorParamList[typeof SCREENS.WORKSPACE.DYNAMIC_TAG_LIST_VIEW]) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <ModalProvider>
                    <NavigationContainer>
                        <Stack.Navigator initialRouteName={SCREENS.WORKSPACE.DYNAMIC_TAG_LIST_VIEW}>
                            <Stack.Screen
                                name={SCREENS.WORKSPACE.DYNAMIC_TAG_LIST_VIEW}
                                component={DynamicWorkspaceViewTagsPage}
                                initialParams={initialParams}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </ModalProvider>
            </PortalProvider>
        </ComposeProviders>,
    );
};

// A no-header import of independent tags with GL codes in adjacent columns can return tag lists that share a name.
// Their Onyx keys and orderWeights stay unique.
const tagListsWithDuplicateNames = {
    Clients: {
        name: 'Clients',
        required: false,
        orderWeight: 0,
        tags: {
            Engineering: {name: 'Engineering', enabled: true, 'GL Code': '100'},
        },
    },
    'Sub-projects': {
        name: 'Sub-projects',
        required: false,
        orderWeight: 1,
        tags: {
            'North America': {name: 'North America', enabled: true, 'GL Code': '200'},
        },
    },
    'Sub-projects_2': {
        name: 'Sub-projects',
        required: false,
        orderWeight: 2,
        tags: {
            'Project Apollo': {name: 'Project Apollo', enabled: true, 'GL Code': '300'},
        },
    },
};

describe('DynamicWorkspaceViewTagsPage', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
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
        jest.clearAllMocks();
    });

    it('shows the tags of the list at the given orderWeight when another list has the same name', async () => {
        // Given a workspace whose tag lists at orderWeight 1 and 2 are both named "Sub-projects"
        await TestHelper.signInWithTestUser();
        const policy = {
            ...LHNTestUtils.getFakePolicy(),
            role: CONST.POLICY.ROLE.ADMIN,
            areTagsEnabled: true,
            hasMultipleTagLists: true,
        };
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy.id}`, tagListsWithDuplicateNames);
        });

        // When the list at orderWeight 2 is opened
        const {unmount} = renderPage({policyID: policy.id, orderWeight: 2});
        await waitForBatchedUpdatesWithAct();

        // Then it shows the tags stored under "Sub-projects_2", not the tags of the first "Sub-projects" list
        await waitFor(() => {
            expect(screen.getByText('Project Apollo')).toBeOnTheScreen();
        });
        expect(screen.queryByText('North America')).not.toBeOnTheScreen();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});
