import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import ImportTagsOptionsPage from '@pages/workspace/tags/ImportTagsOptionsPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

TestHelper.setupGlobalFetchMock();

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    setNavigationActionToMicrotaskQueue: jest.fn((callback: () => void) => callback?.()),
    dismissModal: jest.fn(),
    isTopmostRouteModalScreen: jest.fn(() => false),
}));

jest.mock('@libs/actions/Policy/Tag', () => {
    const actual: Record<string, unknown> = jest.requireActual('@libs/actions/Policy/Tag');
    return {
        ...actual,
        cleanPolicyTags: jest.fn(),
    };
});

// Auto-confirm any showConfirmModal call so we can test the post-confirmation navigation
// without depending on modal hide animations firing in jest.
jest.mock('@hooks/useConfirmModal', () => ({
    __esModule: true,
    default: () => ({
        showConfirmModal: jest.fn().mockResolvedValue({action: 'CONFIRM'}),
        showModal: jest.fn(),
        closeModal: jest.fn(),
    }),
}));

const renderPage = (initialParams: SettingsNavigatorParamList[typeof SCREENS.WORKSPACE.TAGS_IMPORT_OPTIONS]) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <ModalProvider>
                    <NavigationContainer>
                        <ImportTagsOptionsPage
                            route={{
                                key: SCREENS.WORKSPACE.TAGS_IMPORT_OPTIONS,
                                name: SCREENS.WORKSPACE.TAGS_IMPORT_OPTIONS,
                                params: initialParams,
                            }}
                            navigation={{} as never}
                        />
                    </NavigationContainer>
                </ModalProvider>
            </PortalProvider>
        </ComposeProviders>,
    );
};

const singleLevelTags = {
    Tag: {
        name: 'Tag',
        orderWeight: 0,
        required: false,
        tags: {
            Existing: {name: 'Existing', enabled: true},
        },
    },
};

describe('ImportTagsOptionsPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });
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

    it('navigates to upgrade page when "Multi-level tags" is selected on a Collect workspace', async () => {
        await TestHelper.signInWithTestUser();

        const policy = {
            ...LHNTestUtils.getFakePolicy(),
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.ADMIN,
            areTagsEnabled: true,
        };

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy.id}`, singleLevelTags);
        });

        const {unmount} = renderPage({policyID: policy.id});
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByLabelText(TestHelper.translateLocal('workspace.tags.tagLevel.multiLevel'))).toBeOnTheScreen();
        });

        const multiLevelMenu = screen.getByLabelText(TestHelper.translateLocal('workspace.tags.tagLevel.multiLevel'));
        const mockEvent = {nativeEvent: {}, type: 'press', target: multiLevelMenu, currentTarget: multiLevelMenu};
        fireEvent.press(multiLevelMenu, mockEvent);
        await waitForBatchedUpdatesWithAct();

        const navigateMock = Navigation.navigate as jest.Mock;
        const wasUpgradeNavigation = navigateMock.mock.calls.some(([route]: [string]) => typeof route === 'string' && route.includes('upgrade'));
        expect(wasUpgradeNavigation).toBe(true);

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('navigates to import page after confirming "Switch Tag Levels"', async () => {
        await TestHelper.signInWithTestUser();

        // Control workspace so the "Multi-level tags" option skips the upgrade flow
        // and goes straight to the switch-tag-levels confirmation modal because
        // single-level tags already exist on the workspace.
        const policy = {
            ...LHNTestUtils.getFakePolicy(),
            type: CONST.POLICY.TYPE.CORPORATE,
            role: CONST.POLICY.ROLE.ADMIN,
            areTagsEnabled: true,
        };

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy.id}`, singleLevelTags);
        });

        const {unmount} = renderPage({policyID: policy.id});
        await waitForBatchedUpdatesWithAct();

        const multiLevelMenu = screen.getByLabelText(TestHelper.translateLocal('workspace.tags.tagLevel.multiLevel'));
        fireEvent.press(multiLevelMenu, {nativeEvent: {}, type: 'press', target: multiLevelMenu, currentTarget: multiLevelMenu});
        await waitForBatchedUpdatesWithAct();
        await waitForBatchedUpdatesWithAct();

        // Regression: after confirming, navigation to the import page must run (via microtask queue after cleanPolicyTags).
        const importRoute = ROUTES.WORKSPACE_TAGS_IMPORT.getRoute(policy.id);
        expect(Navigation.setNavigationActionToMicrotaskQueue).toHaveBeenCalled();
        expect(Navigation.navigate).toHaveBeenCalledWith(importRoute);

        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});
