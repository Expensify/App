import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type EnvironmentValue = ValueOf<typeof CONST.ENVIRONMENT>;

type EnvironmentStateContextType = {
    /** The string value representing the current environment */
    environment: EnvironmentValue;

    /** The string value representing the URL of the current environment */
    environmentURL: string;
};

type EnvironmentActionsContextType = {
    /** Adjusts Expensify links in the given HTML content to point to the current environment URL */
    adjustExpensifyLinksForEnv: (html: string) => string;
};

export type {EnvironmentValue, EnvironmentStateContextType, EnvironmentActionsContextType};
