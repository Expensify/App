import {act, fireEvent, render, screen, waitFor, within} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import TableRow from '@components/Table/TableRow';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';

import WorkspaceTagsPage from '@pages/workspace/tags/WorkspaceTagsPage';

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
const Stack = createPlatformStackNavigator<WorkspaceSplitNavigatorParamList>();
const FIRST_TAG = 'Tag One';
const SECOND_TAG = 'Tag Two';
const RENAMED_TAG = 'Tag Renamed';

function renderPage(policyID: string) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <ModalProvider>
                    <NavigationContainer>
                        <Stack.Navigator initialRouteName={SCREENS.WORKSPACE.TAGS}>
                            <Stack.Screen
                                name={SCREENS.WORKSPACE.TAGS}
                                component={WorkspaceTagsPage}
                                initialParams={{policyID}}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </ModalProvider>
            </PortalProvider>
        </ComposeProviders>,
    );
}

describe('WorkspaceTagsPage selection migration', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));
    beforeEach(async () => {
        await TestHelper.signInWithTestUser();
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue(createMock<ResponsiveLayoutResult>({isSmallScreenWidth: false, shouldUseNarrowLayout: false}));
    });
    afterEach(async () => {
        await act(async () => Onyx.clear());
        jest.clearAllMocks();
    });

    it('migrates a selected renamed tag, then drops the selection when that tag is deleted', async () => {
        // Given two producer-shaped single-level tags on an editable policy.
        const policy = {...LHNTestUtils.getFakePolicy(), role: CONST.POLICY.ROLE.ADMIN, areTagsEnabled: true, requiresTag: true};
        const tagsKey = `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy.id}` as const;
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.merge(tagsKey, {
                TagListOne: {name: 'TagListOne', required: true, orderWeight: 1, tags: {[FIRST_TAG]: {name: FIRST_TAG, enabled: true}, [SECOND_TAG]: {name: SECOND_TAG, enabled: true}}},
            });
        });
        const {unmount} = renderPage(policy.id);
        expect(await screen.findByText(FIRST_TAG)).toBeOnTheScreen();
        // When the first row is selected and the rename producer moves its Onyx key.
        const firstSelectControl = screen.getAllByLabelText(TestHelper.translateLocal('common.select')).at(0);
        if (!firstSelectControl) {
            throw new Error('First tag selection control was not rendered');
        }
        fireEvent.press(firstSelectControl);
        expect(await screen.findByText(TestHelper.translateLocal('workspace.common.selected', {count: 1}))).toBeOnTheScreen();
        await act(async () => Onyx.merge(tagsKey, {TagListOne: {tags: {[FIRST_TAG]: null, [RENAMED_TAG]: {name: RENAMED_TAG, enabled: true, previousTagName: FIRST_TAG}}}}));
        // Then the new row remains selected and the old row disappears.
        expect(await screen.findByText(RENAMED_TAG)).toBeOnTheScreen();
        expect(screen.queryByText(FIRST_TAG)).toBeNull();
        expect(screen.getByText(TestHelper.translateLocal('workspace.common.selected', {count: 1}))).toBeOnTheScreen();
        const renamedRow = screen.UNSAFE_getAllByType(TableRow).find((row) => {
            const label: unknown = row.props.accessibilityLabel;
            return typeof label === 'string' && label.includes(RENAMED_TAG);
        });
        expect(renamedRow).toBeDefined();
        if (!renamedRow) {
            throw new Error('Renamed tag row was not rendered');
        }
        const checkboxState: unknown = within(renamedRow).getByLabelText(TestHelper.translateLocal('common.select')).props.accessibilityState;
        expect(checkboxState).toMatchObject({checked: true});
        await act(async () => Onyx.merge(tagsKey, {TagListOne: {tags: {[RENAMED_TAG]: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}}}}));
        await waitFor(() => expect(screen.queryByText(TestHelper.translateLocal('workspace.common.selected', {count: 1}))).toBeNull());
        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('disables selection for multi-level tag lists', async () => {
        // Given two tag lists, which activate multi-level mode.
        const policy = {...LHNTestUtils.getFakePolicy(), role: CONST.POLICY.ROLE.ADMIN, areTagsEnabled: true};
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy.id}`, {
                First: {name: 'First', orderWeight: 1, tags: {[FIRST_TAG]: {name: FIRST_TAG, enabled: true}}},
                Second: {name: 'Second', orderWeight: 2, tags: {[SECOND_TAG]: {name: SECOND_TAG, enabled: true}}},
            });
        });
        const {unmount} = renderPage(policy.id);
        // When the real table renders multi-level rows, both lists should appear.
        // Then selection controls are absent because multi-level lists do not support selection.
        expect((await screen.findAllByText('First')).length).toBeGreaterThan(0);
        expect(screen.queryByLabelText(TestHelper.translateLocal('common.select'))).toBeNull();
        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('keeps a multi-level list row pending for child and list actions until both clear', async () => {
        // Given two producer-shaped tag lists with a pending child update on First.
        const policy = {...LHNTestUtils.getFakePolicy(), role: CONST.POLICY.ROLE.ADMIN, areTagsEnabled: true};
        const tagsKey = `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy.id}` as const;
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.merge(tagsKey, {
                First: {name: 'First', orderWeight: 1, tags: {[FIRST_TAG]: {name: FIRST_TAG, enabled: true, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}}},
                Second: {name: 'Second', orderWeight: 2, tags: {[SECOND_TAG]: {name: SECOND_TAG, enabled: true}}},
            });
        });
        const {unmount} = renderPage(policy.id);
        const firstListFeedback = () =>
            screen.UNSAFE_getAllByType(OfflineWithFeedback).find((instance) => within(instance).queryByText('First') !== null && within(instance).queryByText('Second') === null);

        // When only the child has a pending action, the real First row receives UPDATE.
        await waitFor(() => {
            expect(firstListFeedback()).toBeDefined();
            expect(firstListFeedback()?.props.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
        });
        const firstRow = firstListFeedback();
        expect(firstRow).toBeDefined();
        if (!firstRow) {
            throw new Error('First list row was not rendered');
        }
        expect(within(firstRow).getByText('First')).toBeOnTheScreen();

        // When the child clears and the list has a pending ADD, the same row remains UPDATE.
        await act(async () => Onyx.merge(tagsKey, {First: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD, tags: {[FIRST_TAG]: {pendingAction: null}}}}));
        await waitFor(() => {
            expect(firstListFeedback()).toBeDefined();
            expect(firstListFeedback()?.props.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
        });

        // Then clearing the list action leaves the row without a pending action.
        await act(async () => Onyx.merge(tagsKey, {First: {pendingAction: null}}));
        await waitFor(() => {
            expect(firstListFeedback()).toBeDefined();
            expect(firstListFeedback()?.props.pendingAction).toBeUndefined();
        });
        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});
