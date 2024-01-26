import Str from 'expensify-common/lib/str';
import type {Message} from '@src/types/onyx/ReportNextStep';
import EmailUtils from './EmailUtils';

function parseMessage(messages: Message[] | undefined) {
    let nextStepHTML = '';

    messages?.forEach((part) => {
        const isEmail = Str.isValidEmail(part.text);
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        let tagType = part.type ?? 'span';
        let content = Str.safeEscape(part.text);

        if (isEmail) {
            tagType = 'next-step-email';
            content = EmailUtils.prefixMailSeparatorsWithBreakOpportunities(content);
        }

        nextStepHTML += `<${tagType}>${content}</${tagType}>`;
    });

    const formattedHtml = nextStepHTML
        .replace(/%expenses/g, 'these expenses')
        .replace(/%Expenses/g, 'These expenses')
        .replace(/%tobe/g, 'are');

    return `<next-step>${formattedHtml}</next-step>`;
}

// eslint-disable-next-line import/prefer-default-export
export {parseMessage};
