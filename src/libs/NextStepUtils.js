import Str from 'expensify-common/lib/str';
import _ from 'underscore';

function parseMessage(messageToParse) {
    let nextStepHTML = '';

    _.each(messageToParse, (part) => {
        const tagType = part.type || 'span';
        nextStepHTML += `<${tagType}>${Str.safeEscape(part.text)}</${tagType}>`;
    });

    const formattedHtml = nextStepHTML
        .replace(/%expenses/g, 'this expense')
        .replace(/%Expenses/g, 'This expense')
        .replace(/%tobe/g, 'is');

    return `<next-steps>${formattedHtml}</next-steps>`;
}

// eslint-disable-next-line import/prefer-default-export
export {parseMessage};
