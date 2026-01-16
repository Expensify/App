/**
 * Utility functions for detecting and working with ESLint disable comments.
 */

const ESLINT_DISABLE_PATTERNS = {
    FILE_KEYWORDS: ['// eslint-disable ', '/* eslint-disable '],
    LINE_KEYWORDS: ['// eslint-disable-next-line ', '/* eslint-disable-next-line '],
} as const;

const EslintUtils = {
    /**
     * Check if a line of code contains an eslint-disable comment for specific rules.
     *
     * @param content - The line content to check
     * @param isFileLevel - Whether to check for file-level disable comments (true) or line-level (false)
     * @param rules - Array of ESLint rule names to check for (e.g., ['react-hooks'])
     * @returns True if the line contains a matching eslint-disable comment
     */
    hasEslintDisableComment(content: string, isFileLevel: boolean, rules: string[]): boolean {
        const trimmedContent = content.trim();

        const keywords = isFileLevel ? ESLINT_DISABLE_PATTERNS.FILE_KEYWORDS : ESLINT_DISABLE_PATTERNS.LINE_KEYWORDS;
        const includesKeyword = keywords.some((keyword) => trimmedContent.startsWith(keyword));

        return includesKeyword && rules.some((rule) => trimmedContent.includes(rule));
    },
};

export default EslintUtils;
export {ESLINT_DISABLE_PATTERNS};
