import {act, render} from '@testing-library/react-native';

import type {FormOnyxValues} from '@components/Form/types';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useOnyx from '@hooks/useOnyx';

import {updateAgentName} from '@libs/actions/Agent';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import EditNamePage from '@pages/settings/Agents/Fields/DynamicEditNamePage';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../../../utils/createMock';
import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

let mockSubmit: (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_AGENT_NAME_FORM>) => void;
let mockBack: () => void;

jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => 'home'));

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
        useNavigation: jest.fn(() => ({addListener: jest.fn(() => jest.fn())})),
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

type EditNamePageRoute = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.AGENTS.DYNAMIC_EDIT_NAME>['route'];
type EditNamePageNavigation = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.AGENTS.DYNAMIC_EDIT_NAME>['navigation'];

const mockRoute = createMock<EditNamePageRoute>({params: {accountID: TEST_ACCOUNT_ID}});
const mockSetParams = jest.fn();
const mockNavigation = createMock<EditNamePageNavigation>({setParams: mockSetParams});

describe('EditNamePage', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

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
    it('uses a numeric data ID when the resolved route came from a URL string', async () => {
        // Given a completed agent opens with the string ID produced by the dynamic route parser
        const realAccountID = 13002;
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[realAccountID]: {accountID: realAccountID, displayName: 'Created name'}});
        mockUseOnyx.mockImplementation(jest.requireActual<{default: typeof useOnyx}>('@hooks/useOnyx').default);
        render(
            <EditNamePage
                route={createMock<EditNamePageRoute>({params: {accountID: String(realAccountID)}})}
                navigation={mockNavigation}
            />,
        );
        await act(async () => waitForBatchedUpdates());

        // When Name is saved without another optimistic mapping
        act(() => mockSubmit({firstName: 'Updated name'}));

        // Then the action receives the numeric data ID and the already-canonical route is unchanged
        expect(updateAgentName).toHaveBeenCalledWith(realAccountID, 'Updated name', 'Created name');
        expect(mockSetParams).not.toHaveBeenCalled();
    });

    it.each([
        [false, false],
        [false, true],
        [true, false],
        [true, true],
    ])('saves the resolved agent with mapping on mount %s and string route ID %s', async (mappingExistsOnMount, useStringRouteID) => {
        // Given the real agent name is saved while a route can still hold the temporary accountID
        const optimisticAccountID = 7234567890123456;
        const realAccountID = 13001;
        const backPath = createDynamicRoute(DYNAMIC_ROUTES.AGENT_EDIT.getRoute(realAccountID), ROUTES.SETTINGS_AGENTS);
        await Onyx.clear();
        await Onyx.multiSet({
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: {[realAccountID]: {accountID: realAccountID, displayName: 'Saved name'}},
            [ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING]: mappingExistsOnMount ? {[optimisticAccountID]: realAccountID} : {},
        });
        mockUseOnyx.mockImplementation(jest.requireActual<{default: typeof useOnyx}>('@hooks/useOnyx').default);
        jest.mocked(useDynamicBackPath).mockReturnValue(backPath);
        // When the route opens, its mapping may already exist or arrive after mount
        render(
            <EditNamePage
                route={createMock<EditNamePageRoute>({params: {accountID: useStringRouteID ? String(optimisticAccountID) : optimisticAccountID}})}
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
        act(() => mockSubmit({firstName: 'Updated value'}));
        expect(updateAgentName).toHaveBeenCalledWith(realAccountID, 'Updated value', 'Saved name');
        expect(Navigation.goBack).toHaveBeenLastCalledWith(backPath);
        jest.mocked(Navigation.goBack).mockClear();
        act(() => mockBack());
        expect(Navigation.goBack).toHaveBeenCalledWith(backPath);
    });
});
