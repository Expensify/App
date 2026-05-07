import CONST from '@src/CONST';
import type {EnvironmentActionsContextType, EnvironmentStateContextType} from './types';

const defaultEnvironmentStateContextValue: EnvironmentStateContextType = {
    environment: CONST.ENVIRONMENT.PRODUCTION,
    environmentURL: CONST.NEW_EXPENSIFY_URL,
};

const defaultEnvironmentActionsContextValue: EnvironmentActionsContextType = {
    adjustExpensifyLinksForEnv: () => '',
};

export {defaultEnvironmentStateContextValue, defaultEnvironmentActionsContextValue};
