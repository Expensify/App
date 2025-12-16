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
import WorkspaceTagsPage from '@pages/workspace/tags/WorkspaceTagsPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

TestHelper.setupGlobalFetchMock();

jest.unmock('react-native-reanimated');
jest.unmock('react-native-worklets');

const Stack = createPlatformStackNavigator<WorkspaceSplitNavigatorParamList>();

const renderPage = (initialRouteName: typeof SCREENS.WORKSPACE.TAGS, initialParams: WorkspaceSplitNavigatorParamList[typeof SCREENS.WORKSPACE.TAGS]) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
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

const FIRST_TAG = 'Tag One';
const SECOND_TAG = 'Tag Two';

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

describe('WorkspaceTags', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });
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
            expect(screen.getByText(TestHelper.translateLocal('common.select'))).toBeOnTheScreen();
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should show a blocking modal when trying to disable the only enabled tag when policy has requiresTag set to true', async () => {
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue({
            isSmallScreenWidth: false,
            shouldUseNarrowLayout: false,
        } as ResponsiveLayoutResult);

        await TestHelper.signInWithTestUser();

        const policy = {
            ...LHNTestUtils.getFakePolicy(),
            role: CONST.POLICY.ROLE.ADMIN,
            areTagsEnabled: true,
            requiresTag: true,
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

        fireEvent.press(screen.getByTestId(`TableListItemCheckbox-${FIRST_TAG}`));
        fireEvent.press(screen.getByTestId(`TableListItemCheckbox-${SECOND_TAG}`));

        const dropdownMenuButtonTestID = 'WorkspaceTagsPage-header-dropdown-menu-button';

        fireEvent.press(screen.getByTestId(dropdownMenuButtonTestID));
        await waitFor(() => {
            expect(screen.getByText(TestHelper.translateLocal('workspace.tags.disableTags'))).toBeOnTheScreen();
        });

        const disableMenuItem = screen.getByTestId('PopoverMenuItem-Disable tags');
        const mockEvent = {nativeEvent: {}, type: 'press', target: disableMenuItem, currentTarget: disableMenuItem};
        fireEvent.press(disableMenuItem, mockEvent);

        await waitFor(() => {
            expect(screen.getByText(TestHelper.translateLocal('workspace.tags.cannotDeleteOrDisableAllTags.title'))).toBeOnTheScreen();
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});
