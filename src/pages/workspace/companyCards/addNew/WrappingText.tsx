import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

// Renders plain paragraph copy as per-word <Text> nodes so it flows and wraps naturally inside a flexWrap
// row alongside tappable link nodes. Used by the company-card CSV import help text (see JSDoc below).

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
 *
 * The per-word nodes are hidden from the accessibility tree and a single visually-hidden node carries the
 * full run as one label, so TalkBack announces coherent prose instead of one node per word while the link
 * pressables around this component stay independently focusable.
 */
function WrappingText({text}: WrappingTextProps) {
    const styles = useThemeStyles();
    const {preferredLocale} = useLocalize();

    // Segment on word boundaries (rather than a whitespace regex) so locales without spaces (e.g. Japanese, Chinese)
    // also get real break opportunities, letting the run wrap within itself on narrow screens. Hermes doesn't
    // implement Intl.Segmenter (https://hermesengine.dev/docs/intl/), so fall back to splitting on whitespace,
    // keeping the separators as their own entries to preserve spacing the same way Segmenter would.
    const words =
        typeof Intl.Segmenter === 'function' ? Array.from(new Intl.Segmenter(preferredLocale, {granularity: 'word'}).segment(text), (segment) => segment.segment) : text.split(/(\s+)/);

    return (
        <>
            <Text style={styles.screenReaderOnlyAnchor}>{text}</Text>
            {words.map((word, wordIndex) => (
                <Text
                    // The word list is derived synchronously from a fixed translation and is never reordered, inserted into, or
                    // filtered, so a word's index is a stable identity. wordIndex is only needed to disambiguate repeated words
                    // within a run, since the word text alone can't. The array position is what makes it unique.
                    // eslint-disable-next-line react/no-array-index-key -- index is a stable identity for this static, never-reordered word list
                    key={`${text}-${word}-${wordIndex}`}
                    style={styles.textSupporting}
                    accessible={false}
                    aria-hidden
                >
                    {word}
                </Text>
            ))}
        </>
    );
}

WrappingText.displayName = 'WrappingText';

export default WrappingText;
