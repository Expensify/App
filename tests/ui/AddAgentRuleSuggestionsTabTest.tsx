import {fireEvent, render, screen} from '@testing-library/react-native';

import useNetwork from '@hooks/useNetwork';
import useSuggestedAgentRules from '@hooks/useSuggestedAgentRules';

import AddAgentRuleSuggestionsTab from '@pages/workspace/rules/AgentRules/AddAgentRuleSuggestionsTab';

import type SuggestedAgentRule from '@src/types/onyx/SuggestedAgentRule';

import React from 'react';

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: jest.fn(() => ({Lightbulb: 'Lightbulb'})),
}));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
jest.mock('@hooks/useNetwork');
jest.mock('@hooks/useSuggestedAgentRules');
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
    const ReactModule = jest.requireActual<typeof React>('react');
    const {View} = jest.requireActual<{View: React.ComponentType<{testID?: string}>}>('react-native');
    return jest.fn(() => ReactModule.createElement(View, {testID: 'suggestions-loading-indicator'}));
});
jest.mock('@components/TextInput', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const {TextInput} = jest.requireActual<{
        TextInput: React.ComponentType<{value?: string; onChangeText?: (text: string) => void; accessibilityLabel?: string}>;
    }>('react-native');
    return ({value, onChangeText, label}: {value?: string; onChangeText?: (text: string) => void; label?: string}) =>
        ReactModule.createElement(TextInput, {
            value,
            onChangeText,
            accessibilityLabel: label,
        });
});
jest.mock('@components/BlockingViews/BlockingView', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const {Text} = jest.requireActual<{Text: React.ComponentType<{children?: React.ReactNode}>}>('react-native');
    return ({title, subtitle}: {title: string; subtitle?: string}) =>
        ReactModule.createElement(ReactModule.Fragment, null, ReactModule.createElement(Text, null, title), subtitle ? ReactModule.createElement(Text, null, subtitle) : null);
});
jest.mock('@components/Button', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const {Pressable, Text} = jest.requireActual<{
        Pressable: React.ComponentType<{
            accessibilityRole?: string;
            accessibilityState?: {disabled?: boolean};
            disabled?: boolean;
            onPress?: () => void;
            children?: React.ReactNode;
        }>;
        Text: React.ComponentType<{children?: React.ReactNode}>;
    }>('react-native');
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
    const ReactModule = jest.requireActual<typeof React>('react');
    const {View} = jest.requireActual<{View: React.ComponentType<{children?: React.ReactNode}>}>('react-native');
    return ({children}: {children: React.ReactNode}) => ReactModule.createElement(View, null, children);
});
jest.mock('@components/Pressable', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const {Pressable} = jest.requireActual<{
        Pressable: React.ComponentType<{
            onPress?: () => void;
            accessibilityLabel?: string;
            accessibilityRole?: string;
            children?: React.ReactNode;
        }>;
    }>('react-native');
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
    const ReactModule = jest.requireActual<typeof React>('react');
    const {Text} = jest.requireActual<{Text: React.ComponentType<{children?: React.ReactNode; role?: string}>}>('react-native');
    return ({children, role}: {children: React.ReactNode; role?: string}) => ReactModule.createElement(Text, {role}, children);
});

const mockedUseSuggestedAgentRules = jest.mocked(useSuggestedAgentRules);
const mockedUseNetwork = jest.mocked(useNetwork);

const AMOUNT_CATEGORY = 'Amount and spending';
const MERCHANT_CATEGORY = 'Merchant';

const SUGGESTIONS: SuggestedAgentRule[] = [
    {
        id: 'approveUnder75',
        title: 'Approve under $75 title',
        prompt: 'Approve any report that consists of expenses under $75',
        category: AMOUNT_CATEGORY,
    },
    {
        id: 'blockGambling',
        title: 'Block gambling title',
        prompt: 'Block all spend from gambling or shady websites',
        category: MERCHANT_CATEGORY,
    },
];

function getCardLabel(suggestion: SuggestedAgentRule | undefined): string {
    return `${suggestion?.title ?? ''}, ${suggestion?.prompt ?? ''}`;
}

describe('AddAgentRuleSuggestionsTab', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedUseNetwork.mockReturnValue({isOffline: false});
        mockedUseSuggestedAgentRules.mockReturnValue({data: SUGGESTIONS, isLoading: false});
    });

    it('renders each suggestion as its title with the prompt below it', () => {
        // Given the default suggestions from the hook

        // When the tab renders
        render(<AddAgentRuleSuggestionsTab onSelectSuggestion={jest.fn()} />);

        // Then each card shows the short title to scan, and the full prompt that Next copies into the rule
        expect(screen.getByText(SUGGESTIONS.at(0)?.title ?? '')).toBeOnTheScreen();
        expect(screen.getByText(SUGGESTIONS.at(0)?.prompt ?? '')).toBeOnTheScreen();
        expect(screen.getByText(SUGGESTIONS.at(1)?.title ?? '')).toBeOnTheScreen();
        expect(screen.getByText(SUGGESTIONS.at(1)?.prompt ?? '')).toBeOnTheScreen();
    });

    it('shows one header for each category, in the order each category first appears', () => {
        // Given a second amount suggestion that comes after the merchant suggestion
        mockedUseSuggestedAgentRules.mockReturnValue({
            data: [...SUGGESTIONS, {id: 'reportOver2500', title: 'Report over limit', prompt: 'Reject reports whose total is over $2,500', category: AMOUNT_CATEGORY}],
            isLoading: false,
        });

        // When the tab renders
        render(<AddAgentRuleSuggestionsTab onSelectSuggestion={jest.fn()} />);

        // Then the amount category gets one header, and the headers follow the order of the list
        const headers = screen.getAllByRole('heading');
        expect(headers).toHaveLength(2);
        expect(headers.at(0)).toHaveTextContent(AMOUNT_CATEGORY);
        expect(headers.at(1)).toHaveTextContent(MERCHANT_CATEGORY);
    });

    it('shows no header for suggestions without a category', () => {
        // Given suggestions that have no category
        mockedUseSuggestedAgentRules.mockReturnValue({data: SUGGESTIONS.map(({id, title, prompt}) => ({id, title, prompt})), isLoading: false});

        // When the tab renders
        render(<AddAgentRuleSuggestionsTab onSelectSuggestion={jest.fn()} />);

        // Then the cards render as one list with no header, because there is no section name to show
        expect(screen.getByText(SUGGESTIONS.at(0)?.title ?? '')).toBeOnTheScreen();
        expect(screen.getByText(SUGGESTIONS.at(1)?.title ?? '')).toBeOnTheScreen();
        expect(screen.queryByRole('heading')).toBeNull();
    });

    it('calls onSelectSuggestion only after a card is chosen and Next is pressed', () => {
        const onSelectSuggestion = jest.fn();
        render(<AddAgentRuleSuggestionsTab onSelectSuggestion={onSelectSuggestion} />);

        fireEvent.press(screen.getByText('common.next'));
        expect(onSelectSuggestion).not.toHaveBeenCalled();

        fireEvent.press(screen.getByLabelText(getCardLabel(SUGGESTIONS.at(0))));
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

    it('removes the header of a category that the search leaves empty', () => {
        // Given one amount suggestion and one merchant suggestion
        render(<AddAgentRuleSuggestionsTab onSelectSuggestion={jest.fn()} />);

        // When the search matches only the merchant suggestion
        fireEvent.changeText(screen.getByLabelText('workspace.rules.agentRules.findSuggestion'), 'gambling');

        // Then the amount header goes away with its only suggestion, so no empty section stays on screen
        expect(screen.queryByRole('heading', {name: AMOUNT_CATEGORY})).toBeNull();
        expect(screen.getByRole('heading', {name: MERCHANT_CATEGORY})).toBeOnTheScreen();
    });

    it('filters the list by search text against categories', () => {
        // Given one amount suggestion and one merchant suggestion
        render(<AddAgentRuleSuggestionsTab onSelectSuggestion={jest.fn()} />);

        // When the search matches a header, but no title or prompt
        fireEvent.changeText(screen.getByLabelText('workspace.rules.agentRules.findSuggestion'), 'merchant');

        // Then the suggestions under that header stay listed, because an admin can search for a header they see
        expect(screen.getByText(SUGGESTIONS.at(1)?.title ?? '')).toBeOnTheScreen();
        expect(screen.queryByText(SUGGESTIONS.at(0)?.title ?? '')).toBeNull();
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

        fireEvent.press(screen.getByLabelText(getCardLabel(SUGGESTIONS.at(0))));
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
