import {act, fireEvent, render, screen} from '@testing-library/react-native';

import HeaderWithBackButton from '@components/HeaderWithBackButton';
import SelectionList from '@components/SelectionList';
import TestToolMenu from '@components/TestToolMenu';

import type {ActiveServerState} from '@libs/ApiUtils';
import {isQAAuthConfigured} from '@libs/CloudflareAccess/Config';
import Navigation from '@libs/Navigation/Navigation';
import type navigationRef from '@libs/Navigation/navigationRef';

import ServerSelector from '@pages/settings/Troubleshoot/ServerSelector';

import toggleTestToolsModal from '@userActions/TestTool';
import {setActiveServer} from '@userActions/User';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {ValueOf} from 'type-fest';

import React from 'react';

import createMock from '../utils/createMock';

// jest.mock factories cannot close over non-`mock`-prefixed module scope
const mockQAServer = CONST.SERVER.QA;
let mockActiveServer: ValueOf<typeof CONST.SERVER> = CONST.SERVER.PRODUCTION;
let mockIsPinnedByEnvironment = false;

jest.mock('@hooks/useActiveServer', () => ({
    __esModule: true,
    default: (): ActiveServerState => ({activeServer: mockActiveServer, isPinnedByEnvironment: mockIsPinnedByEnvironment}),
}));

jest.mock('@libs/ApiUtils', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/ApiUtils'),
    getActiveServer: () => mockActiveServer,
    isQAServerActive: () => mockActiveServer === mockQAServer,
    getCommandURL: () => 'https://test-api.expensify.com/api/Ping?',
}));

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: () => [undefined, {status: 'loaded'}],
}));

jest.mock('@libs/CloudflareAccess/Config', () => ({isQAAuthConfigured: jest.fn()}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));

jest.mock('@src/CONFIG', () => ({
    __esModule: true,
    default: {...jest.requireActual<{default: Record<string, unknown>}>('@src/CONFIG').default, IS_USING_LOCAL_WEB: false},
}));

jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {navigate: jest.fn(), goBack: jest.fn(), pop: jest.fn(), getActiveRoute: jest.fn(() => '/test-tools')},
}));

type RootState = ReturnType<NonNullable<typeof navigationRef.current>['getRootState']>;

const mockGetRootState = jest.fn<RootState | undefined, []>();

jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    // The factory is hoisted above mockGetRootState's initialization, so it has to be read at call time
    default: {current: {getRootState: () => mockGetRootState()}},
}));
jest.mock('@userActions/User', () => ({
    setActiveServer: jest.fn(),
    setIsDebugModeEnabled: jest.fn(),
    setShouldShowBranchNameInTitle: jest.fn(),
}));

const getSelectionListProps = () => {
    const props = jest.mocked(SelectionList).mock.calls.at(-1)?.at(0);
    if (!props) {
        throw new Error('SelectionList was never rendered');
    }
    return props;
};

const getConfirmButtonOptions = () => {
    const confirmButtonOptions = getSelectionListProps().confirmButtonOptions;
    if (!confirmButtonOptions) {
        throw new Error('SelectionList was rendered without a confirm button');
    }
    return confirmButtonOptions;
};

const pressBack = () => {
    const onBackButtonPress = jest.mocked(HeaderWithBackButton).mock.calls.at(-1)?.at(0)?.onBackButtonPress;
    if (!onBackButtonPress) {
        throw new Error('The header was rendered without an onBackButtonPress');
    }
    onBackButtonPress();
};

const pressSave = () => {
    const {onConfirm} = getConfirmButtonOptions();
    if (!onConfirm) {
        throw new Error('The confirm button was rendered without an onConfirm');
    }
    onConfirm();
};

const ROOT_STATE_KEY = 'stack-root';

const mockTestToolsModalState = (backTo?: string) => {
    mockGetRootState.mockReturnValue(
        createMock<RootState>({
            key: ROOT_STATE_KEY,
            routes: [
                {
                    name: NAVIGATORS.TEST_TOOLS_MODAL_NAVIGATOR,
                    state: {routes: [{name: SCREENS.TEST_TOOLS_MODAL.ROOT, params: backTo ? {backTo} : undefined}]},
                },
            ],
        }),
    );
};

describe('Server selection', () => {
    beforeEach(() => {
        mockActiveServer = CONST.SERVER.PRODUCTION;
        mockIsPinnedByEnvironment = false;
        jest.clearAllMocks();
        jest.mocked(isQAAuthConfigured).mockReturnValue(false);
    });

    describe('the server row in the test tools', () => {
        it('shows the active server and opens the route it was given', () => {
            mockActiveServer = CONST.SERVER.STAGING;
            render(<TestToolMenu serverPageRoute={ROUTES.TEST_TOOLS_SERVER} />);

            expect(screen.getByText('initialSettingsPage.troubleshoot.servers.staging.label')).toBeOnTheScreen();

            fireEvent.press(screen.getByLabelText('initialSettingsPage.troubleshoot.server'));
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.TEST_TOOLS_SERVER);
        });

        it('no longer renders a staging toggle, so the server is only changed from the page', () => {
            render(<TestToolMenu serverPageRoute={ROUTES.SETTINGS_TROUBLESHOOT_SERVER} />);

            expect(screen.getByLabelText('initialSettingsPage.troubleshoot.server')).toBeOnTheScreen();
            expect(screen.queryByText('initialSettingsPage.troubleshoot.useStagingServer')).not.toBeOnTheScreen();
        });

        it('states the pinned server without offering the page, so a QA build cannot advertise a choice it ignores', () => {
            mockActiveServer = CONST.SERVER.QA;
            mockIsPinnedByEnvironment = true;
            render(<TestToolMenu serverPageRoute={ROUTES.TEST_TOOLS_SERVER} />);

            expect(screen.getByText('initialSettingsPage.troubleshoot.servers.qa.label')).toBeOnTheScreen();
            expect(screen.queryByLabelText('initialSettingsPage.troubleshoot.server')).not.toBeOnTheScreen();
            expect(Navigation.navigate).not.toHaveBeenCalled();
        });
    });

    describe('the server selector', () => {
        it('offers production and staging, with the active one selected', () => {
            mockActiveServer = CONST.SERVER.STAGING;
            render(<ServerSelector />);

            const {data} = getSelectionListProps();
            expect(data.map((item) => item.keyForList)).toEqual([CONST.SERVER.PRODUCTION, CONST.SERVER.STAGING]);
            expect(data.find((item) => item.isSelected)?.keyForList).toBe(CONST.SERVER.STAGING);
        });

        it('keeps Save disabled until a different server is picked', () => {
            render(<ServerSelector />);
            expect(getConfirmButtonOptions().isDisabled).toBe(true);

            act(() => getSelectionListProps().onSelectRow({keyForList: CONST.SERVER.STAGING}));

            expect(getConfirmButtonOptions().isDisabled).toBe(false);
        });

        it('stores the picked server on Save and leaves the page, so the pick does not need a second press to dismiss', () => {
            render(<ServerSelector />);
            act(() => getSelectionListProps().onSelectRow({keyForList: CONST.SERVER.STAGING}));
            pressSave();

            expect(setActiveServer).toHaveBeenCalledWith(CONST.SERVER.STAGING);
            expect(Navigation.goBack).toHaveBeenCalledWith();
        });

        it('drops the pick when the back caret is used, so only Save commits', () => {
            render(<ServerSelector />);
            act(() => getSelectionListProps().onSelectRow({keyForList: CONST.SERVER.STAGING}));
            expect(getSelectionListProps().data.find((item) => item.isSelected)?.keyForList).toBe(CONST.SERVER.STAGING);

            pressBack();

            expect(setActiveServer).not.toHaveBeenCalled();
            expect(Navigation.goBack).toHaveBeenCalledWith();
        });

        it('reports every server as fixed on a build that pins one, the pinned server included', () => {
            mockActiveServer = CONST.SERVER.QA;
            mockIsPinnedByEnvironment = true;
            render(<ServerSelector />);

            const {data, isDisabled, customListHeaderContent} = getSelectionListProps();
            expect(data.map((item) => item.keyForList)).toEqual([CONST.SERVER.PRODUCTION, CONST.SERVER.STAGING, CONST.SERVER.QA]);
            expect(isDisabled).toBe(true);
            expect(data.find((item) => item.isSelected)?.keyForList).toBe(CONST.SERVER.QA);
            expect(customListHeaderContent).toBeTruthy();
            expect(getConfirmButtonOptions().showButton).toBe(false);
        });

        it('offers QA as a third option once its auth is configured', () => {
            jest.mocked(isQAAuthConfigured).mockReturnValue(true);
            render(<ServerSelector />);

            expect(getSelectionListProps().data.map((item) => item.keyForList)).toEqual([CONST.SERVER.PRODUCTION, CONST.SERVER.STAGING, CONST.SERVER.QA]);
        });
    });

    describe('dismissing the test tools modal', () => {
        // toggleTestToolsModal is throttled at module scope, so each toggle needs the window advanced past
        beforeEach(() => jest.useFakeTimers());
        afterEach(() => jest.useRealTimers());

        it('goes back to where the modal was opened from, and pops the whole modal when it was opened without a backTo', () => {
            mockTestToolsModalState(ROUTES.SETTINGS_TROUBLESHOOT);
            toggleTestToolsModal();
            expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.SETTINGS_TROUBLESHOOT);
            expect(Navigation.pop).not.toHaveBeenCalled();

            jest.advanceTimersByTime(CONST.TIMING.TEST_TOOLS_MODAL_THROTTLE_TIME);

            mockTestToolsModalState();
            toggleTestToolsModal();
            expect(Navigation.pop).toHaveBeenCalledWith(ROOT_STATE_KEY);
            expect(Navigation.goBack).toHaveBeenCalledTimes(1);
        });
    });
});
