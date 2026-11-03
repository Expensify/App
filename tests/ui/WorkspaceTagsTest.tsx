import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
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
import type Beta from '@src/types/onyx/Beta';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

TestHelper.setupGlobalFetchMock();

// The multi-level tags subtitle is rendered with RenderHTML, which can't build its tree under Jest.
jest.mock('react-native-render-html', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View: MockView} = require('react-native');
    return {
        RenderHTMLConfigProvider: ({children}: {children: React.ReactNode}) => children,
        RenderHTMLSource: () => <MockView />,
    };
});

const Stack = createPlatformStackNavigator<WorkspaceSplitNavigatorParamList>();

const renderPage = (initialRouteName: typeof SCREENS.WORKSPACE.TAGS, initialParams: WorkspaceSplitNavigatorParamList[typeof SCREENS.WORKSPACE.TAGS]) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <ModalProvider>
                    <NavigationContainer>
                        <Stack.Navigator initialRouteName={initialRouteName}>
                            <Stack.Screen
                                name={SCREENS.WORKSPACE.TAGS}
                                component={WorkspaceTagsPage}
                                initialParams={initialParams}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </ModalProvider>
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

// Levels are imported in Charlie, Bravo, Alpha order, which is the reverse of alphabetical order.
const MULTI_LEVEL_TAG_NAMES = ['Charlie', 'Bravo', 'Alpha'];

const multiLevelTags = {
    Charlie: {
        name: 'Charlie',
        required: false,
        orderWeight: 0,
        tags: {
            C1: {name: 'C1', enabled: true},
        },
    },
    Bravo: {
        name: 'Bravo',
        required: false,
        orderWeight: 1,
        tags: {
            B1: {name: 'B1', enabled: true},
            B2: {name: 'B2', enabled: true},
        },
    },
    Alpha: {
        name: 'Alpha',
        required: false,
        orderWeight: 2,
        tags: {
            A1: {name: 'A1', enabled: true},
            A2: {name: 'A2', enabled: true},
            A3: {name: 'A3', enabled: true},
        },
    },
};

const mockLayout = (shouldUseNarrowLayout: boolean) => {
    jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue(
        createMock<ResponsiveLayoutResult>({
            isSmallScreenWidth: shouldUseNarrowLayout,
            shouldUseNarrowLayout,
        }),
    );
};

const renderMultiLevelTagsPage = async () => {
    await TestHelper.signInWithTestUser();

    const policy = {
        ...LHNTestUtils.getFakePolicy(),
        role: CONST.POLICY.ROLE.ADMIN,
        areTagsEnabled: true,
        hasMultipleTagLists: true,
    };

    await act(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy.id}`, multiLevelTags);
    });

    const result = renderPage(SCREENS.WORKSPACE.TAGS, {policyID: policy.id});
    await waitForBatchedUpdatesWithAct();

    await waitFor(() => {
        expect(screen.getByText('Alpha')).toBeOnTheScreen();
    });

    return result;
};

const getRenderedTagLevelNames = () => screen.getAllByText(/^(Alpha|Bravo|Charlie)$/).map((element) => element.children.filter((child) => typeof child === 'string').join(''));

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
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue(
            createMock<ResponsiveLayoutResult>({
                isSmallScreenWidth: true,
                shouldUseNarrowLayout: true,
            }),
        );
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

        fireEvent(screen.getByText(FIRST_TAG), 'onLongPress');

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByText(TestHelper.translateLocal('common.select'))).toBeOnTheScreen();
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should show a blocking modal when trying to disable the only enabled tag when policy has requiresTag set to true', async () => {
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue(
            createMock<ResponsiveLayoutResult>({
                isSmallScreenWidth: false,
                shouldUseNarrowLayout: false,
            }),
        );

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

        const selectAll = screen.getAllByLabelText(TestHelper.translateLocal('workspace.common.selectAll')).at(0);

        if (!selectAll) {
            throw new Error('Select all button not found');
        }

        fireEvent.press(selectAll);

        const dropdownMenuButtonTestID = 'WorkspaceTagsPage-header-dropdown-menu-button';

        await waitFor(() => {
            expect(screen.getByTestId(dropdownMenuButtonTestID)).toBeOnTheScreen();
        });

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

    describe('Append custom tag list', () => {
        const connectedPolicy = {
            ...LHNTestUtils.getFakePolicy(),
            role: CONST.POLICY.ROLE.ADMIN,
            areTagsEnabled: true,
            connections: {
                [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {},
            },
        };

        const dependentMultiLevelTags = {
            ParentList: {
                name: 'ParentList',
                required: false,
                orderWeight: 0,
                tags: {
                    Parent: {name: 'Parent', enabled: true},
                },
            },
            ChildList: {
                name: 'ChildList',
                required: false,
                orderWeight: 1,
                tags: {
                    Child: {name: 'Child', enabled: true, rules: {parentTagsFilter: '^Parent$'}},
                },
            },
        };

        const renderAndOpenMoreMenu = async (policy: typeof connectedPolicy, policyTags: typeof tags | typeof dependentMultiLevelTags, betas: Beta[]) => {
            await TestHelper.signInWithTestUser();
            await act(async () => {
                await Onyx.set(ONYXKEYS.BETAS, betas);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy.id}`, policyTags);
            });

            const result = renderPage(SCREENS.WORKSPACE.TAGS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();

            await waitFor(() => {
                expect(screen.getByText(TestHelper.translateLocal('common.more'))).toBeOnTheScreen();
            });
            fireEvent.press(screen.getByText(TestHelper.translateLocal('common.more')));
            await waitForBatchedUpdatesWithAct();

            await waitFor(() => {
                expect(screen.getByText(TestHelper.translateLocal('spreadsheet.downloadCSV'))).toBeOnTheScreen();
            });
            return result;
        };

        it('should show the option for single-level tags on a workspace with an accounting connection and the indirectTagUploads beta', async () => {
            // Given a NetSuite workspace with single-level tags and an admin on the indirectTagUploads beta
            // When the admin opens the More menu
            const {unmount} = await renderAndOpenMoreMenu(connectedPolicy, tags, [CONST.BETAS.INDIRECT_TAG_UPLOADS]);

            // Then the option to append a custom tag list is offered, the same as Classic, while the regular import stays hidden
            expect(screen.getByText(TestHelper.translateLocal('workspace.tags.appendCustomTagList'))).toBeOnTheScreen();
            expect(screen.queryByText(TestHelper.translateLocal('spreadsheet.importSpreadsheet'))).not.toBeOnTheScreen();

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should not show the option for dependent multi-level tags', async () => {
            // Given a NetSuite workspace with dependent multi-level tags and an admin on the indirectTagUploads beta
            // When the admin opens the More menu
            const {unmount} = await renderAndOpenMoreMenu({...connectedPolicy, hasMultipleTagLists: true}, dependentMultiLevelTags, [CONST.BETAS.INDIRECT_TAG_UPLOADS]);

            // Then the option is hidden because a custom list can only be appended to single-level or independent multi-level tags
            expect(screen.queryByText(TestHelper.translateLocal('workspace.tags.appendCustomTagList'))).not.toBeOnTheScreen();

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should not show the option without the indirectTagUploads beta', async () => {
            // Given a NetSuite workspace with single-level tags and an admin who isn't on the indirectTagUploads beta
            // When the admin opens the More menu
            const {unmount} = await renderAndOpenMoreMenu(connectedPolicy, tags, []);

            // Then the option is hidden because the feature is gated by the beta
            expect(screen.queryByText(TestHelper.translateLocal('workspace.tags.appendCustomTagList'))).not.toBeOnTheScreen();

            unmount();
            await waitForBatchedUpdatesWithAct();
        });
    });

    describe('multi-level tags', () => {
        it('keeps the imported level order and disables sorting on wide layouts', async () => {
            // Given a wide layout and independent multi-level tags imported as Charlie, Bravo, Alpha
            mockLayout(false);

            // When the tags page renders
            const {unmount} = await renderMultiLevelTagsPage();

            // Then the levels stay in import order instead of being sorted alphabetically
            expect(getRenderedTagLevelNames()).toEqual(MULTI_LEVEL_TAG_NAMES);

            // And the Name and Count headers can't be pressed to re-sort the levels
            expect(screen.getByLabelText(TestHelper.translateLocal('common.name'))).toBeDisabled();
            expect(screen.getByLabelText(TestHelper.translateLocal('common.count'))).toBeDisabled();

            // And the Display button is hidden because no column can be sorted
            expect(screen.queryByText(TestHelper.translateLocal('search.display.label'))).not.toBeOnTheScreen();

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('keeps the imported level order and hides the Display button on narrow layouts', async () => {
            // Given a narrow layout, where the Display button is the only sort control
            mockLayout(true);

            // When the tags page renders independent multi-level tags imported as Charlie, Bravo, Alpha
            const {unmount} = await renderMultiLevelTagsPage();

            // Then the levels stay in import order
            expect(getRenderedTagLevelNames()).toEqual(MULTI_LEVEL_TAG_NAMES);

            // And the Display button is hidden, so the levels can't be re-sorted
            expect(screen.queryByLabelText(TestHelper.translateLocal('search.display.label'))).not.toBeOnTheScreen();

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('shows a row for each level when two levels share a name', async () => {
            // Given a no-header import with GL codes in adjacent columns, which returned two levels named "Sub-projects"
            // under the unique Onyx keys "Sub-projects" and "Sub-projects_2"
            mockLayout(false);
            await TestHelper.signInWithTestUser();
            const policy = {
                ...LHNTestUtils.getFakePolicy(),
                role: CONST.POLICY.ROLE.ADMIN,
                areTagsEnabled: true,
                hasMultipleTagLists: true,
            };
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy.id}`, {
                    Clients: {name: 'Clients', required: false, orderWeight: 0, tags: {Engineering: {name: 'Engineering', enabled: true}}},
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'Sub-projects': {name: 'Sub-projects', required: false, orderWeight: 1, tags: {'North America': {name: 'North America', enabled: true}}},
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'Sub-projects_2': {name: 'Sub-projects', required: false, orderWeight: 2, tags: {'Project Apollo': {name: 'Project Apollo', enabled: true}}},
                });
            });

            // When the tags page renders
            const {unmount} = renderPage(SCREENS.WORKSPACE.TAGS, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();

            // Then every level gets its own row, including both levels named "Sub-projects"
            await waitFor(() => {
                expect(screen.getByText('Clients')).toBeOnTheScreen();
            });
            expect(screen.getAllByText('Sub-projects')).toHaveLength(2);

            unmount();
            await waitForBatchedUpdatesWithAct();
        });
    });
});
