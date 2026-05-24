import {render} from '@testing-library/react-native';
import React from 'react';
import useOnyx from '@hooks/useOnyx';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import EditNamePage from '@pages/settings/Agents/Fields/EditNamePage';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

jest.mock('@userActions/Agent', () => ({
    updateAgentName: jest.fn(),
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
    function MockInputWrapper({inputID, defaultValue}: {inputID: string; defaultValue?: string}) {
        return `${inputID}::${defaultValue ?? ''}`;
    }
    return MockInputWrapper;
});

const mockUseOnyx = jest.mocked(useOnyx);

const TEST_ACCOUNT_ID = 12345;

type EditNamePageRoute = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.AGENTS.EDIT_NAME>['route'];
type EditNamePageNavigation = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.AGENTS.EDIT_NAME>['navigation'];

const mockRoute = {params: {accountID: TEST_ACCOUNT_ID}} as EditNamePageRoute;
const mockNavigation = {} as EditNamePageNavigation;

describe('EditNamePage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseOnyx.mockReturnValue([undefined, {status: 'loaded'}]);
    });

    it('renders page title', () => {
        const {toJSON} = render(
            <EditNamePage
                route={mockRoute}
                navigation={mockNavigation}
            />,
        );

        expect(JSON.stringify(toJSON())).toContain('editAgentNamePage.title');
    });

    it('renders agent name as default value in InputWrapper', () => {
        mockUseOnyx.mockImplementation((key, options) => {
            if (key === ONYXKEYS.PERSONAL_DETAILS_LIST && options?.selector) {
                return [{displayName: 'Old Name'}, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });

        const {toJSON} = render(
            <EditNamePage
                route={mockRoute}
                navigation={mockNavigation}
            />,
        );

        expect(JSON.stringify(toJSON())).toContain('firstName::Old Name');
    });
});
