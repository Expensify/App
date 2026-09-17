import CONST from '@src/CONST';

import type {EnvironmentActionsContextType, EnvironmentStateContextType} from './types';

const defaultEnvironmentStateContextValue: EnvironmentStateContextType = {
    environment: CONST.ENVIRONMENT.PRODUCTION,
    environmentURL: CONST.NEW_EXPENSIFY_URL,
};

const defaultEnvironmentActionsContextValue: EnvironmentActionsContextType = {
    // Outside of EnvironmentProvider we cannot know the current environment, so return the HTML unchanged rather
    // than an empty string, which would blank out the message this is rendering.
    adjustExpensifyLinksForEnv: (html: string) => html,
};

export {defaultEnvironmentStateContextValue, defaultEnvironmentActionsContextValue};
