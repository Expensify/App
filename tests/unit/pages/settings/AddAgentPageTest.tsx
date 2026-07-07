import {render, waitFor} from '@testing-library/react-native';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getIsOffline} from '@libs/NetworkState';

import AddAgentPage from '@pages/settings/Agents/AddAgentPage';
import {setInitialPresetID, setNavigationToken} from '@pages/settings/Agents/pendingAgentAvatarStore';

import {createAgent} from '@userActions/Agent';

import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

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

jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined, {status: 'loaded'}]));

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
    return {name: '', key: '', params} as unknown as AddAgentRouteProp;
}

describe('AddAgentPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseCurrentUserPersonalDetails.mockReturnValue({accountID: 0});
        mockCreateAgent.mockReturnValue({optimisticAccountID: -123456, avatarURI: undefined, createdAgentAccountID: Promise.resolve(22542959)});
        mockGetIsOffline.mockReturnValue(false);
        mockIsActiveRoute.mockReturnValue(true);
        mockAvatarOnPress = undefined;
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

        it('dismisses the modal and opens the DM with the real accountID once it resolves when policyID is absent', async () => {
            render(
                <AddAgentPage
                    route={makeRoute({})}
                    navigation={undefined as never}
                />,
            );

            mockFormOnSubmit?.({firstName: 'Bot', prompt: 'Reject gambling.'});

            // The modal is dismissed immediately so the optimistic agent shows in the Agents list.
            expect(mockGoBack).toHaveBeenCalledTimes(1);

            // The DM opens with the agent's real, server-assigned accountID — never the optimistic one.
            await waitFor(() => expect(mockChatWithAgent).toHaveBeenCalledWith(22542959, {shouldDismissModal: true}));
            expect(mockChatWithAgent).toHaveBeenCalledTimes(1);
        });

        it('dismisses the modal and opens the DM with the real accountID once it resolves when policyID is present', async () => {
            render(
                <AddAgentPage
                    route={makeRoute({policyID: 'POL_42'})}
                    navigation={undefined as never}
                />,
            );

            mockFormOnSubmit?.({firstName: 'Bot', prompt: 'Reject gambling.'});

            expect(mockGoBack).toHaveBeenCalledTimes(1);

            await waitFor(() => expect(mockChatWithAgent).toHaveBeenCalledWith(22542959, {shouldDismissModal: true}));
            expect(mockChatWithAgent).toHaveBeenCalledTimes(1);
        });

        it('does not open the DM on reconnect when created offline and the user has navigated away from the Agents list', async () => {
            mockGetIsOffline.mockReturnValue(true);
            mockIsActiveRoute.mockReturnValue(false);

            render(
                <AddAgentPage
                    route={makeRoute({})}
                    navigation={undefined as never}
                />,
            );

            mockFormOnSubmit?.({firstName: 'Bot', prompt: 'Reject gambling.'});

            expect(mockGoBack).toHaveBeenCalledTimes(1);

            // The real accountID resolves (reconnect), but the user is no longer on the Agents list, so we stay put.
            await waitForBatchedUpdates();
            expect(mockChatWithAgent).not.toHaveBeenCalled();
        });

        it('opens the DM on reconnect when created offline but the user is still on the Agents list', async () => {
            mockGetIsOffline.mockReturnValue(true);
            mockIsActiveRoute.mockReturnValue(true);

            render(
                <AddAgentPage
                    route={makeRoute({})}
                    navigation={undefined as never}
                />,
            );

            mockFormOnSubmit?.({firstName: 'Bot', prompt: 'Reject gambling.'});

            expect(mockGoBack).toHaveBeenCalledTimes(1);

            await waitFor(() => expect(mockChatWithAgent).toHaveBeenCalledWith(22542959, {shouldDismissModal: true}));
            expect(mockIsActiveRoute).toHaveBeenCalledWith(ROUTES.SETTINGS_AGENTS);
        });
    });
});
