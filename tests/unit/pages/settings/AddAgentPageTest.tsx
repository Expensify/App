import {render} from '@testing-library/react-native';
import React from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import Navigation from '@libs/Navigation/Navigation';
import AddAgentPage from '@pages/settings/Agents/AddAgentPage';
import {setInitialPresetID, setNavigationToken} from '@pages/settings/Agents/pendingAgentAvatarStore';
import ROUTES from '@src/ROUTES';

jest.mock('@userActions/Agent', () => ({
    createAgent: jest.fn(),
}));

const mockTranslate = jest.fn().mockImplementation((key: string, param?: string) => (param !== undefined ? `${key}(${param})` : key));

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

jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined, {status: 'loaded'}]));

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
}));

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

jest.mock('@components/Form/FormProvider', () => {
    function MockFormProvider({children}: {children: React.ReactNode}) {
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
    getPendingAvatar: jest.fn(() => null),
    clearPendingAvatar: jest.fn(),
}));

const mockSetInitialPresetID = jest.mocked(setInitialPresetID);
const mockSetNavigationToken = jest.mocked(setNavigationToken);
const mockNavigate = jest.mocked(Navigation.navigate);
const mockUseCurrentUserPersonalDetails = jest.mocked(useCurrentUserPersonalDetails);

describe('AddAgentPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseCurrentUserPersonalDetails.mockReturnValue({accountID: 0});
        mockAvatarOnPress = undefined;
    });

    it('renders page title', () => {
        const {toJSON} = render(<AddAgentPage />);

        expect(JSON.stringify(toJSON())).toContain('addAgentPage.title');
    });

    it('translates default agent name using current user displayName', () => {
        mockUseCurrentUserPersonalDetails.mockReturnValue({accountID: 0, displayName: 'Nicolas'});

        render(<AddAgentPage />);

        expect(mockTranslate).toHaveBeenCalledWith('addAgentPage.defaultAgentName', 'Nicolas');
    });

    it('sets default agent name as InputWrapper defaultValue when displayName exists', () => {
        mockUseCurrentUserPersonalDetails.mockReturnValue({accountID: 0, displayName: 'Nicolas'});

        const {toJSON} = render(<AddAgentPage />);

        expect(JSON.stringify(toJSON())).toContain('firstName::addAgentPage.defaultAgentName(Nicolas)');
    });

    it('sets no default agent name when displayName is absent', () => {
        mockUseCurrentUserPersonalDetails.mockReturnValue({accountID: 0});

        const {toJSON} = render(<AddAgentPage />);

        expect(JSON.stringify(toJSON())).toContain('firstName::');
        expect(mockTranslate).not.toHaveBeenCalledWith('addAgentPage.defaultAgentName', expect.anything());
    });

    it('always sets default prompt regardless of displayName', () => {
        render(<AddAgentPage />);

        expect(mockTranslate).toHaveBeenCalledWith('addAgentPage.defaultPrompt');
    });

    it('sets default prompt as InputWrapper defaultValue', () => {
        const {toJSON} = render(<AddAgentPage />);

        expect(JSON.stringify(toJSON())).toContain('prompt::addAgentPage.defaultPrompt');
    });

    it('navigates to add avatar route when avatar button is pressed', () => {
        render(<AddAgentPage />);

        mockAvatarOnPress?.();

        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SETTINGS_AGENTS_ADD_AVATAR);
    });

    it('sets navigation token and initial preset ID when avatar button is pressed', () => {
        render(<AddAgentPage />);

        mockAvatarOnPress?.();

        expect(mockSetNavigationToken).toHaveBeenCalledTimes(1);
        expect(mockSetInitialPresetID).toHaveBeenCalledTimes(1);
    });
});
