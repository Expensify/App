import debounce from 'lodash/debounce';
import {useEffect, useState} from 'react';
import type {RefObject} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {Text as RNText} from 'react-native';

const ELLIPSIS = '...';

type TruncateProps = {
    /** The text string that may need truncation */
    text: string;

    /** Reference to the Text component that will display the text */
    ref: RefObject<RNText | null>;
};

type FontStyle = {
    fontWeight: string;
    fontStyle: string;
    fontSize: string;
    fontFamily: string;
};

// Singleton canvas reused across calls to avoid repeated DOM allocation
let measureCanvas: HTMLCanvasElement | null = null;

function getCanvasContext(): CanvasRenderingContext2D | null {
    if (!measureCanvas) {
        measureCanvas = document.createElement('canvas');
    }
    return measureCanvas.getContext('2d');
}

function measureTextWidth(textToMeasure: string, font: FontStyle): number {
    const ctx = getCanvasContext();
    if (!ctx) {
        return 0;
    }
    ctx.font = `${font.fontStyle} ${font.fontWeight} ${font.fontSize} ${font.fontFamily}`;
    return ctx.measureText(textToMeasure).width;
}

function truncateMiddle(text: string, width: number, font: FontStyle): string {
    // Start from the middle and progressively shrink until the text fits
    const len = text.length;
    let headChars = Math.floor(len / 2);
    let tailChars = len - headChars;

    let head = text.slice(0, headChars);
    let tail = text.slice(len - tailChars);

    while (headChars > 0 && tailChars > 0) {
        const combined = head + ELLIPSIS + tail;
        if (measureTextWidth(combined, font) <= width) {
            return combined;
        }

        // Reduce characters, prioritizing balance between head and tail
        if (headChars > tailChars && headChars > 1) {
            headChars--;
            head = text.slice(0, headChars);
        } else if (tailChars > 1) {
            tailChars--;
            tail = text.slice(len - tailChars);
        } else {
            break;
        }
    }

    // Fallback for extreme truncation
    return text.slice(0, 1) + ELLIPSIS + text.slice(len - 1);
}

/**
 * Hook for intelligently truncating text with an ellipsis in the middle.
 * Measures the referenced text element's width, then computes the truncated
 * string during render — no intermediate state or effects needed for the
 * truncation algorithm itself.
 */
function useTextWithMiddleEllipsis(props: TruncateProps): string {
    const {text, ref} = props;

    const [targetWidth, setTargetWidth] = useState<number>(0);
    const [fontStyle, setFontStyle] = useState<FontStyle | null>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) {
            return;
        }

        const measure = () => {
            const style = window.getComputedStyle(element as unknown as Element);
            const rect = (element as unknown as Element).getBoundingClientRect();
            setFontStyle({
                fontWeight: style.fontWeight,
                fontStyle: style.fontStyle,
                fontSize: style.fontSize,
                fontFamily: style.fontFamily,
            });
            setTargetWidth(rect.width);
        };

        measure();

        const handleResize = debounce(measure, 250);
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            handleResize.cancel();
        };
    }, [text, ref]);

    if (!fontStyle || !targetWidth || !text) {
        return text;
    }

    if (measureTextWidth(text, fontStyle) <= targetWidth) {
        return text;
    }

    return truncateMiddle(text, targetWidth, fontStyle);
}

export default useTextWithMiddleEllipsis;
