import {render, screen} from '@testing-library/react-native';

import type {Emoji} from '@assets/emojis/types';

import EmojiSuggestionItem from '@components/EmojiSuggestions/EmojiSuggestionItem';

import React from 'react';

const SMILE: Emoji = {code: '😄', name: 'smile', hexcode: '1F604'};
const WAVE: Emoji = {code: '👋', name: 'wave', hexcode: '1F44B', types: ['👋🏿', '👋🏾', '👋🏽']};

describe('EmojiSuggestionItem', () => {
    it.each([
        ['renders the plain emoji code when there are no skin tone variants', SMILE, 1, '😄'],
        ['renders the preferred skin tone variant when available', WAVE, 1, '👋🏾'],
        ['falls back to the plain code when the preferred skin tone has no variant', WAVE, 9, '👋'],
    ])('%s', (_, item, preferredSkinToneIndex, expectedCode) => {
        render(
            <EmojiSuggestionItem
                item={item}
                prefix="sm"
                preferredSkinToneIndex={preferredSkinToneIndex}
            />,
        );

        expect(screen.getByText(expectedCode)).toBeOnTheScreen();
    });

    it('renders the emoji name wrapped in colons', () => {
        render(
            <EmojiSuggestionItem
                item={SMILE}
                prefix="sm"
                preferredSkinToneIndex={0}
            />,
        );

        expect(screen.getByText(':smile:')).toBeOnTheScreen();
    });
});
