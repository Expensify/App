const name = 'require-a11y-disable-justification';

const ISSUE_URL_REGEX = /https?:\/\/github\.com\/(?:Expensify\/App|FormidableLabs\/eslint-plugin-react-native-a11y)\/(?:issues|pull)\/\d+/i;
const ISSUE_URL_GLOBAL_REGEX = /https?:\/\/github\.com\/(?:Expensify\/App|FormidableLabs\/eslint-plugin-react-native-a11y)\/(?:issues|pull)\/\d+/gi;
const DISABLE_A11Y_REGEX = /eslint-disable(?:-next-line|-line)?\s+[^]*?react-native-a11y\//i;

const meta = {
    type: 'problem',
    docs: {
        description: 'Require react-native-a11y eslint-disable comments to include rationale and a tracking issue link.',
        recommended: 'error',
    },
    schema: [],
    messages: {
        missingIssueAndRationale:
            'react-native-a11y eslint-disable comments must include a rationale and a tracking issue link (for example: "-- false positive in polymorphic wrapper. https://github.com/Expensify/App/issues/12345").',
        missingIssue: 'react-native-a11y eslint-disable comments must include a tracking issue link (Expensify/App or eslint-plugin-react-native-a11y).',
        missingRationale: 'react-native-a11y eslint-disable comments must include a rationale describing why the disable is needed.',
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

    return strippedComment.length >= 12;
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
                        messageId: 'missingIssueAndRationale',
                    });
                    continue;
                }

                if (!hasIssueLink) {
                    context.report({
                        loc: comment.loc,
                        messageId: 'missingIssue',
                    });
                }

                if (!hasDisableRationale) {
                    context.report({
                        loc: comment.loc,
                        messageId: 'missingRationale',
                    });
                }
            }
        },
    };
}

export {name, meta, create};
