import debounce from 'lodash/debounce';
import {useCallback, useEffect, useRef, useState} from 'react';
import type {RefObject} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {Text as RNText} from 'react-native';

const ELLIPSIS = '...';

type TruncateProps = {
    /** The text string that may need truncation */
    text: string;

    /** Reference to the Text component that will display the text */
    ref: RefObject<RNText>;
};

/**
 * Hook for intelligently truncating text with an ellipsis in the middle.
 *
 * This hook:
 * - Measures the width of the referenced text element
 * - Determines if truncation is needed
 * - Preserves text from both the beginning and end for better context
 * - Places an ellipsis in the middle where text is removed
 *
 * @param props Object containing text to truncate and ref to the element
 * @returns Truncated text with ellipsis in the middle if needed, or original text
 */
function useTextWithMiddleEllipsis(props: TruncateProps): string {
    const {text, ref} = props;

    const [targetWidth, setTargetWidth] = useState<number>(0);
    const [shouldTruncate, setShouldTruncate] = useState<boolean>(false);
    const [displayText, setDisplayText] = useState(text);
    const [elementStyle, setElementStyle] = useState<CSSStyleDeclaration | null>(null);
    const measureDivRef = useRef<HTMLDivElement | null>(null);

    /**
     * Creates or retrieves the measurement div element
     */
    const getMeasureDiv = useCallback(() => {
        if (measureDivRef.current) {
            return measureDivRef.current;
        }

        const div = document.createElement('div');
        div.style.position = 'fixed';
        div.style.visibility = 'hidden';
        div.style.top = '0';
        div.style.left = '0';
        div.style.width = 'auto';
        div.style.whiteSpace = 'nowrap';
        document.body.appendChild(div);
        measureDivRef.current = div;
        return div;
    }, []);

    // Remove measurement div when component unmounts
    useEffect(() => {
        return () => {
            if (!measureDivRef.current) {
                return;
            }
            document.body.removeChild(measureDivRef.current);
            measureDivRef.current = null;
        };
    }, []);

    /**
     * Efficiently measures text width by reusing a single div element
     */
    const measureText = useCallback(
        (textToMeasure: string, style: CSSStyleDeclaration) => {
            const div = getMeasureDiv();
            div.textContent = textToMeasure;
            div.style.fontWeight = style.fontWeight;
            div.style.fontStyle = style.fontStyle;
            div.style.fontSize = style.fontSize;
            div.style.lineHeight = style.lineHeight;
            div.style.fontFamily = style.fontFamily;

            return div.getBoundingClientRect().width;
        },
        [getMeasureDiv],
    );

    /**
     * Calculates the target width and determines if truncation is needed
     */
    const calcTargetWidth = useCallback(() => {
        const element = ref.current;
        if (!element) {
            return;
        }

        const style = window.getComputedStyle(element as unknown as Element);
        setElementStyle(style);

        const rect = (element as unknown as Element).getBoundingClientRect();
        setTargetWidth(rect.width);

        if (style && text) {
            const measureWidth = measureText(text, style);
            setShouldTruncate(measureWidth > rect.width);
        }
    }, [text, ref, measureText]);

    // Calculate target width on mount and when text changes
    useEffect(() => {
        calcTargetWidth();
    }, [calcTargetWidth]);

    // Handle resize with requestAnimationFrame for better layout timing
    const resetAndMeasure = useCallback(() => {
        setDisplayText(text);

        requestAnimationFrame(() => {
            calcTargetWidth();
        });
    }, [text, calcTargetWidth]);

    // Set up resize listener with debounce
    useEffect(() => {
        const handleResize = debounce(() => {
            resetAndMeasure();
        }, 250);

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', resetAndMeasure);
            handleResize.cancel();
        };
    }, [resetAndMeasure]);

    /**
     * Performs the middle truncation algorithm when text needs truncation
     */
    useEffect(() => {
        if (!shouldTruncate || !elementStyle) {
            setDisplayText(text);
            return;
        }

        // Splitting text in half to start
        const len = text.length;
        let headChars = Math.floor(len / 2);
        let tailChars = len - headChars;

        let head = text.slice(0, headChars);
        let tail = text.slice(len - tailChars);

        // Binary search to find optimal split point
        while (headChars > 0 && tailChars > 0) {
            const combined = head + ELLIPSIS + tail;
            const combinedWidth = measureText(combined, elementStyle);

            if (combinedWidth <= targetWidth) {
                setDisplayText(combined);
                return;
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
        const minTruncated = text.slice(0, 1) + ELLIPSIS + text.slice(len - 1);
        setDisplayText(minTruncated);
    }, [elementStyle, shouldTruncate, targetWidth, text, measureText]);

    return displayText;
}

export default useTextWithMiddleEllipsis;
