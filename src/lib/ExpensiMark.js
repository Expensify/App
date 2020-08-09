import Str from './Str';

export default class ExpensiMark {
    constructor() {
        /**
         * The list of regex replacements to do on a comment. Check the link regex is first so links are processed
         * before other delimiters
         *
         * @type {Object[]}
         */
        this.rules = [
            {
                name: 'link',
                regex:
                    '([_*~]*?)(((?:https?):\\/\\/|www\\.)[^\\s<>*~_"\'´.-][^\\s<>"\'´]*?\\.[a-z\\d]+[^\\s<>*~"\']*)\\1',
                replacement: '$1<a href="$2" target="_blank">$2</a>$1',
            },
            {
                /**
                 * Use \b in this case because it will match on words, letters, and _:
                 * https://www.rexegg.com/regex-boundaries.html#wordboundary
                 * The !_blank is to prevent the `target="_blank">` section of the link replacement from being captured
                 * Additionally, something like `\b\_([^<>]*?)\_\b` doesn't work because it won't replace
                 * `_https://www.test.com_`
                 */
                name: 'italic',
                regex: '(?!_blank">)\\b\\_(.*?)\\_\\b',
                replacement: '<em>$1</em>',
            },
            {
                // Use \B in this case because \b doesn't match * or ~. \B will match everything that \b doesn't, so it
                // works for * and ~: https://www.rexegg.com/regex-boundaries.html#notb
                name: 'bold',
                regex: '\\B\\*(.*?)\\*\\B',
                replacement: '<strong>$1</strong>',
            },
            {
                name: 'strikethrough',
                regex: '\\B\\~(.*?)\\~\\B',
                replacement: '<del>$1</del>',
            },
            {
                name: 'newline',
                regex: '\\n',
                replacement: '<br>',
            },
        ];
    }

    /**
     * Replaces markdown with html elements
     *
     * @param {String} text
     * @returns {String}
     */
    replace(text) {
        // This ensures that any html the user puts into the comment field shows as raw html
        let safeText = Str.safeEscape(text);

        this.rules.forEach((rule) => {
            safeText = safeText.replace(new RegExp(rule.regex, 'g'), rule.replacement);
        });

        return safeText;
    }
}
