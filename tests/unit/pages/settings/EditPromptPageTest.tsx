import {act, fireEvent, render} from '@testing-library/react-native';

import type {FormOnyxValues} from '@components/Form/types';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useOnyx from '@hooks/useOnyx';

import {updateAgentPrompt} from '@libs/actions/Agent';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import EditPromptPage from '@pages/settings/Agents/Fields/DynamicEditPromptPage';
import scrollToMultilineInput from '@pages/settings/Agents/scrollToMultilineInput';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';
import {Platform, View} from 'react-native';
import Onyx from 'react-native-onyx';

import createMock from '../../../utils/createMock';
import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

let mockSubmit: (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_AGENT_PROMPT_FORM>) => void;
let mockBack: () => void;

jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => 'home'));

const mockPromptMount = jest.fn();
const mockPromptProps = jest.fn<void, [{onFocus?: () => void; onBlur?: () => void}]>();

jest.mock('@pages/settings/Agents/scrollToMultilineInput', () => jest.fn());

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
    const {useEffect} = jest.requireActual<typeof React>('react');
    function MockInputWrapper({inputID, defaultValue, ...props}: {inputID: string; defaultValue?: string; onFocus?: () => void; onBlur?: () => void}) {
        mockPromptProps(props);
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
const mockSetParams = jest.fn();
const mockNavigation = createMock<EditPromptPageNavigation>({setParams: mockSetParams});

describe('EditPromptPage', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

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

    it('reveals the focused prompt after rotation changes its layout', () => {
        // Given an iOS prompt that is being edited, focus will survive rotation.
        const platform = jest.replaceProperty(Platform, 'OS', 'ios');
        const {UNSAFE_getAllByType: getAllByType} = render(
            <EditPromptPage
                route={mockRoute}
                navigation={mockNavigation}
            />,
        );
        act(() => mockPromptProps.mock.lastCall?.[0].onFocus?.());
        jest.mocked(scrollToMultilineInput).mockClear();
        const promptContainer = getAllByType(View).find((view) => {
            const child: unknown = view.props.children;
            return React.isValidElement<{inputID?: string}>(child) && child.props.inputID === 'prompt';
        });
        if (!promptContainer) {
            throw new Error('Prompt container not found');
        }

        // When rotation moves the still-focused field, the updated offset must be used without another focus event.
        fireEvent(promptContainer, 'layout', {nativeEvent: {layout: {x: 0, y: 120, width: 600, height: 76}}});

        // Then the field is revealed using the newly measured position.
        expect(scrollToMultilineInput).toHaveBeenLastCalledWith(expect.anything(), true, 120);

        // When editing ends, later layout changes should preserve the user's scroll position.
        act(() => mockPromptProps.mock.lastCall?.[0].onBlur?.());
        jest.mocked(scrollToMultilineInput).mockClear();
        fireEvent(promptContainer, 'layout', {nativeEvent: {layout: {x: 0, y: 180, width: 300, height: 200}}});

        // Then the page does not scroll to an unfocused field.
        expect(scrollToMultilineInput).not.toHaveBeenCalled();
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
