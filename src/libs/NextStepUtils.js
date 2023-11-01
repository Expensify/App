import _ from 'underscore';
import Str from 'expensify-common/lib/str';

function parseMessage(messageToParse) {
    let nextStepHTML = '';

    _.each(messageToParse, (part) => {
        const tagType = part.type || 'span';
        nextStepHTML += `<${tagType}>${Str.safeEscape(part.text)}</${tagType}>`;
    });

    return nextStepHTML
        .replace(/%expenses/g, 'this expense')
        .replace(/%Expenses/g, 'This expense')
        .replace(/%tobe/g, 'is');
}

// eslint-disable-next-line import/prefer-default-export
export {parseMessage};
