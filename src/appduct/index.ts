/**
 * Appduct tools Melvin's App workflow calls instead of driving screens.
 *
 * Dev builds only. The require site in index.js is guarded by `__DEV__`, and `@appduct/web`
 * resolves to an inert entry outside the `development` export condition, so a release bundle
 * contains neither half.
 */
import {registerAppStateTool} from './appStateTool';
import {registerLoginTool} from './loginTool';

function registerAppductTools(): void {
    registerLoginTool();
    registerAppStateTool();
}

export {registerAppductTools};
export type {AppStateOutput} from './appStateTool';
export type {LoginInput, LoginOutput, LoginOutcome} from './loginTool';
