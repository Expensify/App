import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

type WrappingTextProps = {
    /** Plain copy to render, split into per-word nodes so it wraps naturally inside a flexWrap row. */
    text: string;
};

/**
 * Renders plain copy as a sequence of per-word <Text> nodes so it flows and wraps naturally inside a
 * flexWrap row alongside tappable link nodes.
 *
 * The company-card CSV import help text mixes plain copy with tappable links (a client-side template
 * download and an external help guide). On Android, a link nested inline inside a <Text> becomes a
 * ClickableSpan whose touch area is limited to the glyph bounds, which makes it unreliable to tap (e.g.
 * at the minimum device font size). The links are therefore rendered as their own PressableWithoutFeedback
 * nodes inside a flexWrap row, and this component renders the plain copy between them as per-word <Text>
 * nodes so the paragraph still flows and wraps naturally across the row.
 */
function WrappingText({text}: WrappingTextProps) {
    const styles = useThemeStyles();

    // Keep each word (with its own leading/trailing whitespace) as a separate node so the paragraph wraps in the flexWrap row.
    // Preserving the run's own spacing means locales that don't use spaces around the links (e.g. Japanese, Chinese) aren't
    // given extra spaces the translation never intended.
    return (text.match(/\s*\S+\s*/g) ?? []).map((word, wordIndex) => (
        <Text
            // The word list is derived synchronously from a fixed translation and is never reordered, inserted into, or
            // filtered, so a word's index is a stable identity. wordIndex is only needed to disambiguate repeated words
            // within a run (the word text alone can't); the array position is what makes it unique.
            // eslint-disable-next-line react/no-array-index-key -- index is a stable identity for this static, never-reordered word list
            key={`${text}-${word}-${wordIndex}`}
            style={styles.textSupporting}
        >
            {word}
        </Text>
    ));
}

WrappingText.displayName = 'WrappingText';

export default WrappingText;
