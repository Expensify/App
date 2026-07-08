import {render} from '@testing-library/react-native';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';

import {navigateToReport} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import AddAgentPage from '@pages/settings/Agents/AddAgentPage';
import {setInitialPresetID, setNavigationToken} from '@pages/settings/Agents/pendingAgentAvatarStore';

import {createAgent} from '@userActions/Agent';

import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

jest.mock('@userActions/Agent', () => ({
    createAgent: jest.fn(),
}));

const mockCreateAgent = jest.mocked(createAgent);

jest.mock('@libs/actions/Report', () => ({
    navigateToReport: jest.fn(),
}));

const mockNavigateToReport = jest.mocked(navigateToReport);

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
const mockUseCurrentUserPersonalDetails = jest.mocked(useCurrentUserPersonalDetails);

type AddAgentRouteProp = PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.AGENTS.ADD>;

function makeRoute(params: AddAgentRouteProp['params'] = {}): AddAgentRouteProp {
    return {name: '', key: '', params} as unknown as AddAgentRouteProp;
}

const OWNER_ACCOUNT_ID = 999;
const OWNER_LOGIN = 'owner@test.com';
const OPTIMISTIC_REPORT_ID = '4567890123456789';

describe('AddAgentPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseCurrentUserPersonalDetails.mockReturnValue({accountID: OWNER_ACCOUNT_ID, login: OWNER_LOGIN});
        mockCreateAgent.mockReturnValue({optimisticAccountID: -123456, avatarURI: undefined, optimisticReportID: OPTIMISTIC_REPORT_ID});
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
        mockUseCurrentUserPersonalDetails.mockReturnValue({accountID: OWNER_ACCOUNT_ID, login: OWNER_LOGIN, displayName: 'Nicolas'});

        render(
            <AddAgentPage
                route={makeRoute()}
                navigation={undefined as never}
            />,
        );

        expect(mockTranslate).toHaveBeenCalledWith('addAgentPage.defaultAgentName', 'Nicolas');
    });

    it('sets default agent name as InputWrapper defaultValue when displayName exists', () => {
        mockUseCurrentUserPersonalDetails.mockReturnValue({accountID: OWNER_ACCOUNT_ID, login: OWNER_LOGIN, displayName: 'Nicolas'});

        const {toJSON} = render(
            <AddAgentPage
                route={makeRoute()}
                navigation={undefined as never}
            />,
        );

        expect(JSON.stringify(toJSON())).toContain('firstName::addAgentPage.defaultAgentName(Nicolas)');
    });

    it('sets no default agent name when displayName is absent', () => {
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

        it('creates the agent with the owner accountID and login, then navigates to the optimistic DM report and dismisses the modal', () => {
            render(
                <AddAgentPage
                    route={makeRoute({})}
                    navigation={undefined as never}
                />,
            );

            mockFormOnSubmit?.({firstName: 'Bot', prompt: 'Reject gambling.'});

            // The 5th arg (selected preset avatar ID) is randomized on mount, so only assert the args that matter here.
            expect(mockCreateAgent).toHaveBeenCalledWith('Bot', 'Reject gambling.', OWNER_ACCOUNT_ID, OWNER_LOGIN, expect.anything(), undefined, undefined, undefined);
            expect(mockNavigateToReport).toHaveBeenCalledWith(OPTIMISTIC_REPORT_ID, {shouldDismissModal: true});
        });

        it('forwards policyID from route params to createAgent', () => {
            render(
                <AddAgentPage
                    route={makeRoute({policyID: 'POL_42'})}
                    navigation={undefined as never}
                />,
            );

            mockFormOnSubmit?.({firstName: 'Bot', prompt: 'Reject gambling.'});

            expect(mockCreateAgent).toHaveBeenCalledWith('Bot', 'Reject gambling.', OWNER_ACCOUNT_ID, OWNER_LOGIN, expect.anything(), undefined, undefined, 'POL_42');
            expect(mockNavigateToReport).toHaveBeenCalledWith(OPTIMISTIC_REPORT_ID, {shouldDismissModal: true});
        });
    });
});
