import {render} from '@testing-library/react-native';

import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useOnyx from '@hooks/useOnyx';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import EditPromptPage from '@pages/settings/Agents/Fields/DynamicEditPromptPage';

import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

import React from 'react';
import {Platform} from 'react-native';

import createMock from '../../../utils/createMock';

const mockPromptMount = jest.fn();

jest.mock('@hooks/useIsInLandscapeMode', () => jest.fn(() => false));

jest.mock('@userActions/Agent', () => ({
    updateAgentPrompt: jest.fn(),
}));

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);

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
    const {useEffect} = jest.requireActual<typeof React>('react');
    function MockInputWrapper({inputID, defaultValue}: {inputID: string; defaultValue?: string}) {
        useEffect(() => {
            mockPromptMount();
        }, []);
        return `${inputID}::${defaultValue ?? ''}`;
    }
    return MockInputWrapper;
});

const mockUseOnyx = jest.mocked(useOnyx);

const TEST_ACCOUNT_ID = 12345;

type EditPromptPageRoute = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.AGENTS.DYNAMIC_EDIT_PROMPT>['route'];
type EditPromptPageNavigation = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.AGENTS.DYNAMIC_EDIT_PROMPT>['navigation'];

const mockRoute = createMock<EditPromptPageRoute>({params: {accountID: TEST_ACCOUNT_ID}});
const mockNavigation = createMock<EditPromptPageNavigation>({});

describe('EditPromptPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseOnyx.mockReturnValue([undefined, {status: 'loaded'}]);
    });

    it('keeps the prompt mounted when rotating on native', () => {
        // Given a native prompt editor in portrait, remounting would discard the input's focus and selection.
        const platform = jest.replaceProperty(Platform, 'OS', 'ios');
        const mockLandscape = jest.mocked(useIsInLandscapeMode);
        mockLandscape.mockReturnValue(false);
        const page = (
            <EditPromptPage
                route={mockRoute}
                navigation={mockNavigation}
            />
        );
        const {rerender} = render(page);
        expect(mockPromptMount).toHaveBeenCalledTimes(1);

        // When the device rotates to landscape and back while the editor is open.
        mockLandscape.mockReturnValue(true);
        rerender(React.cloneElement(page));
        mockLandscape.mockReturnValue(false);
        rerender(React.cloneElement(page));

        // Then the original input survives both layout changes, preserving native editing state.
        expect(mockPromptMount).toHaveBeenCalledTimes(1);
        platform.restore();
    });

    it('renders page title', () => {
        const {toJSON} = render(
            <EditPromptPage
                route={mockRoute}
                navigation={mockNavigation}
            />,
        );

        expect(JSON.stringify(toJSON())).toContain('editAgentPromptPage.title');
    });

    it('renders prompt as default value in InputWrapper', () => {
        mockUseOnyx.mockImplementation((key) => {
            if (key === `${ONYXKEYS.COLLECTION.AGENT}${TEST_ACCOUNT_ID}`) {
                return [{prompt: 'Old prompt'}, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });

        const {toJSON} = render(
            <EditPromptPage
                route={mockRoute}
                navigation={mockNavigation}
            />,
        );

        expect(JSON.stringify(toJSON())).toContain('prompt::Old prompt');
    });
});
