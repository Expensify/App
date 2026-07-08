import {act, render, waitFor} from '@testing-library/react-native';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getIsOffline} from '@libs/NetworkState';

import AddAgentPage from '@pages/settings/Agents/AddAgentPage';
import {setInitialPresetID, setNavigationToken} from '@pages/settings/Agents/pendingAgentAvatarStore';

import {createAgent} from '@userActions/Agent';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import React from 'react';

import createMock from '../../../utils/createMock';
import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

jest.mock('@userActions/Agent', () => ({
    createAgent: jest.fn(),
}));

const mockCreateAgent = jest.mocked(createAgent);

const mockTranslate = jest.fn().mockImplementation((key: string, param?: string) => (param !== undefined ? `${key}(${param})` : key));

jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: mockTranslate})));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({})));

const mockChatWithAgent = jest.fn();

jest.mock('@hooks/useChatWithAgent', () => jest.fn(() => mockChatWithAgent));

jest.mock('@hooks/useTheme', () => jest.fn(() => ({textLight: '#fff'})));

jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(
        () =>
            new Proxy(
                {},
                {
                    get: () => ({}),
                },
            ),
    ),
);

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: jest.fn(() => ({AiBot: 1})),
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({Pencil: 1})),
}));

// AddAgentPage subscribes to the agent-prompt collection to detect the newly created agent. Tests drive
// this value and its load status directly and re-render to simulate the collection updating (useOnyx here is
// not reactive).
let mockAgentPrompts: Record<string, {pendingAction?: string; errors?: Record<string, string>}> | undefined;
let mockAgentPromptsStatus: 'loading' | 'loaded' = 'loaded';

jest.mock('@hooks/useOnyx', () => jest.fn(() => [mockAgentPrompts, {status: mockAgentPromptsStatus}]));

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
    isActiveRoute: jest.fn(() => true),
}));

jest.mock('@libs/NetworkState', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/NetworkState');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        getIsOffline: jest.fn(() => false),
    };
});

jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@react-navigation/native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        useIsFocused: () => true,
        useRoute: jest.fn(() => ({name: '', key: '', params: {}})),
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@components/ScreenWrapper', () => {
    function MockScreenWrapper({children}: {children: React.ReactNode}) {
        return children;
    }
    return MockScreenWrapper;
});

jest.mock('@components/HeaderWithBackButton', () => {
    function MockHeader({title}: {title: string}) {
        return title;
    }
    return MockHeader;
});

let mockFormOnSubmit: ((values: {firstName: string; prompt: string}) => void) | undefined;

jest.mock('@components/Form/FormProvider', () => {
    function MockFormProvider({children, onSubmit}: {children: React.ReactNode; onSubmit: (values: {firstName: string; prompt: string}) => void}) {
        mockFormOnSubmit = onSubmit;
        return children;
    }
    return MockFormProvider;
});

jest.mock('@components/Form/InputWrapper', () => {
    function MockInputWrapper({inputID, defaultValue}: {inputID: string; defaultValue?: string}) {
        return `${inputID}::${defaultValue ?? ''}`;
    }
    return MockInputWrapper;
});

let mockAvatarOnPress: (() => void) | undefined;

jest.mock('@components/AvatarButtonWithIcon', () => {
    function MockAvatarButtonWithIcon({onPress}: {onPress?: () => void}) {
        mockAvatarOnPress = onPress;
        return null;
    }
    return MockAvatarButtonWithIcon;
});

jest.mock('@pages/settings/Agents/pendingAgentAvatarStore', () => ({
    setInitialPresetID: jest.fn(),
    setNavigationToken: jest.fn(),
    setReturnRoute: jest.fn(),
    getPendingAvatar: jest.fn(() => null),
    clearPendingAvatar: jest.fn(),
}));

const mockSetInitialPresetID = jest.mocked(setInitialPresetID);
const mockSetNavigationToken = jest.mocked(setNavigationToken);
const mockNavigate = jest.mocked(Navigation.navigate);
const mockGoBack = jest.mocked(Navigation.goBack);
const mockIsActiveRoute = jest.mocked(Navigation.isActiveRoute);
const mockGetIsOffline = jest.mocked(getIsOffline);
const mockUseCurrentUserPersonalDetails = jest.mocked(useCurrentUserPersonalDetails);

type AddAgentRouteProp = PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.AGENTS.ADD>;

function makeRoute(params: AddAgentRouteProp['params'] = {}): AddAgentRouteProp {
    return createMock<AddAgentRouteProp>({name: SCREENS.SETTINGS.AGENTS.ADD, key: '', params});
}

const OPTIMISTIC_ACCOUNT_ID = -123456;
const REAL_ACCOUNT_ID = 22542959;
const realAgentKey = `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${REAL_ACCOUNT_ID}`;
const optimisticAgentKey = `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${OPTIMISTIC_ACCOUNT_ID}`;
const otherOptimisticAgentKey = `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}999`;
const mockNavigation = undefined as never;

function renderAddAgentPage(params: AddAgentRouteProp['params'] = {}) {
    const utils = render(
        <AddAgentPage
            route={makeRoute(params)}
            navigation={mockNavigation}
        />,
    );
    return {
        ...utils,
        rerenderPage: () =>
            utils.rerender(
                <AddAgentPage
                    route={makeRoute(params)}
                    navigation={mockNavigation}
                />,
            ),
    };
}

describe('AddAgentPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseCurrentUserPersonalDetails.mockReturnValue({accountID: 0});
        mockCreateAgent.mockReturnValue({optimisticAccountID: OPTIMISTIC_ACCOUNT_ID, avatarURI: undefined});
        mockGetIsOffline.mockReturnValue(false);
        mockIsActiveRoute.mockReturnValue(true);
        mockAvatarOnPress = undefined;
        mockAgentPrompts = {};
        mockAgentPromptsStatus = 'loaded';
    });

    it('renders page title', () => {
        const {toJSON} = render(
            <AddAgentPage
                route={makeRoute()}
                navigation={undefined as never}
            />,
        );

        expect(JSON.stringify(toJSON())).toContain('addAgentPage.title');
    });

    it('translates default agent name using current user displayName', () => {
        mockUseCurrentUserPersonalDetails.mockReturnValue({accountID: 0, displayName: 'Nicolas'});

        render(
            <AddAgentPage
                route={makeRoute()}
                navigation={undefined as never}
            />,
        );

        expect(mockTranslate).toHaveBeenCalledWith('addAgentPage.defaultAgentName', 'Nicolas');
    });

    it('sets default agent name as InputWrapper defaultValue when displayName exists', () => {
        mockUseCurrentUserPersonalDetails.mockReturnValue({accountID: 0, displayName: 'Nicolas'});

        const {toJSON} = render(
            <AddAgentPage
                route={makeRoute()}
                navigation={undefined as never}
            />,
        );

        expect(JSON.stringify(toJSON())).toContain('firstName::addAgentPage.defaultAgentName(Nicolas)');
    });

    it('sets no default agent name when displayName is absent', () => {
        mockUseCurrentUserPersonalDetails.mockReturnValue({accountID: 0});

        const {toJSON} = render(
            <AddAgentPage
                route={makeRoute()}
                navigation={undefined as never}
            />,
        );

        expect(JSON.stringify(toJSON())).toContain('firstName::');
        expect(mockTranslate).not.toHaveBeenCalledWith('addAgentPage.defaultAgentName', expect.anything());
    });

    it('always sets default prompt regardless of displayName', () => {
        render(
            <AddAgentPage
                route={makeRoute()}
                navigation={undefined as never}
            />,
        );

        expect(mockTranslate).toHaveBeenCalledWith('addAgentPage.defaultPrompt');
    });

    it('sets default prompt as InputWrapper defaultValue', () => {
        const {toJSON} = render(
            <AddAgentPage
                route={makeRoute()}
                navigation={undefined as never}
            />,
        );

        expect(JSON.stringify(toJSON())).toContain('prompt::addAgentPage.defaultPrompt');
    });

    it('navigates to add avatar route when avatar button is pressed', () => {
        render(
            <AddAgentPage
                route={makeRoute()}
                navigation={undefined as never}
            />,
        );

        mockAvatarOnPress?.();

        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SETTINGS_AGENTS_ADD_AVATAR);
    });

    it('sets navigation token and initial preset ID when avatar button is pressed', () => {
        render(
            <AddAgentPage
                route={makeRoute()}
                navigation={undefined as never}
            />,
        );

        mockAvatarOnPress?.();

        expect(mockSetNavigationToken).toHaveBeenCalledTimes(1);
        expect(mockSetInitialPresetID).toHaveBeenCalledTimes(1);
    });

    describe('submit branching', () => {
        beforeEach(() => {
            mockFormOnSubmit = undefined;
        });

        it('stays on the page until the created agent appears, then opens the DM with its real accountID (policyID absent)', async () => {
            const {rerenderPage} = renderAddAgentPage({});

            act(() => mockFormOnSubmit?.({firstName: 'Bot', prompt: 'Reject gambling.'}));

            // Online we don't dismiss immediately — we wait for the real, server-assigned accountID.
            expect(mockGoBack).not.toHaveBeenCalled();
            expect(mockChatWithAgent).not.toHaveBeenCalled();

            // The optimistic placeholder lands; the effect captures its baseline from this loaded snapshot.
            mockAgentPrompts = {[optimisticAgentKey]: {pendingAction: 'add'}};
            rerenderPage();
            await waitForBatchedUpdates();
            expect(mockChatWithAgent).not.toHaveBeenCalled();

            // The real, server-created agent arrives (no ADD pending action).
            mockAgentPrompts = {[realAgentKey]: {}};
            rerenderPage();

            // The DM opens with the agent's real accountID — never the optimistic one — and dismisses the modal.
            await waitFor(() => expect(mockChatWithAgent).toHaveBeenCalledWith(REAL_ACCOUNT_ID, {shouldDismissModal: true}));
            expect(mockChatWithAgent).toHaveBeenCalledTimes(1);
            expect(mockGoBack).not.toHaveBeenCalled();
        });

        it('opens the DM with the real accountID once the created agent appears (policyID present)', async () => {
            const {rerenderPage} = renderAddAgentPage({policyID: 'POL_42'});

            act(() => mockFormOnSubmit?.({firstName: 'Bot', prompt: 'Reject gambling.'}));

            mockAgentPrompts = {[optimisticAgentKey]: {pendingAction: 'add'}};
            rerenderPage();

            mockAgentPrompts = {[realAgentKey]: {}};
            rerenderPage();

            await waitFor(() => expect(mockChatWithAgent).toHaveBeenCalledWith(REAL_ACCOUNT_ID, {shouldDismissModal: true}));
            expect(mockChatWithAgent).toHaveBeenCalledTimes(1);
        });

        it('ignores another optimistic (pending ADD) agent and waits for the real one', async () => {
            const {rerenderPage} = renderAddAgentPage({});

            act(() => mockFormOnSubmit?.({firstName: 'Bot', prompt: 'Reject gambling.'}));

            // Our optimistic placeholder lands and sets the baseline.
            mockAgentPrompts = {[optimisticAgentKey]: {pendingAction: 'add'}};
            rerenderPage();

            // A second agent the user created shows up as a *new* optimistic placeholder (pendingAction ADD).
            // It must NOT be mistaken for the created agent.
            mockAgentPrompts = {[optimisticAgentKey]: {pendingAction: 'add'}, [otherOptimisticAgentKey]: {pendingAction: 'add'}};
            rerenderPage();
            await waitForBatchedUpdates();
            expect(mockChatWithAgent).not.toHaveBeenCalled();

            // The real, server-created agent arrives without an ADD pending action.
            mockAgentPrompts = {[otherOptimisticAgentKey]: {pendingAction: 'add'}, [realAgentKey]: {}};
            rerenderPage();

            await waitFor(() => expect(mockChatWithAgent).toHaveBeenCalledWith(REAL_ACCOUNT_ID, {shouldDismissModal: true}));
        });

        it('does not treat an agent that hydrates after submit as the newly created one', async () => {
            // Cold open / direct link: the collection has not hydrated yet at submit time.
            mockAgentPrompts = {};
            const {rerenderPage} = renderAddAgentPage({});

            act(() => mockFormOnSubmit?.({firstName: 'Bot', prompt: 'Reject gambling.'}));

            // An existing agent hydrates before our optimistic placeholder / the CREATE_AGENT response. It must
            // NOT be matched — the baseline isn't established until our placeholder is present.
            mockAgentPrompts = {[`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}555`]: {}};
            rerenderPage();
            await waitForBatchedUpdates();
            expect(mockChatWithAgent).not.toHaveBeenCalled();

            // Our optimistic placeholder lands; the baseline now includes the pre-existing agent.
            mockAgentPrompts = {[`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}555`]: {}, [optimisticAgentKey]: {pendingAction: 'add'}};
            rerenderPage();
            await waitForBatchedUpdates();
            expect(mockChatWithAgent).not.toHaveBeenCalled();

            // Only the actual created agent opens the DM.
            mockAgentPrompts = {[`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}555`]: {}, [realAgentKey]: {}};
            rerenderPage();
            await waitFor(() => expect(mockChatWithAgent).toHaveBeenCalledWith(REAL_ACCOUNT_ID, {shouldDismissModal: true}));
        });

        it('does not match while the collection is still loading', async () => {
            mockAgentPromptsStatus = 'loading';
            mockAgentPrompts = {};
            const {rerenderPage} = renderAddAgentPage({});

            act(() => mockFormOnSubmit?.({firstName: 'Bot', prompt: 'Reject gambling.'}));

            // While loading, even a real-looking agent alongside our placeholder must not be matched.
            mockAgentPrompts = {[optimisticAgentKey]: {pendingAction: 'add'}, [`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}555`]: {}};
            rerenderPage();
            await waitForBatchedUpdates();
            expect(mockChatWithAgent).not.toHaveBeenCalled();

            // Once loaded, the baseline is captured (existing agent + our placeholder) and the created agent matches.
            mockAgentPromptsStatus = 'loaded';
            rerenderPage();
            await waitForBatchedUpdates();
            expect(mockChatWithAgent).not.toHaveBeenCalled();

            mockAgentPrompts = {[`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}555`]: {}, [realAgentKey]: {}};
            rerenderPage();
            await waitFor(() => expect(mockChatWithAgent).toHaveBeenCalledWith(REAL_ACCOUNT_ID, {shouldDismissModal: true}));
        });

        it('dismisses the page and does not open the DM when creation fails', async () => {
            const {rerenderPage} = renderAddAgentPage({});

            act(() => mockFormOnSubmit?.({firstName: 'Bot', prompt: 'Reject gambling.'}));

            // Our optimistic placeholder lands and sets the baseline.
            mockAgentPrompts = {[optimisticAgentKey]: {pendingAction: 'add'}};
            rerenderPage();

            // Creation failed: the optimistic entry now carries an error.
            mockAgentPrompts = {[optimisticAgentKey]: {pendingAction: 'add', errors: {error: 'genericAdd'}}};
            rerenderPage();

            // We dismiss and let the Agents list surface the error, without opening any DM.
            await waitFor(() => expect(mockGoBack).toHaveBeenCalledTimes(1));
            expect(mockChatWithAgent).not.toHaveBeenCalled();
        });

        it('does not open the DM when created offline, even if the user is still on the Agents list', async () => {
            mockGetIsOffline.mockReturnValue(true);
            mockIsActiveRoute.mockReturnValue(true);

            renderAddAgentPage({});

            act(() => mockFormOnSubmit?.({firstName: 'Bot', prompt: 'Reject gambling.'}));

            // We return to the Agents list right away but never open the DM — the real accountID only arrives on
            // reconnect, long after the user has moved on, so we don't yank them into the DM.
            expect(mockGoBack).toHaveBeenCalledTimes(1);
            await waitForBatchedUpdates();
            expect(mockChatWithAgent).not.toHaveBeenCalled();
        });
    });
});
