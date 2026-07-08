import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';
import promiseSome from '@github/libs/promiseSome';

import * as github from '@actions/github';

import type Category from './Category';

import detectReactComponent from './detectReactComponent';

// @actions/github v9 no longer exports the WebhookPayload type on its own (its "./lib/interfaces" deep import path was
// dropped from the package's exports map), so derive it from the `context.payload` property instead.
type WebhookPayload = typeof github.context.payload;

type GithubPaylod = WebhookPayload & {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    pull_request?: {
        head: {
            ref?: string;
        };
    };
};

const items = [
    "I verified that similar component doesn't exist in the codebase",
    'I verified that all props are defined accurately and each prop has a `/** comment above it */`',
    'I verified that each file is named correctly',
    'I verified that each component has a clear name that is non-ambiguous and the purpose of the component can be inferred from the name alone',
    'I verified that the only data being stored in component state is data necessary for rendering and nothing else',
    "In component if we are not using the full Onyx data that we loaded, I've added the proper selector in order to ensure the component only re-renders when the data it is using changes",
    'For Class Components, any internal methods passed to components event handlers are bound to `this` properly so there are no scoping issues (i.e. for `onClick={this.submit}` the method `this.submit` should be bound to `this` in the constructor)',
    'I verified that component internal methods bound to `this` are necessary to be bound (i.e. avoid `this.submit = this.submit.bind(this);` if `this.submit` is never passed to a component event handler like `onClick`)',
    'I verified that all JSX used for rendering exists in the render method',
    'I verified that each component has the minimum amount of code necessary for its purpose, and it is broken down into smaller components in order to separate concerns and functions',
];

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
