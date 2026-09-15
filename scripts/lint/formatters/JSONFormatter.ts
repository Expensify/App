import type {FormatterResult, LintMessage} from '../types';

import Formatter from '../Formatter';
import {LINT_SEVERITY} from '../types';

type JSONReport = {
    messages: LintMessage[];
    errorCount: number;
    warningCount: number;
};

/** Never filters: a seatbelt-demoted finding cannot be recovered once dropped. */
class JSONFormatter extends Formatter {
    readonly name = 'json';

    format(messages: LintMessage[]): FormatterResult {
        const report: JSONReport = {
            messages,
            errorCount: messages.filter((message) => message.severity === LINT_SEVERITY.ERROR).length,
            warningCount: messages.filter((message) => message.severity === LINT_SEVERITY.WARNING).length,
        };
        return {text: JSON.stringify(report), errorCount: report.errorCount, warningCount: report.warningCount};
    }
}

export default JSONFormatter;
export type {JSONReport};
