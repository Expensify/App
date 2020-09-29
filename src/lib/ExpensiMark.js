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
            /**
             * Apply the code-fence first so that we avoid replacing anything inside of it that we're not supposed to
             * (aka any rule with the '(?![^<]*<\/pre>)' avoidance in it
             */
            {
                name: 'codeFence',

                // &#60; is a backtick symbol we are matching on three of them before then after a new line character
                regex: /&#x60;&#x60;&#x60;\n((?:(?!&#x60;&#x60;&#x60;)[\s\S])+)\n&#x60;&#x60;&#x60;/g,
                replacement: (match, firstCapturedGroup) => {

                    // We're using a function here to perform an additional replace on the content inside the backticks because
                    // Android is not able to use <pre> tags and does not respect whitespace characters at all like HTML does.
                    // We do not want to mess with the new lines here since they need to be converted into <br>. And we
                    // don't want to do this anywhere else since that would break HTML.
                    return `<pre>${firstCapturedGroup.replace(/(?:(?![\n\r])\s)/g, '&nbsp;')}</pre>`;
                },
            },

            /**
             * Converts markdown style links to anchor tags e.g. [Expensify](https://www.expensify.com)
             * We need to convert before the autolink rule since it will not try to create a link from an existing anchor tag.
             */
            {
                name: 'link',
                regex: /\[([\w\s\d!?]+)\]\((((?:https?):\/\/|www\.)[-\w\d.\/?=#{%:}]+)\)(?![^<]*<\/pre>)/g,
                replacement: '<a href="$2" target="_blank">$1</a>',
            },
            {
                name: 'autolink',
                regex: /(?![^<]*>|[^<>]*<\/)([_*~]*?)(((?:https?):\/\/|www\.)[^\s<>*~_"\'´.-][^\s<>"\'´]*?\.[a-z\d]+[^\s)<>*~"\']*)\1(?![^<]*<\/pre>)/g,
                replacement: '$1<a href="$2" target="_blank">$2</a>$1',
            },
            {
                /**
                 * Use \b in this case because it will match on words, letters, and _: https://www.rexegg.com/regex-boundaries.html#wordboundary
                 * The !_blank is to prevent the `target="_blank">` section of the link replacement from being captured
                 * Additionally, something like `\b\_([^<>]*?)\_\b` doesn't work because it won't replace `_https://www.test.com_`
                 */
                name: 'italic',
                regex: /(?!_blank">)\b\_(.*?)\_\b(?![^<]*<\/pre>)/g,
                replacement: '<em>$1</em>'
            },
            {
                // Use \B in this case because \b doesn't match * or ~. \B will match everything that \b doesn't, so it works for * and ~: https://www.rexegg.com/regex-boundaries.html#notb
                name: 'bold',
                regex: /\B\*(.*?)\*\B(?![^<]*<\/pre>)/g,
                replacement: '<strong>$1</strong>'
            },
            {
                name: 'strikethrough',
                regex: /\B\~(.*?)\~\B(?![^<]*<\/pre>)/g,
                replacement: '<del>$1</del>'
            },
            {
                name: 'inlineCodeBlock',

                // Use the url escaped version of a backtick (`) symbol
                regex: /\B&#x60;(.*?)&#x60;\B(?![^<]*<\/pre>)/g,
                replacement: '<code>$1</code>',
            },
            {
                name: 'newline',
                regex: /\n/g,
                replacement: '<br>',
            },
        ];
    }

    /**
     * Replaces markdown with html elements
     *
     * @param {String} text
     *
     * @returns {String}
     */
    replace(text) {
        // This ensures that any html the user puts into the comment field shows as raw html
        let replacedText = Str.safeEscape(text);

        this.rules.forEach((rule) => {
            replacedText = replacedText.replace(rule.regex, rule.replacement);
        });

        return replacedText;
    }
};
