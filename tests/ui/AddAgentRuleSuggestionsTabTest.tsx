import {fireEvent, render, screen} from '@testing-library/react-native';

import useSuggestedAgentRules from '@hooks/useSuggestedAgentRules';

import Navigation from '@libs/Navigation/Navigation';

import AddAgentRuleSuggestionsTab from '@pages/workspace/rules/AgentRules/AddAgentRuleSuggestionsTab';

import ROUTES from '@src/ROUTES';
import type SuggestedAgentRule from '@src/types/onyx/SuggestedAgentRule';

import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- jest.requireActual returns an untyped module object
const {View: MockView, Pressable: MockPressable, Text: MockText, TextInput: MockTextInput} = jest.requireActual('react-native');

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({
        ThumbsUp: 'ThumbsUp',
        CircleSlash: 'CircleSlash',
        Flag: 'Flag',
        Coins: 'Coins',
    })),
    useMemoizedLazyIllustrations: jest.fn(() => ({Lightbulb: 'Lightbulb'})),
}));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@hooks/useSuggestedAgentRules');
jest.mock('@hooks/useTheme', () => jest.fn(() => ({icon: '#000'})));
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
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));
jest.mock('@components/ActivityIndicator', () => jest.fn(() => null));
jest.mock('@components/Icon', () => jest.fn(() => null));
jest.mock('@components/TextInput', () => ({value, onChangeText, label}: {value?: string; onChangeText?: (text: string) => void; label?: string}) => (
    <MockTextInput
        value={value}
        onChangeText={onChangeText}
        accessibilityLabel={label}
    />
));
jest.mock('@components/BlockingViews/BlockingView', () => ({title, subtitle}: {title: string; subtitle?: string}) => (
    <>
        <MockText>{title}</MockText>
        {!!subtitle && <MockText>{subtitle}</MockText>}
    </>
));
jest.mock('@components/ButtonComposed', () => {
    function MockButton({children, onPress, isDisabled}: {children: React.ReactNode; onPress?: () => void; isDisabled?: boolean}) {
        return (
            <MockPressable
                accessibilityRole="button"
                accessibilityState={{disabled: !!isDisabled}}
                disabled={isDisabled}
                onPress={onPress}
            >
                {children}
            </MockPressable>
        );
    }
    MockButton.Text = ({children}: {children: React.ReactNode}) => <MockText>{children}</MockText>;
    return MockButton;
});
jest.mock('@components/FixedFooter', () => ({children}: {children: React.ReactNode}) => <MockView>{children}</MockView>);
jest.mock('@components/Pressable', () => ({
    PressableWithFeedback: ({children, onPress, accessibilityLabel}: {children: React.ReactNode; onPress?: () => void; accessibilityLabel?: string}) => (
        <MockPressable
            onPress={onPress}
            accessibilityLabel={accessibilityLabel}
            accessibilityRole="button"
        >
            {children}
        </MockPressable>
    ),
}));
jest.mock('@components/Text', () => ({children}: {children: React.ReactNode}) => <MockText>{children}</MockText>);

const mockedUseSuggestedAgentRules = jest.mocked(useSuggestedAgentRules);
const mockedNavigate = jest.mocked(Navigation.navigate);

const SUGGESTIONS: SuggestedAgentRule[] = [
    {
        id: 'approveUnder75',
        title: 'Approve any report that consists of expenses under $75',
        prompt: 'Approve any report that consists of expenses under $75',
    },
    {
        id: 'blockGambling',
        title: 'Block all spend from gambling or shady websites',
        prompt: 'Block all spend from gambling or shady websites',
    },
];

describe('AddAgentRuleSuggestionsTab', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedUseSuggestedAgentRules.mockReturnValue({data: SUGGESTIONS, isLoading: false});
    });

    it('renders suggestion titles from hook data', () => {
        render(<AddAgentRuleSuggestionsTab onSelectSuggestion={jest.fn()} />);

        expect(screen.getByText(SUGGESTIONS.at(0)?.title ?? '')).toBeOnTheScreen();
        expect(screen.getByText(SUGGESTIONS.at(1)?.title ?? '')).toBeOnTheScreen();
    });

    it('calls onSelectSuggestion only after a card is chosen and Next is pressed', () => {
        const onSelectSuggestion = jest.fn();
        render(<AddAgentRuleSuggestionsTab onSelectSuggestion={onSelectSuggestion} />);

        fireEvent.press(screen.getByText('common.next'));
        expect(onSelectSuggestion).not.toHaveBeenCalled();

        fireEvent.press(screen.getByLabelText(SUGGESTIONS.at(0)?.title ?? ''));
        fireEvent.press(screen.getByText('common.next'));

        expect(onSelectSuggestion).toHaveBeenCalledTimes(1);
        expect(onSelectSuggestion).toHaveBeenCalledWith(SUGGESTIONS.at(0));
    });

    it('navigates to Concierge when help is pressed', () => {
        render(<AddAgentRuleSuggestionsTab onSelectSuggestion={jest.fn()} />);

        fireEvent.press(screen.getByText('workspace.rules.agentRules.getHelpFromConcierge'));

        expect(mockedNavigate).toHaveBeenCalledWith(ROUTES.CONCIERGE);
    });

    it('filters the list by search text', () => {
        render(<AddAgentRuleSuggestionsTab onSelectSuggestion={jest.fn()} />);

        fireEvent.changeText(screen.getByLabelText('workspace.rules.agentRules.findSuggestion'), 'gambling');

        expect(screen.queryByText(SUGGESTIONS.at(0)?.title ?? '')).toBeNull();
        expect(screen.getByText(SUGGESTIONS.at(1)?.title ?? '')).toBeOnTheScreen();
    });

    it('shows the empty state when there are no suggestions', () => {
        mockedUseSuggestedAgentRules.mockReturnValue({data: [], isLoading: false});
        render(<AddAgentRuleSuggestionsTab onSelectSuggestion={jest.fn()} />);

        expect(screen.getByText('workspace.rules.agentRules.emptySuggestionsTitle')).toBeOnTheScreen();
        expect(screen.getByText('workspace.rules.agentRules.emptySuggestionsSubtitle')).toBeOnTheScreen();
    });
});
