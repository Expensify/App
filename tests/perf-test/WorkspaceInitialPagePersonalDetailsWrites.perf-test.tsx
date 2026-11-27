import {act, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';

import WorkspaceInitialScreen from '@pages/workspace/WorkspaceInitialPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {PersonalDetailsList} from '@src/types/onyx/PersonalDetails';
import type {PolicyEmployeeList} from '@src/types/onyx/PolicyEmployee';

import type ReactNative from 'react-native';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {measureRenders} from 'reassure';

import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@src/components/ConfirmedRoute.tsx');
jest.mock('@src/libs/Log');

jest.mock('react-native-render-html', () => {
    const {View: MockView} = jest.requireActual<typeof ReactNative>('react-native');
    return {
        RenderHTMLConfigProvider: ({children}: {children: React.ReactNode}) => children,
        RenderHTMLSource: () => <MockView />,
    };
});

TestHelper.setupGlobalFetchMock();

const POLICY_ID = 'workspace-pd-writes-perf-test';
const OWNER_EMAIL = 'test@user.com';
const OWNER_ACCOUNT_ID = 1;
const MEMBER_COUNT = 50;
const WRITES_PER_SCENARIO = 10;
const UNRELATED_ACCOUNT_ID = 999999;

const Stack = createPlatformStackNavigator<WorkspaceSplitNavigatorParamList>();

function buildWorkspaceData(): {employeeList: PolicyEmployeeList; personalDetails: PersonalDetailsList} {
    const employeeList: PolicyEmployeeList = {
        [OWNER_EMAIL]: {email: OWNER_EMAIL, role: CONST.POLICY.ROLE.ADMIN},
    };
    const personalDetails: PersonalDetailsList = {
        [OWNER_ACCOUNT_ID]: TestHelper.buildPersonalDetails(OWNER_EMAIL, OWNER_ACCOUNT_ID, 'Owner'),
        [UNRELATED_ACCOUNT_ID]: TestHelper.buildPersonalDetails('unrelated@example.com', UNRELATED_ACCOUNT_ID, 'Unrelated'),
    };

    for (let index = 1; index <= MEMBER_COUNT; index++) {
        const memberEmail = `member${index}@example.com`;
        const memberAccountID = 1000 + index;
        employeeList[memberEmail] = {email: memberEmail, role: CONST.POLICY.ROLE.USER};
        personalDetails[memberAccountID] = TestHelper.buildPersonalDetails(memberEmail, memberAccountID, `Member ${index}`);
    }

    return {employeeList, personalDetails};
}

const renderPage = () => (
    <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
        <PortalProvider>
            <ModalProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={SCREENS.WORKSPACE.INITIAL}>
                        <Stack.Screen
                            name={SCREENS.WORKSPACE.INITIAL}
                            component={WorkspaceInitialScreen}
                            initialParams={{policyID: POLICY_ID}}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </ModalProvider>
        </PortalProvider>
    </ComposeProviders>
);

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

// Reassure runs the scenario several times against one seeded Onyx, so every run writes names that don't exist yet
let run = 0;
const renameUnrelatedUser = async () => {
    for (let index = 0; index < WRITES_PER_SCENARIO; index++) {
        const displayName = `Unrelated ${run}-${index}`;
        // eslint-disable-next-line no-await-in-loop -- each rename must flush before the next so Reassure records one render per write
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[UNRELATED_ACCOUNT_ID]: {displayName}});
        });
    }
    run++;
};

beforeAll(() => {
    Onyx.init({keys: ONYXKEYS});
});

beforeEach(async () => {
    jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue(wideLayout);
    const {employeeList, personalDetails} = buildWorkspaceData();
    await TestHelper.signInWithTestUser(OWNER_ACCOUNT_ID, OWNER_EMAIL);
    await act(async () => {
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
            ...LHNTestUtils.getFakePolicy(POLICY_ID),
            type: CONST.POLICY.TYPE.CORPORATE,
            role: CONST.POLICY.ROLE.ADMIN,
            owner: OWNER_EMAIL,
            ownerAccountID: OWNER_ACCOUNT_ID,
            outputCurrency: 'USD',
            employeeList,
        });
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
    });
});

afterEach(async () => {
    await act(async () => {
        await Onyx.clear();
    });
    jest.clearAllMocks();
});

test('[WorkspaceInitialPage] should not re-render the workspace menu when a user outside the workspace is renamed', async () => {
    const scenario = async () => {
        // Given the workspace menu, which stays mounted while the admin moves between workspace pages, has rendered
        await waitForBatchedUpdatesWithAct();
        await screen.findByText('Members');

        // When a user who is not in the workspace is renamed 10 times
        await renameUnrelatedUser();
    };

    // Then Reassure records how much the menu re-renders for writes it doesn't use
    await measureRenders(renderPage(), {scenario});
});
