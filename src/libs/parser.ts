import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import * as PersonalDetailsUtils from './PersonalDetailsUtils';

function htmlToMarkdown(html: string) {
    const parser = new ExpensiMark();
    return parser.htmlToMarkdown(html, PersonalDetailsUtils.getAllPersonalDetails());
}

function htmlToText(html: string) {
    const parser = new ExpensiMark();
    return parser.htmlToText(html, PersonalDetailsUtils.getAllPersonalDetails());
}

export {htmlToMarkdown, htmlToText};
