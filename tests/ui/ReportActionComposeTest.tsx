import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import type * as NativeNavigation from '@react-navigation/native';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {ReportsSplitNavigatorParamList} from '@libs/Navigation/types';
import ReportScreen from '@pages/home/ReportScreen';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('expo-image-manipulator', () => ({
    manipulateAsync: jest.fn(),
}));

jest.mock('expo-image', () => ({
    Image: () => null,
}));

jest.mock('expo-av', () => ({
    Video: () => null,
    ResizeMode: {COVER: 'cover'},
    VideoFullscreenUpdate: {},
}));
jest.mock('pusher-js', () => ({
    Pusher: {
        subscribe: jest.fn(() => ({
            bind: jest.fn(),
            unbind: jest.fn(),
        })),
        unsubscribe: jest.fn(),
    },
}));

// Mock dependencies
jest.mock('@libs/ReportUtils', () => ({
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    ...((): typeof import('@libs/ReportUtils') => {
        return jest.requireActual('@libs/ReportUtils');
    })(),
    canUserPerformWriteAction: jest.fn(() => true),
    isChatRoom: jest.fn(() => false),
    isGroupChat: jest.fn(() => false),
    isSettled: jest.fn(() => false),
    isReportApproved: jest.fn(() => false),
    isMoneyRequestAction: jest.fn(() => false),
    isSentMoneyReportAction: jest.fn(() => false),
    isSelfDM: jest.fn(() => false),
    getParentReport: jest.fn(() => ({})),
    temporaryGetMoneyRequestOptions: jest.fn(() => []),
}));
jest.mock('@react-navigation/native', () => ({
    ...((): typeof NativeNavigation => {
        return jest.requireActual('@react-navigation/native');
    })(),
    useNavigation: jest.fn(() => ({
        navigate: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
    })),
    useIsFocused: jest.fn(() => true),
    useRoute: jest.fn(() => ({key: '', name: '', params: {reportID: '1'}})),
}));

TestHelper.setupGlobalFetchMock();

const Stack = createPlatformStackNavigator<ReportsSplitNavigatorParamList>();

// Constants for test data
const REPORT_ID = '1';
const POLICY_ID = 'policy1';
const USER_EMAIL = 'user1@example.com';
const mockReport = {
    reportID: REPORT_ID,
    policyID: POLICY_ID,
    participants: {},
    type: CONST.REPORT.TYPE.CHAT,
};

const mockPersonalDetailsList = {
    [USER_EMAIL]: {
        login: USER_EMAIL,
        displayName: 'User One',
        firstName: 'User',
        lastName: 'One',
    },
};
const mockReportActions = {
    [REPORT_ID]: {},
};

// Helper function to set up Onyx data
const setupOnyxData = async () => {
    await act(async () => {
        await Onyx.merge(ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT, true);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, mockReport);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, null);
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, mockPersonalDetailsList);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, mockReportActions[REPORT_ID]);
    });
};

// Helper function to render the page
const renderPage = (initialRouteName: typeof SCREENS.REPORT, initialParams: {reportID: string; onSubmit: () => void}) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={initialRouteName}>
                        <Stack.Screen
                            name={initialRouteName}
                            component={ReportScreen}
                            initialParams={initialParams}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
};

// Helper function to simulate text selection
const simulateSelection = (composer: ReturnType<typeof screen.getByTestId>, start: number, end: number) => {
    fireEvent(composer, 'selectionChange', {
        nativeEvent: {selection: {start, end}},
    });
};

describe('ReportActionCompose Integration Tests', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });

    beforeEach(async () => {
        await setupOnyxData();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    describe('Paste Behavior with Selection updateComment logic', () => {
        it('should format pasted URL as Markdown link when text is selected', async () => {
            const onSubmit = jest.fn();
            const {unmount} = renderPage(SCREENS.REPORT, {reportID: REPORT_ID, onSubmit});
            await waitForBatchedUpdatesWithAct();

            const composer = screen.getByTestId('composer');
            fireEvent.changeText(composer, 'Selected text');
            simulateSelection(composer, 0, 8);
            fireEvent.changeText(composer, 'https://example.com');

            await waitFor(() => {
                expect(screen.getByTestId('composer').props.value).toBe('[Selected](https://example.com) text');
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should insert raw URL when no text is selected', async () => {
            const onSubmit = jest.fn();
            const {unmount} = renderPage(SCREENS.REPORT, {reportID: REPORT_ID, onSubmit});
            await waitForBatchedUpdatesWithAct();

            const composer = screen.getByTestId('composer');
            fireEvent.changeText(composer, '');
            fireEvent.changeText(composer, 'https://example.com');

            await waitFor(() => {
                expect(screen.getByTestId('composer').props.value).toBe('https://example.com');
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should insert raw text when non-URL text is pasted', async () => {
            const onSubmit = jest.fn();
            const {unmount} = renderPage(SCREENS.REPORT, {reportID: REPORT_ID, onSubmit});
            await waitForBatchedUpdatesWithAct();

            const composer = screen.getByTestId('composer');
            fireEvent.changeText(composer, 'what you do');
            simulateSelection(composer, 0, 4);
            const prevText = 'what you do';
            const pastedText = 'Hello world';
            const merged = prevText.slice(0, 0) + pastedText + prevText.slice(4);
            fireEvent.changeText(composer, merged);

            await waitFor(() => {
                expect(screen.getByTestId('composer').props.value).toBe('Hello world you do');
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should format pasted URL as Markdown link when replacing entire selected text', async () => {
            const onSubmit = jest.fn();
            const {unmount} = renderPage(SCREENS.REPORT, {reportID: REPORT_ID, onSubmit});
            await waitForBatchedUpdatesWithAct();

            const composer = screen.getByTestId('composer');
            fireEvent.changeText(composer, 'Selected text');
            simulateSelection(composer, 0, 13);
            fireEvent.changeText(composer, 'https://example.com');

            await waitFor(() => {
                expect(screen.getByTestId('composer').props.value).toBe('[Selected text](https://example.com)');
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should insert raw URL with emoji when pasted with selection', async () => {
            const onSubmit = jest.fn();
            const {unmount} = renderPage(SCREENS.REPORT, {reportID: REPORT_ID, onSubmit});
            await waitForBatchedUpdatesWithAct();

            const composer = screen.getByTestId('composer');
            const prevText = 'Emoji text 😀';
            fireEvent.changeText(composer, prevText);
            simulateSelection(composer, 0, 5);
            const pastedText = 'https://example.com 😀';
            const merged = prevText.slice(0, 0) + pastedText + prevText.slice(5);
            fireEvent.changeText(composer, merged);

            await waitFor(() => {
                expect(screen.getByTestId('composer').props.value).toBe(merged);
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should format pasted URL as Markdown link when selected text contains square brackets', async () => {
            const onSubmit = jest.fn();
            const {unmount} = renderPage(SCREENS.REPORT, {reportID: REPORT_ID, onSubmit});
            await waitForBatchedUpdatesWithAct();

            const composer = screen.getByTestId('composer');
            fireEvent.changeText(composer, 'Select]ed[ text');
            simulateSelection(composer, 0, 15);
            fireEvent.changeText(composer, 'https://example.com');

            await waitFor(() => {
                expect(screen.getByTestId('composer').props.value).toBe('[Select&#93;ed&#91; text](https://example.com)');
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should format pasted URL as Markdown link when selected text contains parentheses', async () => {
            const onSubmit = jest.fn();
            const {unmount} = renderPage(SCREENS.REPORT, {reportID: REPORT_ID, onSubmit});
            await waitForBatchedUpdatesWithAct();

            const composer = screen.getByTestId('composer');
            fireEvent.changeText(composer, 'Selected () text');
            simulateSelection(composer, 0, 16);
            fireEvent.changeText(composer, 'https://example.com');

            await waitFor(() => {
                expect(screen.getByTestId('composer').props.value).toBe('[Selected () text](https://example.com)');
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should format pasted URL as Markdown link when selected text contains curly braces', async () => {
            const onSubmit = jest.fn();
            const {unmount} = renderPage(SCREENS.REPORT, {reportID: REPORT_ID, onSubmit});
            await waitForBatchedUpdatesWithAct();

            const composer = screen.getByTestId('composer');
            fireEvent.changeText(composer, 'Selec}ted {text');
            simulateSelection(composer, 0, 15);
            fireEvent.changeText(composer, 'https://example.com');

            await waitFor(() => {
                expect(screen.getByTestId('composer').props.value).toBe('[Selec}ted {text](https://example.com)');
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });
    });
});
