import Str from 'expensify-common/lib/str';

type Message = {
    text: string;
    type?: string;
};

function parseMessage(messages: Message[] | undefined) {
    let nextStepHTML = '';

    messages?.forEach((part) => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const tagType = part.type || 'span';
        const isEmail = Str.isValidEmail(part.text);
        let content = Str.safeEscape(part.text);

        if (isEmail) {
            content = `<next-steps-email>${content}</next-steps-email>`;
        }

        nextStepHTML += `<${tagType}>${content}</${tagType}>`;
    });

    const formattedHtml = nextStepHTML
        .replace(/%expenses/g, 'this expense')
        .replace(/%Expenses/g, 'This expense')
        .replace(/%tobe/g, 'is');

    return `<next-steps>${formattedHtml}</next-steps>`;
}

// eslint-disable-next-line import/prefer-default-export
export {parseMessage};
