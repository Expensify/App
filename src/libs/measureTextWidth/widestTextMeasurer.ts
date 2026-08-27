import CONST from '@src/CONST';

import type {MeasurableFont} from './types';

import measureTextWidth from './index';

const {MEASURED_CANDIDATES_PER_COLUMN} = CONST.TABLES.DYNAMIC_COLUMNS;

type FontCandidates = {
    font: MeasurableFont;

    /** The longest strings seen for this font, ascending by length, capped at `MEASURED_CANDIDATES_PER_COLUMN`. */
    texts: string[];
};

/**
 * Collects the text rendered in a column and reports how wide its widest string renders.
 *
 * Text is grouped by font, because the same string renders wider in a larger or bolder font, so the longest string
 * overall isn't necessarily the widest one. Only the longest few strings per font are kept, since character count is a
 * good (if imperfect) proxy for rendered width, and measuring every row of a large table would be wasteful.
 *
 * Candidates are kept in a small sorted array rather than by sorting everything at the end, so adding a row costs the
 * same no matter how many rows the table has. That matters on tables with tens of thousands of rows, where collecting
 * and sorting every string would dominate the cost of sizing the columns.
 */
type WidestTextMeasurer = {
    /** Records a string rendered in this column. Empty strings are ignored. */
    add: (text: string | undefined, font?: MeasurableFont) => void;

    /**
     * Measures the widest string collected, or `null` when the platform can't measure text. Returns 0 when nothing was
     * collected.
     */
    getWidestWidth: () => number | null;
};

/**
 * Inserts `text` into `texts` (ascending by length) if it is among the longest seen so far, dropping the shortest once
 * the cap is reached.
 */
function keepLongestText(texts: string[], text: string) {
    if (texts.length >= MEASURED_CANDIDATES_PER_COLUMN && text.length <= (texts.at(0)?.length ?? 0)) {
        return;
    }

    // The array holds at most `MEASURED_CANDIDATES_PER_COLUMN` entries, so this scan is bounded by that constant.
    const insertionIndex = texts.findIndex((candidate) => candidate.length > text.length);
    texts.splice(insertionIndex === -1 ? texts.length : insertionIndex, 0, text);

    if (texts.length > MEASURED_CANDIDATES_PER_COLUMN) {
        texts.shift();
    }
}

function createWidestTextMeasurer(): WidestTextMeasurer {
    const candidatesByFont = new Map<string, FontCandidates>();

    return {
        add: (text, font = {}) => {
            if (!text) {
                return;
            }

            const fontKey = `${font.fontSize ?? ''}|${font.fontWeight ?? ''}|${font.fontFamily ?? ''}`;
            const existingCandidates = candidatesByFont.get(fontKey);

            if (existingCandidates) {
                keepLongestText(existingCandidates.texts, text);
                return;
            }

            candidatesByFont.set(fontKey, {font, texts: [text]});
        },

        getWidestWidth: () => {
            let widestWidth = 0;

            for (const {font, texts} of candidatesByFont.values()) {
                for (const text of texts) {
                    const width = measureTextWidth(text, font);

                    if (width === null) {
                        return null;
                    }

                    widestWidth = Math.max(widestWidth, width);
                }
            }

            return widestWidth;
        },
    };
}

export default createWidestTextMeasurer;
