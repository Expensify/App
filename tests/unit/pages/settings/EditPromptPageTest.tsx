import {act, render} from '@testing-library/react-native';

import type {FormOnyxValues} from '@components/Form/types';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useOnyx from '@hooks/useOnyx';

import {updateAgentPrompt} from '@libs/actions/Agent';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import EditPromptPage from '@pages/settings/Agents/Fields/DynamicEditPromptPage';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../../../utils/createMock';
import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

let mockSubmit: (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_AGENT_PROMPT_FORM>) => void;
let mockBack: () => void;

jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => 'home'));

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
    function MockHeader({title, onBackButtonPress}: {title: string; onBackButtonPress: () => void}) {
        mockBack = onBackButtonPress;
        return title;
    }
    return MockHeader;
});

jest.mock('@components/Form/FormProvider', () => {
    function MockFormProvider({children, onSubmit}: {children: React.ReactNode; onSubmit: typeof mockSubmit}) {
        mockSubmit = onSubmit;
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

type EditPromptPageRoute = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.AGENTS.DYNAMIC_EDIT_PROMPT>['route'];
type EditPromptPageNavigation = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.AGENTS.DYNAMIC_EDIT_PROMPT>['navigation'];

const mockRoute = createMock<EditPromptPageRoute>({params: {accountID: TEST_ACCOUNT_ID}});
const mockSetParams = jest.fn();
const mockNavigation = createMock<EditPromptPageNavigation>({setParams: mockSetParams});

describe('EditPromptPage', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseOnyx.mockReturnValue([undefined, {status: 'loaded'}]);
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
    it.each([false, true])('saves and returns to the resolved agent when mapping arrives before mount: %s', async (mappingExistsOnMount) => {
        // Given the real agent instructions are saved while a route can still hold the temporary accountID
        const optimisticAccountID = 7234567890123456;
        const realAccountID = 13001;
        const backPath = createDynamicRoute(DYNAMIC_ROUTES.AGENT_EDIT.getRoute(realAccountID), ROUTES.SETTINGS_AGENTS);
        await Onyx.clear();
        await Onyx.multiSet({
            [`${ONYXKEYS.COLLECTION.AGENT}${realAccountID}` as const]: {prompt: 'Saved prompt'},
            [ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING]: mappingExistsOnMount ? {[optimisticAccountID]: realAccountID} : {},
        });
        mockUseOnyx.mockImplementation(jest.requireActual<{default: typeof useOnyx}>('@hooks/useOnyx').default);
        jest.mocked(useDynamicBackPath).mockReturnValue(backPath);
        // When the route opens, its mapping may already exist or arrive after mount
        render(
            <EditPromptPage
                route={createMock<EditPromptPageRoute>({params: {accountID: optimisticAccountID}})}
                navigation={mockNavigation}
            />,
        );
        await act(async () => waitForBatchedUpdates());
        if (!mappingExistsOnMount) {
            await act(async () => {
                await Onyx.merge(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {[optimisticAccountID]: realAccountID});
                await waitForBatchedUpdates();
            });
        }

        // Then route repair, Save and Back all use the same resolved agent
        expect(mockSetParams).toHaveBeenCalledWith({accountID: String(realAccountID)});
        act(() => mockSubmit({prompt: 'Updated value'}));
        expect(updateAgentPrompt).toHaveBeenCalledWith(realAccountID, 'Updated value', 'Saved prompt');
        expect(Navigation.goBack).toHaveBeenLastCalledWith(backPath);
        jest.mocked(Navigation.goBack).mockClear();
        act(() => mockBack());
        expect(Navigation.goBack).toHaveBeenCalledWith(backPath);
    });
});
