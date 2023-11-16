import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import * as PersonalDetailsUtils from './PersonalDetailsUtils';

function htmlToMarkdown(html: string) {
    const parser = new ExpensiMark();
    return parser.htmlToMarkdown(html, {personalDetails: PersonalDetailsUtils.getAllPersonalDetails()});
}

function htmlToText(html: string) {
    const parser = new ExpensiMark();
    return parser.htmlToText(html, {personalDetails: PersonalDetailsUtils.getAllPersonalDetails()});
}

export {htmlToMarkdown, htmlToText};
