import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ScreenWrapperStatusContext from '@components/ScreenWrapper/ScreenWrapperStatusContext';
import type {WorkspaceTagTableRowData} from '@components/Tables/WorkspaceTagsTable';
import WorkspaceViewTagsTable from '@components/Tables/WorkspaceViewTagsTable';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const ENABLED_TAG = 'Travel';
const DISABLED_TAG = 'Meals';

// Filter option values wired up in WorkspaceViewTagsTable's `filterConfig`.
const STATUS_ENABLED = 'enabled';
const STATUS_DISABLED = 'disabled';

const NARROW_LAYOUT: ResponsiveLayoutResult = {
    shouldUseNarrowLayout: true,
    isSmallScreenWidth: true,
    isInNarrowPaneModal: false,
    isExtraSmallScreenHeight: false,
    isMediumScreenWidth: false,
    isLargeScreenWidth: false,
    isExtraLargeScreenWidth: false,
    isExtraSmallScreenWidth: false,
    isSmallScreen: true,
    onboardingIsMediumOrLargerScreenWidth: false,
    isInLandscapeMode: false,
};

const buildTag = (name: string, enabled: boolean): WorkspaceTagTableRowData => ({
    keyForList: name,
    value: name,
    name,
    enabled,
    isLocked: false,
    showEnabledSwitch: true,
    showRequiredSwitch: false,
    action: jest.fn(),
    onClose: jest.fn(),
});

// WorkspaceViewTagsTable is normally hosted inside a ScreenWrapper; its rows read the screen transition status,
// so provide a stubbed context indicating the transition has already finished.
const SCREEN_WRAPPER_STATUS = {didScreenTransitionEnd: true, isSafeAreaTopPaddingApplied: true, isSafeAreaBottomPaddingApplied: true};

function TestWrapper({tags, hasDependentTags}: {tags: WorkspaceTagTableRowData[]; hasDependentTags: boolean}) {
    return (
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <ModalProvider>
                    <NavigationContainer>
                        <ScreenWrapperStatusContext.Provider value={SCREEN_WRAPPER_STATUS}>
                            <WorkspaceViewTagsTable
                                tags={tags}
                                hasDependentTags={hasDependentTags}
                                selectionEnabled={false}
                                selectedKeys={[]}
                                onRowSelectionChange={jest.fn()}
                            />
                        </ScreenWrapperStatusContext.Provider>
                    </NavigationContainer>
                </ModalProvider>
            </PortalProvider>
        </ComposeProviders>
    );
}

const renderTable = (tags: WorkspaceTagTableRowData[], hasDependentTags: boolean) =>
    render(
        <TestWrapper
            tags={tags}
            hasDependentTags={hasDependentTags}
        />,
    );

const openStatusFilter = async () => {
    fireEvent.press(screen.getByLabelText(TestHelper.translateLocal('search.filtersHeader')));
    await waitForBatchedUpdatesWithAct();
    await waitFor(() => {
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}${STATUS_ENABLED}`)).toBeOnTheScreen();
    });
};

const applyStatus = async (statusValue: string) => {
    fireEvent.press(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}${statusValue}`));
    await waitForBatchedUpdatesWithAct();
    fireEvent.press(screen.getByText(TestHelper.translateLocal('common.apply')));
    await waitForBatchedUpdatesWithAct();
};

describe('WorkspaceViewTagsTable', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });
        // Use the narrow layout so the filter popover positions itself synchronously (the wide layout defers on
        // native `measureInWindow`, whose callback never fires under react-test-renderer).
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue(NARROW_LAYOUT);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it('offers the Status filter for non-dependent tags and hides it for dependent tags', async () => {
        const {rerender, unmount} = renderTable([buildTag(ENABLED_TAG, true), buildTag(DISABLED_TAG, false)], false);
        await waitForBatchedUpdatesWithAct();

        // The Status filter trigger is available when the enabled column is shown (non-dependent tags).
        expect(screen.getByLabelText(TestHelper.translateLocal('search.filtersHeader'))).toBeOnTheScreen();

        // Dependent tags hide the enabled column/switch, so no Status filter should be offered there.
        rerender(
            <TestWrapper
                tags={[buildTag(ENABLED_TAG, true), buildTag(DISABLED_TAG, false)]}
                hasDependentTags
            />,
        );
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByLabelText(TestHelper.translateLocal('search.filtersHeader'))).toBeNull();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('filters rows by Enabled / Disabled status and restores all rows when reset', async () => {
        const {unmount} = renderTable([buildTag(ENABLED_TAG, true), buildTag(DISABLED_TAG, false)], false);
        await waitForBatchedUpdatesWithAct();

        // Both tags are visible before any filter is applied.
        expect(screen.getByText(ENABLED_TAG)).toBeOnTheScreen();
        expect(screen.getByText(DISABLED_TAG)).toBeOnTheScreen();

        // Selecting "Disabled" leaves only the disabled tag.
        await openStatusFilter();
        await applyStatus(STATUS_DISABLED);
        expect(screen.getByText(DISABLED_TAG)).toBeOnTheScreen();
        expect(screen.queryByText(ENABLED_TAG)).toBeNull();

        // Selecting "Enabled" leaves only the enabled tag.
        await openStatusFilter();
        await applyStatus(STATUS_ENABLED);
        expect(screen.getByText(ENABLED_TAG)).toBeOnTheScreen();
        expect(screen.queryByText(DISABLED_TAG)).toBeNull();

        // Resetting the filter restores every tag.
        await openStatusFilter();
        fireEvent.press(screen.getByText(TestHelper.translateLocal('common.reset')));
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText(ENABLED_TAG)).toBeOnTheScreen();
        expect(screen.getByText(DISABLED_TAG)).toBeOnTheScreen();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});
