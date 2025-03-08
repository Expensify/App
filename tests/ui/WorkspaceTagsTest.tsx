import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxProvider from '@components/OnyxProvider';
import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';
import {translateLocal} from '@libs/Localize';
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

const Stack = createPlatformStackNavigator<WorkspaceSplitNavigatorParamList>();

const renderPage = (initialRouteName: typeof SCREENS.WORKSPACE.TAGS, initialParams: WorkspaceSplitNavigatorParamList[typeof SCREENS.WORKSPACE.TAGS]) => {
    return render(
        <ComposeProviders components={[OnyxProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
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

describe('WorkspaceTags', () => {
    const FIRST_TAG = 'tagOne';
    const SECOND_TAG = 'tagTwo';

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

    it('should show a blocking modal when trying to disable the only enabled tag when policy has requiresTag set to true', async () => {
        await TestHelper.signInWithTestUser();

        const policy = {
            ...LHNTestUtils.getFakePolicy(),
            role: CONST.POLICY.ROLE.ADMIN,
            areTagsEnabled: true,
            requiresTag: true,
        };

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

        const dropdownMenuButtonTestID = `${WorkspaceTagsPage.displayName}-header-dropdown-menu-button`;

        await waitFor(() => {
            expect(screen.getByTestId(dropdownMenuButtonTestID)).toBeOnTheScreen();
        });

        const dropdownButton = screen.getByTestId(dropdownMenuButtonTestID);
        fireEvent.press(dropdownButton);

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            const disableText = translateLocal('workspace.tags.disableTags');
            expect(screen.getByText(disableText)).toBeOnTheScreen();
        });

        const disableMenuItem = screen.getByTestId('PopoverMenuItem-Disable tags');
        expect(disableMenuItem).toBeOnTheScreen();

        const mockEvent = {
            nativeEvent: {},
            type: 'press',
            target: disableMenuItem,
            currentTarget: disableMenuItem,
        };
        fireEvent.press(disableMenuItem, mockEvent);

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            const blockingPrompt = translateLocal('workspace.tags.cannotDisableAllTags.title');
            expect(screen.getByText(blockingPrompt)).toBeOnTheScreen();
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});
