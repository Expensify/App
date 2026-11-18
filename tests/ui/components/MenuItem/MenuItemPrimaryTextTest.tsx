import {act, render, renderHook, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MenuItem from '@components/MenuItem';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import TextWithEmojiFragment from '@pages/inbox/report/comment/TextWithEmojiFragment';

import FontUtils from '@styles/utils/FontUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';

import React from 'react';
import {StyleSheet} from 'react-native';

const primaryLeaves = [
    {name: 'Title', Component: MenuItem.Title},
    {name: 'FieldValue', Component: MenuItem.FieldValue},
] as const;

function Wrapper({children}: React.PropsWithChildren) {
    return (
        <LocaleContextProvider>
            <MenuItem.Root>
                <MenuItem.Row>
                    <MenuItem.Content>{children}</MenuItem.Content>
                </MenuItem.Row>
            </MenuItem.Root>
        </LocaleContextProvider>
    );
}

beforeAll(async () => {
    await act(async () => {
        await IntlStore.load(CONST.LOCALES.EN);
    });
});

describe.each(primaryLeaves)('MenuItem.$name', ({Component}) => {
    it('renders mixed custom emoji and preserves the full accessible label', async () => {
        // Given mixed text needs the emoji font without changing how the row is announced
        const title = `Review ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} receipts`;

        // When a primary leaf renders the string without a caller-supplied fragment
        render(
            <Wrapper>
                <Component>{title}</Component>
            </Wrapper>,
        );

        // Then the shared renderer aligns the emoji while retaining the unmodified row label and line limit
        expect(await screen.findByLabelText(title)).toBeOnTheScreen();
        expect(screen.UNSAFE_getByType(TextWithEmojiFragment).props.alignCustomEmoji).toBe(true);
        expect(screen.getByText(CONST.CUSTOM_EMOJIS.GLOBAL_CREATE)).toHaveStyle(FontUtils.fontFamily.single.CUSTOM_EMOJI_FONT);
        expect(screen.UNSAFE_getAllByType(Text).some((text) => text.props.numberOfLines === 1)).toBe(true);
    });

    it.each(['Receipt review', CONST.CUSTOM_EMOJIS.GLOBAL_CREATE, 42])('renders %s without a mixed-emoji fragment', (children) => {
        // Given plain strings, standalone custom emoji and numbers already render correctly as Text
        // When a primary leaf receives one of these primitive values
        render(
            <Wrapper>
                <Component>{children}</Component>
            </Wrapper>,
        );

        // Then the fragment is reserved for mixed content and standalone emoji keeps its own font
        expect(screen.UNSAFE_queryByType(TextWithEmojiFragment)).toBeNull();
        expect(screen.getByText(String(children), {exact: false})).toHaveProp('numberOfLines', 1);
        if (children === CONST.CUSTOM_EMOJIS.GLOBAL_CREATE) {
            expect(screen.getByText(children, {exact: false})).toHaveStyle({fontFamily: FontUtils.fontFamily.single.CUSTOM_EMOJI_FONT.fontFamily});
        }
    });

    it('preserves explicitly composed content', () => {
        // Given callers can supply an element when a string cannot express their content
        // When the element is passed alongside its accessible label
        render(
            <Wrapper>
                <Component accessibilityLabel="Receipt review">
                    <Text>Receipt review</Text>
                </Component>
            </Wrapper>,
        );

        // Then the shared renderer leaves the element intact instead of treating it as text to split
        expect(screen.getByText('Receipt review')).toBeOnTheScreen();
        expect(screen.UNSAFE_queryByType(TextWithEmojiFragment)).toBeNull();
    });
});

describe('MenuItem.Title typography', () => {
    it.each(['Receipt review', `Review ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} receipts`])('allows regular-weight styling for %s', (title) => {
        // Given the title is bold by default but some cards need regular-weight text
        const {result} = renderHook(() => useThemeStyles());

        // When a caller layers the existing normal-weight style over the title defaults
        render(
            <Wrapper>
                <MenuItem.Title style={result.current.fontWeightNormal}>{title}</MenuItem.Title>
            </Wrapper>,
        );

        // Then both the title and its optional fragment use the override, while emoji keeps its own alignment styles
        expect(StyleSheet.flatten(screen.UNSAFE_getAllByType(Text).at(0)?.props.style)).toEqual(expect.objectContaining(result.current.fontWeightNormal));
        const fragment = screen.UNSAFE_queryByType(TextWithEmojiFragment);
        if (fragment) {
            expect(StyleSheet.flatten(fragment.props.style)).toEqual(expect.objectContaining(result.current.fontWeightNormal));
        }
    });

    it('keeps bold typography when no style override is supplied', () => {
        // Given existing title consumers rely on bold typography
        const {result} = renderHook(() => useThemeStyles());

        // When a title uses the default style
        render(
            <Wrapper>
                <MenuItem.Title>Receipt review</MenuItem.Title>
            </Wrapper>,
        );

        // Then adding the override prop does not change the default title appearance
        expect(screen.getByText('Receipt review', {exact: false})).toHaveStyle(result.current.textStrong);
    });
});
