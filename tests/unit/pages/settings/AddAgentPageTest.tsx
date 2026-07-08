import {act, render} from '@testing-library/react-native';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOpenDMWithCreatedAgent from '@hooks/useOpenDMWithCreatedAgent';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getIsOffline} from '@libs/NetworkState';

import AddAgentPage from '@pages/settings/Agents/AddAgentPage';
import {setInitialPresetID, setNavigationToken} from '@pages/settings/Agents/pendingAgentAvatarStore';

import {createAgent} from '@userActions/Agent';

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

const mockWatchForCreatedAgent = jest.fn();

jest.mock('@hooks/useOpenDMWithCreatedAgent', () => jest.fn(() => mockWatchForCreatedAgent));

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
let mockFormIsLoading: boolean | undefined;

jest.mock('@components/Form/FormProvider', () => {
    function MockFormProvider({children, onSubmit, isLoading}: {children: React.ReactNode; onSubmit: (values: {firstName: string; prompt: string}) => void; isLoading?: boolean}) {
        mockFormOnSubmit = onSubmit;
        mockFormIsLoading = isLoading;
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
const mockUseOpenDMWithCreatedAgent = jest.mocked(useOpenDMWithCreatedAgent);

type AddAgentRouteProp = PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.AGENTS.ADD>;

function makeRoute(params: AddAgentRouteProp['params'] = {}): AddAgentRouteProp {
    return createMock<AddAgentRouteProp>({name: SCREENS.SETTINGS.AGENTS.ADD, key: '', params});
}

const OPTIMISTIC_ACCOUNT_ID = -123456;
const mockNavigation = undefined as never;

function renderAddAgentPage(params: AddAgentRouteProp['params'] = {}) {
    return render(
        <AddAgentPage
            route={makeRoute(params)}
            navigation={mockNavigation}
        />,
    );
}

describe('AddAgentPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseCurrentUserPersonalDetails.mockReturnValue({accountID: 0});
        mockUseOpenDMWithCreatedAgent.mockReturnValue(mockWatchForCreatedAgent);
        mockCreateAgent.mockReturnValue({optimisticAccountID: OPTIMISTIC_ACCOUNT_ID, avatarURI: undefined});
        mockGetIsOffline.mockReturnValue(false);
        mockIsActiveRoute.mockReturnValue(true);
        mockAvatarOnPress = undefined;
        mockFormIsLoading = undefined;
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

    // Matching the created agent and opening its DM is covered by useOpenDMWithCreatedAgent.test.ts.
    // These tests only cover how AddAgentPage wires into that hook.
    describe('submit branching', () => {
        beforeEach(() => {
            mockFormOnSubmit = undefined;
        });

        it('starts watching for the created agent and shows the loading state when online (policyID absent)', () => {
            renderAddAgentPage({});

            act(() => mockFormOnSubmit?.({firstName: 'Bot', prompt: 'Reject gambling.'}));

            expect(mockWatchForCreatedAgent).toHaveBeenCalledWith(OPTIMISTIC_ACCOUNT_ID);
            expect(mockFormIsLoading).toBe(true);
            expect(mockGoBack).not.toHaveBeenCalled();
        });

        it('starts watching for the created agent when online (policyID present)', () => {
            renderAddAgentPage({policyID: 'POL_42'});

            act(() => mockFormOnSubmit?.({firstName: 'Bot', prompt: 'Reject gambling.'}));

            expect(mockWatchForCreatedAgent).toHaveBeenCalledWith(OPTIMISTIC_ACCOUNT_ID);
            expect(mockFormIsLoading).toBe(true);
        });

        it('goes back right away and does not start watching when created offline', async () => {
            mockGetIsOffline.mockReturnValue(true);

            renderAddAgentPage({});

            act(() => mockFormOnSubmit?.({firstName: 'Bot', prompt: 'Reject gambling.'}));

            expect(mockGoBack).toHaveBeenCalledTimes(1);
            await waitForBatchedUpdates();
            expect(mockWatchForCreatedAgent).not.toHaveBeenCalled();
            expect(mockFormIsLoading).toBeFalsy();
        });
    });
});
