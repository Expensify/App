import {fireEvent, render, screen} from '@testing-library/react-native';

import useNetwork from '@hooks/useNetwork';
import useSuggestedAgentRules from '@hooks/useSuggestedAgentRules';

import AddAgentRuleSuggestionsTab from '@pages/workspace/rules/AgentRules/AddAgentRuleSuggestionsTab';

import type SuggestedAgentRule from '@src/types/onyx/SuggestedAgentRule';

import React from 'react';

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
jest.mock('@hooks/useNetwork');
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
jest.mock('@components/ActivityIndicator', () => {
    const ReactModule = require('react');
    const {View} = require('react-native');
    return jest.fn(() => ReactModule.createElement(View, {testID: 'suggestions-loading-indicator'}));
});
jest.mock('@components/Icon', () => jest.fn(() => null));
jest.mock('@components/TextInput', () => {
    const ReactModule = require('react');
    const {TextInput} = require('react-native');
    return ({value, onChangeText, label}: {value?: string; onChangeText?: (text: string) => void; label?: string}) =>
        ReactModule.createElement(TextInput, {
            value,
            onChangeText,
            accessibilityLabel: label,
        });
});
jest.mock('@components/BlockingViews/BlockingView', () => {
    const ReactModule = require('react');
    const {Text} = require('react-native');
    return ({title, subtitle}: {title: string; subtitle?: string}) =>
        ReactModule.createElement(ReactModule.Fragment, null, ReactModule.createElement(Text, null, title), subtitle ? ReactModule.createElement(Text, null, subtitle) : null);
});
jest.mock('@components/ButtonComposed', () => {
    const ReactModule = require('react');
    const {Pressable, Text} = require('react-native');
    function MockButton({children, onPress, isDisabled}: {children: React.ReactNode; onPress?: () => void; isDisabled?: boolean}) {
        return ReactModule.createElement(
            Pressable,
            {
                accessibilityRole: 'button',
                accessibilityState: {disabled: !!isDisabled},
                disabled: isDisabled,
                onPress,
            },
            children,
        );
    }
    MockButton.Text = ({children}: {children: React.ReactNode}) => ReactModule.createElement(Text, null, children);
    return MockButton;
});
jest.mock('@components/FixedFooter', () => {
    const ReactModule = require('react');
    const {View} = require('react-native');
    return ({children}: {children: React.ReactNode}) => ReactModule.createElement(View, null, children);
});
jest.mock('@components/Pressable', () => {
    const ReactModule = require('react');
    const {Pressable} = require('react-native');
    return {
        PressableWithFeedback: ({children, onPress, accessibilityLabel}: {children: React.ReactNode; onPress?: () => void; accessibilityLabel?: string}) =>
            ReactModule.createElement(
                Pressable,
                {
                    onPress,
                    accessibilityLabel,
                    accessibilityRole: 'button',
                },
                children,
            ),
    };
});
jest.mock('@components/Text', () => {
    const ReactModule = require('react');
    const {Text} = require('react-native');
    return ({children}: {children: React.ReactNode}) => ReactModule.createElement(Text, null, children);
});

const mockedUseSuggestedAgentRules = jest.mocked(useSuggestedAgentRules);
const mockedUseNetwork = jest.mocked(useNetwork);

const SUGGESTIONS: SuggestedAgentRule[] = [
    {
        id: 'approveUnder75',
        title: 'Approve under $75 title',
        prompt: 'Approve any report that consists of expenses under $75',
    },
    {
        id: 'blockGambling',
        title: 'Block gambling title',
        prompt: 'Block all spend from gambling or shady websites',
    },
];

describe('AddAgentRuleSuggestionsTab', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedUseNetwork.mockReturnValue({isOffline: false});
        mockedUseSuggestedAgentRules.mockReturnValue({data: SUGGESTIONS, isLoading: false});
    });

    it('renders suggestion prompts from hook data', () => {
        render(<AddAgentRuleSuggestionsTab onSelectSuggestion={jest.fn()} />);

        expect(screen.getByText(SUGGESTIONS.at(0)?.prompt ?? '')).toBeOnTheScreen();
        expect(screen.getByText(SUGGESTIONS.at(1)?.prompt ?? '')).toBeOnTheScreen();
        expect(screen.queryByText(SUGGESTIONS.at(0)?.title ?? '')).toBeNull();
        expect(screen.queryByText(SUGGESTIONS.at(1)?.title ?? '')).toBeNull();
    });

    it('calls onSelectSuggestion only after a card is chosen and Next is pressed', () => {
        const onSelectSuggestion = jest.fn();
        render(<AddAgentRuleSuggestionsTab onSelectSuggestion={onSelectSuggestion} />);

        fireEvent.press(screen.getByText('common.next'));
        expect(onSelectSuggestion).not.toHaveBeenCalled();

        fireEvent.press(screen.getByLabelText(SUGGESTIONS.at(0)?.prompt ?? ''));
        fireEvent.press(screen.getByText('common.next'));

        expect(onSelectSuggestion).toHaveBeenCalledTimes(1);
        expect(onSelectSuggestion).toHaveBeenCalledWith(SUGGESTIONS.at(0));
    });

    it('filters the list by search text against prompts', () => {
        render(<AddAgentRuleSuggestionsTab onSelectSuggestion={jest.fn()} />);

        fireEvent.changeText(screen.getByLabelText('workspace.rules.agentRules.findSuggestion'), 'gambling');

        expect(screen.queryByText(SUGGESTIONS.at(0)?.prompt ?? '')).toBeNull();
        expect(screen.getByText(SUGGESTIONS.at(1)?.prompt ?? '')).toBeOnTheScreen();
    });

    it('shows a simple no-results message when search matches nothing', () => {
        render(<AddAgentRuleSuggestionsTab onSelectSuggestion={jest.fn()} />);

        fireEvent.changeText(screen.getByLabelText('workspace.rules.agentRules.findSuggestion'), 'zzz-no-match');

        expect(screen.getByText('common.noResultsFound')).toBeOnTheScreen();
        expect(screen.queryByText('common.noResultsFoundSubtitle')).toBeNull();
        expect(screen.queryByText(SUGGESTIONS.at(0)?.prompt ?? '')).toBeNull();
        expect(screen.queryByText(SUGGESTIONS.at(1)?.prompt ?? '')).toBeNull();
    });

    it('disables Next when the selected suggestion is filtered out', () => {
        const onSelectSuggestion = jest.fn();
        render(<AddAgentRuleSuggestionsTab onSelectSuggestion={onSelectSuggestion} />);

        fireEvent.press(screen.getByLabelText(SUGGESTIONS.at(0)?.prompt ?? ''));
        fireEvent.changeText(screen.getByLabelText('workspace.rules.agentRules.findSuggestion'), 'gambling');
        fireEvent.press(screen.getByText('common.next'));

        expect(onSelectSuggestion).not.toHaveBeenCalled();
    });

    it('shows a loading indicator while suggestions are loading', () => {
        mockedUseSuggestedAgentRules.mockReturnValue({data: [], isLoading: true});
        render(<AddAgentRuleSuggestionsTab onSelectSuggestion={jest.fn()} />);

        expect(screen.getByTestId('suggestions-loading-indicator')).toBeOnTheScreen();
        expect(screen.queryByText('workspace.rules.agentRules.emptySuggestionsTitle')).toBeNull();
    });

    it('shows the empty state when there are no suggestions', () => {
        mockedUseSuggestedAgentRules.mockReturnValue({data: [], isLoading: false});
        render(<AddAgentRuleSuggestionsTab onSelectSuggestion={jest.fn()} />);

        expect(screen.getByText('workspace.rules.agentRules.emptySuggestionsTitle')).toBeOnTheScreen();
        expect(screen.getByText('workspace.rules.agentRules.emptySuggestionsSubtitle')).toBeOnTheScreen();
    });

    it('shows the offline empty state instead of a spinner when offline and still loading', () => {
        mockedUseNetwork.mockReturnValue({isOffline: true});
        mockedUseSuggestedAgentRules.mockReturnValue({data: [], isLoading: true});
        render(<AddAgentRuleSuggestionsTab onSelectSuggestion={jest.fn()} />);

        expect(screen.queryByTestId('suggestions-loading-indicator')).toBeNull();
        expect(screen.getByText('workspace.rules.agentRules.emptySuggestionsTitle')).toBeOnTheScreen();
        expect(screen.getByText('common.youAppearToBeOffline')).toBeOnTheScreen();
    });

    it('shows the offline empty subtitle when offline with no suggestions', () => {
        mockedUseNetwork.mockReturnValue({isOffline: true});
        mockedUseSuggestedAgentRules.mockReturnValue({data: [], isLoading: false});
        render(<AddAgentRuleSuggestionsTab onSelectSuggestion={jest.fn()} />);

        expect(screen.getByText('workspace.rules.agentRules.emptySuggestionsTitle')).toBeOnTheScreen();
        expect(screen.getByText('common.youAppearToBeOffline')).toBeOnTheScreen();
        expect(screen.queryByText('workspace.rules.agentRules.emptySuggestionsSubtitle')).toBeNull();
    });
});
