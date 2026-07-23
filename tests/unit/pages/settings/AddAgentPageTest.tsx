import {render} from '@testing-library/react-native';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';

import {AGENT_AVATARS} from '@libs/Avatars/AgentAvatarCatalog';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import AddAgentPage from '@pages/settings/Agents/AddAgentPage';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

const mockTranslate = jest.fn().mockImplementation((key: string, param?: string) => (param !== undefined ? `${key}(${param})` : key));
const mockCreateAgent = jest.fn<{optimisticAccountID: number; avatarURI: string | undefined}, unknown[]>(() => ({optimisticAccountID: -123456, avatarURI: undefined}));
const mockSetNewAgentAvatarPreset = jest.fn<void, unknown[]>();
const mockClearNewAgentAvatarDraft = jest.fn<void, unknown[]>();
const mockClearNewAgentTemplate = jest.fn<void, unknown[]>();
let mockAvatarDraft: {customExpensifyAvatarID?: string; uploadedAvatar?: {uri: string; name: string; type: string}} | undefined;
let mockAvatarDraftStatus: 'loading' | 'loaded' = 'loaded';
let mockTemplate: {name: string; prompt: string; avatarID: string} | undefined;

jest.mock('@userActions/Agent', () => ({
    createAgent: (...args: unknown[]) => mockCreateAgent(...args),
    setNewAgentAvatarPreset: (...args: unknown[]) => mockSetNewAgentAvatarPreset(...args),
    clearNewAgentAvatarDraft: (...args: unknown[]) => mockClearNewAgentAvatarDraft(...args),
    clearNewAgentTemplate: (...args: unknown[]) => mockClearNewAgentTemplate(...args),
}));

jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: mockTranslate})));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({})));

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

jest.mock('@hooks/useOnyx', () => {
    const onyxKeys = jest.requireActual<{default: typeof ONYXKEYS}>('@src/ONYXKEYS').default;
    return {
        __esModule: true,
        default: jest.fn((key: string) => {
            if (key === onyxKeys.AGENT_NEW_AVATAR_DRAFT) {
                return [mockAvatarDraft, {status: mockAvatarDraftStatus}] as const;
            }
            if (key === onyxKeys.NEW_AGENT_TEMPLATE) {
                return [mockTemplate, {status: 'loaded'}] as const;
            }
            return [undefined, {status: 'loaded'}] as const;
        }),
    };
});

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
    dismissModal: jest.fn(),
}));

const mockAddListener = jest.fn<() => void, [string, (...args: unknown[]) => void]>(() => jest.fn());

jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@react-navigation/native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        useIsFocused: () => true,
        useRoute: jest.fn(() => ({name: '', key: '', params: {}})),
        useNavigation: () => ({addListener: mockAddListener}),
    };
});

/** Renders the page and returns the `beforeRemove` handler registered via `useBeforeRemove`. */
function captureBeforeRemoveHandler(routeParams: AddAgentRouteProp['params'] = {}): (() => void) | undefined {
    let beforeRemoveHandler: (() => void) | undefined;
    mockAddListener.mockImplementation((event, handler) => {
        if (event === 'beforeRemove') {
            beforeRemoveHandler = handler as () => void;
        }
        return jest.fn();
    });
    renderAddAgentPage(routeParams);
    return beforeRemoveHandler;
}

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

const mockNavigate = jest.mocked(Navigation.navigate);
const mockGoBack = jest.mocked(Navigation.goBack);
const mockDismissModal = jest.mocked(Navigation.dismissModal);
const mockUseCurrentUserPersonalDetails = jest.mocked(useCurrentUserPersonalDetails);
const mockUseOnyx = jest.mocked(useOnyx);

type AddAgentRouteProp = PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.AGENTS.ADD>;

function makeRoute(params: AddAgentRouteProp['params'] = {}): AddAgentRouteProp {
    return {name: '', key: '', params} as unknown as AddAgentRouteProp;
}

function renderAddAgentPage(routeParams: AddAgentRouteProp['params'] = {}) {
    return render(
        <AddAgentPage
            route={makeRoute(routeParams)}
            navigation={undefined as never}
        />,
    );
}

describe('AddAgentPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockAvatarDraft = undefined;
        mockAvatarDraftStatus = 'loaded';
        mockTemplate = undefined;
        mockUseCurrentUserPersonalDetails.mockReturnValue({accountID: 0});
        mockAvatarOnPress = undefined;
    });

    it('renders page title', () => {
        const {toJSON} = renderAddAgentPage();

        expect(JSON.stringify(toJSON())).toContain('addAgentPage.title');
    });

    it('translates default agent name using current user displayName', () => {
        mockUseCurrentUserPersonalDetails.mockReturnValue({accountID: 0, displayName: 'Nicolas'});

        renderAddAgentPage();

        expect(mockTranslate).toHaveBeenCalledWith('addAgentPage.defaultAgentName', 'Nicolas');
    });

    it('sets default agent name as InputWrapper defaultValue when displayName exists', () => {
        mockUseCurrentUserPersonalDetails.mockReturnValue({accountID: 0, displayName: 'Nicolas'});

        const {toJSON} = renderAddAgentPage();

        expect(JSON.stringify(toJSON())).toContain('firstName::addAgentPage.defaultAgentName(Nicolas)');
    });

    it('sets no default agent name when displayName is absent', () => {
        mockUseCurrentUserPersonalDetails.mockReturnValue({accountID: 0});

        const {toJSON} = renderAddAgentPage();

        expect(JSON.stringify(toJSON())).toContain('firstName::');
        expect(mockTranslate).not.toHaveBeenCalledWith('addAgentPage.defaultAgentName', expect.anything());
    });

    it('always sets default prompt regardless of displayName', () => {
        renderAddAgentPage();

        expect(mockTranslate).toHaveBeenCalledWith('addAgentPage.defaultPrompt');
    });

    it('sets default prompt as InputWrapper defaultValue', () => {
        const {toJSON} = renderAddAgentPage();

        expect(JSON.stringify(toJSON())).toContain('prompt::addAgentPage.defaultPrompt');
    });

    it('seeds a random default avatar into the draft on mount when it is empty', () => {
        renderAddAgentPage();

        expect(mockUseOnyx).toHaveBeenCalledWith(ONYXKEYS.AGENT_NEW_AVATAR_DRAFT);
        expect(mockSetNewAgentAvatarPreset).toHaveBeenCalledTimes(1);
        expect(AGENT_AVATARS.isAvatarID(mockSetNewAgentAvatarPreset.mock.calls.at(0)?.at(0))).toBe(true);
    });

    it('navigates to the avatar picker without an extra write when the avatar is pressed', () => {
        renderAddAgentPage();

        // Ignore the on-mount seed; pressing the avatar must only navigate.
        mockSetNewAgentAvatarPreset.mockClear();
        mockAvatarOnPress?.();

        expect(mockSetNewAgentAvatarPreset).not.toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SETTINGS_AGENTS_ADD_AVATAR);
    });

    it('does not seed a default while the draft is still loading (avoids clobbering a saved avatar on refresh)', () => {
        mockAvatarDraftStatus = 'loading';

        renderAddAgentPage();

        expect(mockSetNewAgentAvatarPreset).not.toHaveBeenCalled();
    });

    it('does not seed a default when a draft already exists (e.g. after a refresh)', () => {
        mockAvatarDraft = {customExpensifyAvatarID: 'bot-avatar--blue'};

        renderAddAgentPage();

        expect(mockSetNewAgentAvatarPreset).not.toHaveBeenCalled();
    });

    it('seeds the template avatar into the draft on mount when opened from a template', () => {
        mockTemplate = {name: 'Cheapskate Charlie', prompt: 'Reject pricey expenses.', avatarID: 'bot-avatar--blue'};

        renderAddAgentPage();

        expect(mockSetNewAgentAvatarPreset).toHaveBeenCalledTimes(1);
        expect(mockSetNewAgentAvatarPreset.mock.calls.at(0)?.at(0)).toBe('bot-avatar--blue');
    });

    it('pre-fills the name and prompt inputs from the template when opened from one', () => {
        mockTemplate = {name: 'Cheapskate Charlie', prompt: 'Reject pricey expenses.', avatarID: 'bot-avatar--blue'};

        const {toJSON} = renderAddAgentPage();

        expect(JSON.stringify(toJSON())).toContain('firstName::Cheapskate Charlie');
        expect(JSON.stringify(toJSON())).toContain('prompt::Reject pricey expenses.');
    });

    it('resets the avatar draft when the flow is closed without saving', () => {
        mockAvatarDraft = {customExpensifyAvatarID: 'bot-avatar--blue'};

        const beforeRemoveHandler = captureBeforeRemoveHandler();
        beforeRemoveHandler?.();

        expect(mockClearNewAgentAvatarDraft).toHaveBeenCalledTimes(1);
    });

    it('does not reset the avatar draft on close after submitting', () => {
        mockAvatarDraft = {customExpensifyAvatarID: 'bot-avatar--blue'};

        const beforeRemoveHandler = captureBeforeRemoveHandler();
        mockFormOnSubmit?.({firstName: 'Bot', prompt: 'Reject gambling.'});
        // The submit path already cleared the draft once; the close handler must not clear it again.
        mockClearNewAgentAvatarDraft.mockClear();
        beforeRemoveHandler?.();

        expect(mockClearNewAgentAvatarDraft).not.toHaveBeenCalled();
    });

    describe('submit branching', () => {
        beforeEach(() => {
            mockFormOnSubmit = undefined;
            mockAvatarDraft = {customExpensifyAvatarID: 'bot-avatar--blue'};
        });

        it('clears the template and avatar draft and dismisses the whole creation flow', () => {
            renderAddAgentPage({});

            mockFormOnSubmit?.({firstName: 'Bot', prompt: 'Reject gambling.'});

            expect(mockClearNewAgentTemplate).toHaveBeenCalledTimes(1);
            expect(mockClearNewAgentAvatarDraft).toHaveBeenCalledTimes(1);
            // Submit dismisses the whole modal (picker + builder) instead of walking back one screen at a time.
            expect(mockDismissModal).toHaveBeenCalledTimes(1);
            expect(mockGoBack).not.toHaveBeenCalled();
            expect(mockNavigate).not.toHaveBeenCalled();
        });

        it('creates the agent with the persisted preset when no photo was uploaded', () => {
            renderAddAgentPage({});

            mockFormOnSubmit?.({firstName: 'Bot', prompt: 'Reject gambling.'});

            expect(mockCreateAgent).toHaveBeenCalledWith('Bot', 'Reject gambling.', 'bot-avatar--blue', undefined, undefined, undefined);
        });

        it('passes the policyID through to createAgent when present', () => {
            renderAddAgentPage({policyID: 'POL_42'});

            mockFormOnSubmit?.({firstName: 'Bot', prompt: 'Reject gambling.'});

            expect(mockCreateAgent).toHaveBeenCalledWith('Bot', 'Reject gambling.', 'bot-avatar--blue', undefined, undefined, 'POL_42');
        });

        it('creates the agent with the reconstructed uploaded file when a photo was uploaded', () => {
            mockAvatarDraft = {uploadedAvatar: {uri: 'file://photo.jpg', name: 'photo.jpg', type: 'image/jpeg'}};

            renderAddAgentPage({});
            mockFormOnSubmit?.({firstName: 'Bot', prompt: 'Reject gambling.'});

            const [, , presetArg, fileArg, uriArg] = mockCreateAgent.mock.calls.at(0) ?? [];
            expect(presetArg).toBeUndefined();
            expect(fileArg).toBeDefined();
            expect(uriArg).toBe('file://photo.jpg');
        });
    });
});
