import {render} from '@testing-library/react-native';

import RNMarkdownTextInput from '@components/RNMarkdownTextInput';

import useShortMentionsList from '@hooks/useShortMentionsList';

import {parseExpensiMarkWithShortMentions} from '@libs/ParsingUtils';

import React from 'react';

const mockMarkdownTextInput = jest.fn<null, [{parser?: (text: string) => unknown}]>(() => null);

jest.mock('@expensify/react-native-live-markdown', () => ({
    MarkdownTextInput: (props: {parser?: (text: string) => unknown}) => mockMarkdownTextInput(props),
}));
jest.mock('@hooks/useShortMentionsList', () => jest.fn());
jest.mock('@hooks/useLandscapeOnBlurProxy', () => jest.fn());
jest.mock('@hooks/useTheme', () => () => ({colorScheme: 'light'}));
jest.mock('@hooks/useThemeStyles', () => () => ({dContents: {}}));
jest.mock('@libs/FormatSelectionUtils', () => jest.fn());
jest.mock('@libs/ParsingUtils', () => ({parseExpensiMarkWithShortMentions: jest.fn()}));

const mentionsList = jest.mocked(useShortMentionsList);
const parseWithMentions = jest.mocked(parseExpensiMarkWithShortMentions);

const INITIAL_MENTIONS = {availableLoginsList: ['coworker'], currentUserMentions: ['user', 'user@acme.com']};

function getParser() {
    return mockMarkdownTextInput.mock.lastCall?.[0].parser;
}

describe('RNMarkdownTextInput', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mentionsList.mockReturnValue(INITIAL_MENTIONS);
    });

    it('keeps the same default parser while the value changes', () => {
        // Given the input rendered with mention data that doesn't change
        const {rerender} = render(<RNMarkdownTextInput value="hello" />);
        const firstParser = getParser();

        // When the user types and the value changes
        rerender(<RNMarkdownTextInput value="hello world" />);

        // Then the input gets the same parser, so Live Markdown doesn't register a new one on every keystroke
        expect(firstParser).toBeDefined();
        expect(getParser()).toBe(firstParser);
    });

    test.each([
        {change: 'a coworker joins the domain', nextMentions: {...INITIAL_MENTIONS, availableLoginsList: ['coworker', 'newcomer']}},
        {change: 'the current user login changes', nextMentions: {...INITIAL_MENTIONS, currentUserMentions: ['renamed', 'renamed@acme.com']}},
    ])('gives the input a new default parser with the new mentions when $change', ({nextMentions}) => {
        // Given the input rendered with the initial mention data
        const {rerender} = render(<RNMarkdownTextInput value="@newcomer" />);
        const firstParser = getParser();

        // When the mention data changes
        mentionsList.mockReturnValue(nextMentions);
        rerender(<RNMarkdownTextInput value="@newcomer" />);

        // Then the input gets a new parser that uses the new data, because Live Markdown caches ranges by parser and text and the old parser would keep the old highlights
        const nextParser = getParser();
        expect(nextParser).not.toBe(firstParser);
        nextParser?.('@newcomer');
        expect(parseWithMentions).toHaveBeenLastCalledWith('@newcomer', nextMentions.availableLoginsList, nextMentions.currentUserMentions);
    });
});
