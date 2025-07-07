"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var debounce_1 = require("lodash/debounce");
var react_1 = require("react");
var ELLIPSIS = '...';
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
function useTextWithMiddleEllipsis(props) {
    var text = props.text, ref = props.ref;
    var _a = (0, react_1.useState)(0), targetWidth = _a[0], setTargetWidth = _a[1];
    var _b = (0, react_1.useState)(false), shouldTruncate = _b[0], setShouldTruncate = _b[1];
    var _c = (0, react_1.useState)(text), displayText = _c[0], setDisplayText = _c[1];
    var _d = (0, react_1.useState)(null), elementStyle = _d[0], setElementStyle = _d[1];
    var measureDivRef = (0, react_1.useRef)(null);
    /**
     * Creates or retrieves the measurement div element
     */
    var getMeasureDiv = (0, react_1.useCallback)(function () {
        if (measureDivRef.current) {
            return measureDivRef.current;
        }
        var div = document.createElement('div');
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
    (0, react_1.useEffect)(function () {
        return function () {
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
    var measureText = (0, react_1.useCallback)(function (textToMeasure, style) {
        var div = getMeasureDiv();
        div.textContent = textToMeasure;
        div.style.fontWeight = style.fontWeight;
        div.style.fontStyle = style.fontStyle;
        div.style.fontSize = style.fontSize;
        div.style.lineHeight = style.lineHeight;
        div.style.fontFamily = style.fontFamily;
        return div.getBoundingClientRect().width;
    }, [getMeasureDiv]);
    /**
     * Calculates the target width and determines if truncation is needed
     */
    var calcTargetWidth = (0, react_1.useCallback)(function () {
        var element = ref.current;
        if (!element) {
            return;
        }
        var style = window.getComputedStyle(element);
        setElementStyle(style);
        var rect = element.getBoundingClientRect();
        setTargetWidth(rect.width);
        if (style && text) {
            var measureWidth = measureText(text, style);
            setShouldTruncate(measureWidth > rect.width);
        }
    }, [text, ref, measureText]);
    // Calculate target width on mount and when text changes
    (0, react_1.useEffect)(function () {
        calcTargetWidth();
    }, [calcTargetWidth]);
    // Handle resize with requestAnimationFrame for better layout timing
    var resetAndMeasure = (0, react_1.useCallback)(function () {
        setDisplayText(text);
        requestAnimationFrame(function () {
            calcTargetWidth();
        });
    }, [text, calcTargetWidth]);
    // Set up resize listener with debounce
    (0, react_1.useEffect)(function () {
        var handleResize = (0, debounce_1.default)(function () {
            resetAndMeasure();
        }, 250);
        window.addEventListener('resize', handleResize);
        return function () {
            window.removeEventListener('resize', resetAndMeasure);
            handleResize.cancel();
        };
    }, [resetAndMeasure]);
    /**
     * Performs the middle truncation algorithm when text needs truncation
     */
    (0, react_1.useEffect)(function () {
        if (!shouldTruncate || !elementStyle) {
            setDisplayText(text);
            return;
        }
        // Splitting text in half to start
        var len = text.length;
        var headChars = Math.floor(len / 2);
        var tailChars = len - headChars;
        var head = text.slice(0, headChars);
        var tail = text.slice(len - tailChars);
        // Binary search to find optimal split point
        while (headChars > 0 && tailChars > 0) {
            var combined = head + ELLIPSIS + tail;
            var combinedWidth = measureText(combined, elementStyle);
            if (combinedWidth <= targetWidth) {
                setDisplayText(combined);
                return;
            }
            // Reduce characters, prioritizing balance between head and tail
            if (headChars > tailChars && headChars > 1) {
                headChars--;
                head = text.slice(0, headChars);
            }
            else if (tailChars > 1) {
                tailChars--;
                tail = text.slice(len - tailChars);
            }
            else {
                break;
            }
        }
        // Fallback for extreme truncation
        var minTruncated = text.slice(0, 1) + ELLIPSIS + text.slice(len - 1);
        setDisplayText(minTruncated);
    }, [elementStyle, shouldTruncate, targetWidth, text, measureText]);
    return displayText;
}
exports.default = useTextWithMiddleEllipsis;
