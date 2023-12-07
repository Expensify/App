import Str from 'expensify-common/lib/str';
import type {Message} from '@src/types/onyx/ReportNextStep';

function parseMessage(messages: Message[] | undefined) {
    let nextStepHTML = '';

    messages?.forEach((part) => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const tagType = part.type || 'span';
        nextStepHTML += `<${tagType}>${Str.safeEscape(part.text)}</${tagType}>`;
    });

    const formattedHtml = nextStepHTML
        .replace(/%expenses/g, 'these expenses')
        .replace(/%Expenses/g, 'These expenses')
        .replace(/%tobe/g, 'are');

    return `<next-steps>${formattedHtml}</next-steps>`;
}

// eslint-disable-next-line import/prefer-default-export
export {parseMessage};
