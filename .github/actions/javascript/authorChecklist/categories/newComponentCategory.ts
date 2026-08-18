import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';
import promiseSome from '@github/libs/promiseSome';

import type {WebhookPayload} from '@actions/github/lib/interfaces';

import * as github from '@actions/github';
import {parse} from '@babel/parser';
import traverse from '@babel/traverse';

import type Category from './Category';

type SuperClassType = {superClass: {name?: string; object: {name: string}; property: {name: string}} | null; name: string};

type GithubPaylod = WebhookPayload & {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    pull_request?: {
        head: {
            ref?: string;
        };
    };
};

// This category no longer contributes checklist items. Each one it used to inject is now enforced
// automatically by a rule in .claude/skills/coding-standards/rules:
//   - similar component doesn't exist            -> CONSISTENCY-3 (no code duplication)
//   - props defined accurately, each documented  -> CONSISTENCY-13 (document component props)
//   - file named correctly                       -> CONSISTENCY-9 (name files after what they export)
//   - clear, non-ambiguous component name        -> CONSISTENCY-9
//   - state holds only what rendering needs      -> CLEAN-REACT-PATTERNS-5 (narrow state)
//   - Onyx selector added when data is partial   -> PERF-11 (optimize data selection)
//   - minimum code, broken into smaller parts    -> CLEAN-REACT-PATTERNS-1 (composition over configuration)
// The three class-component items (binding `this`, unnecessary binds, JSX in the render method) are
// obsolete outright: CLEAN-REACT-PATTERNS-8 forbids class components, so they could only ever be ticked
// as a formality. The retired strings live in authorChecklist.ts so already-open PRs get cleaned up.
//
// `detectReactComponent` below is kept - it is covered by tests/actions/detectReactComponent.test.ts and
// is the detector a future dynamic category (e.g. Storybook stories, deeplinks) would reuse.
const items: string[] = [];

function isComponentOrPureComponent(name?: string) {
    return name === 'Component' || name === 'PureComponent';
}

function detectReactComponent(code: string, filename: string): boolean | undefined {
    if (!code) {
        console.error('failed to get code from a filename', code, filename);
        return;
    }
    const ast = parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'], // enable jsx plugin
    });

    let isReactComponent = false;

    traverse(ast, {
        enter(path) {
            if (isReactComponent) {
                return;
            }
            if (path.isFunctionDeclaration() || path.isArrowFunctionExpression() || path.isFunctionExpression()) {
                path.traverse({
                    JSXElement() {
                        isReactComponent = true;
                        path.stop();
                    },
                });
            }
        },

        ClassDeclaration(path) {
            const {superClass} = path.node as unknown as SuperClassType;
            if (superClass && ((superClass.object?.name === 'React' && isComponentOrPureComponent(superClass.property.name)) || isComponentOrPureComponent(superClass.name))) {
                isReactComponent = true;
                path.stop();
            }
        },
    });

    return isReactComponent;
}

function nodeBase64ToUtf8(data: string) {
    return Buffer.from(data, 'base64').toString('utf-8');
}

async function detectReactComponentInFile(filename: string): Promise<boolean | undefined> {
    const params = {
        owner: CONST.GITHUB_OWNER,
        repo: CONST.APP_REPO,
        path: filename,
        ref: (github.context.payload as GithubPaylod)?.pull_request?.head.ref,
    };
    try {
        const {data} = await GithubUtils.octokit.repos.getContent(params);
        const content = nodeBase64ToUtf8('content' in data ? (data?.content ?? '') : '');
        return detectReactComponent(content, filename);
    } catch (error) {
        console.error('An unknown error occurred with the GitHub API: ', error, params);
    }
}

async function detect(changedFiles: Array<{filename: string; status: string}>): Promise<boolean> {
    const filteredFiles = changedFiles.filter(({filename, status}) => status === 'added' && (filename.endsWith('.js') || filename.endsWith('.ts') || filename.endsWith('.tsx')));
    try {
        await promiseSome(
            filteredFiles.map(({filename}) => detectReactComponentInFile(filename)),
            (result) => !!result,
        );
        return true;
    } catch (err) {
        return false;
    }
}

const newComponentCategory: Category = {
    detect,
    items,
};

export default newComponentCategory;
export {detectReactComponent};
