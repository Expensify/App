/**
 * Converts literal `\n` sequences in chart text attributes to line breaks.
 * Quoted JSON5 strings are already unescaped; unquoted values like `Total\n$1,008,800` are not.
 */
function unescapeVictoryChartText(text: string): string {
    return text.replaceAll('\\n', '\n');
}

export default unescapeVictoryChartText;
