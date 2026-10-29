const name = 'require-a11y-disable-justification';

const ISSUE_URL_REGEX = /https?:\/\/github\.com\/(?:Expensify\/App|FormidableLabs\/eslint-plugin-react-native-a11y)\/(?:issues|pull)\/\d+/i;
const ISSUE_URL_GLOBAL_REGEX = /https?:\/\/github\.com\/(?:Expensify\/App|FormidableLabs\/eslint-plugin-react-native-a11y)\/(?:issues|pull)\/\d+/gi;
const DISABLE_A11Y_REGEX = /eslint-disable(?:-next-line|-line)?\s+[\s\S]*?react-native-a11y\//i;
const MIN_RATIONALE_LENGTH = 12;

const meta = {
    type: 'problem',
    docs: {
        description: 'Require react-native-a11y eslint-disable comments to include rationale or tracking issue link.',
        recommended: 'error',
    },
    schema: [],
    messages: {
        missingIssueOrRationale: 'react-native-a11y eslint-disable comments must include rationale or tracking issue link.',
    },
};

function normalizeComment(comment) {
    return comment.value
        .split('\n')
        .map((line) => line.replace(/^\s*\*+\s?/, '').trim())
        .join(' ')
        .replaceAll(/\s+/g, ' ')
        .trim();
}

function hasRationale(commentText) {
    const strippedComment = commentText
        .replaceAll(/eslint-disable(?:-next-line|-line)?/gi, ' ')
        .replaceAll(/[a-z0-9-]+\/[a-z0-9-]+/gi, ' ')
        .replaceAll(ISSUE_URL_GLOBAL_REGEX, ' ')
        .replaceAll('--', ' ')
        .replaceAll(/[,*]/g, ' ')
        .replaceAll(/\s+/g, ' ')
        .trim();

    return strippedComment.length >= MIN_RATIONALE_LENGTH;
}

function create(context) {
    const sourceCode = context.getSourceCode();

    return {
        Program() {
            for (const comment of sourceCode.getAllComments()) {
                const commentText = normalizeComment(comment);
                if (!DISABLE_A11Y_REGEX.test(commentText)) {
                    continue;
                }

                const hasIssueLink = ISSUE_URL_REGEX.test(commentText);
                const hasDisableRationale = hasRationale(commentText);

                if (!hasIssueLink && !hasDisableRationale) {
                    context.report({
                        loc: comment.loc,
                        messageId: 'missingIssueOrRationale',
                    });
                }
            }
        },
    };
}

export {name, meta, create};
