import * as CommonTypes from './common';

type PolicyType = CommonTypes.BaseState & {
    /** The ID of the policy */
    id: string;

    /** The name of the policy */
    name: string;

    /** The current user's role in the policy */
    role: 'admin' | 'auditor' | 'user';

    /** The policy type */
    type: 'free' | 'personal' | 'corporate' | 'team';

    /** The email of the policy owner */
    owner: string;

    /** The output currency for the policy */
    outputCurrency: string;

    /** The URL for the policy avatar */
    avatar: string;

    /**
     * Error objects keyed by field name containing errors keyed by microtime
     * E.x
     * {
     *     name: {
     *        [DateUtils.getMicroseconds()]: 'Sorry, there was an unexpected problem updating your workspace name.',
     *     }
     * }
     */
    errorFields: {
        [fieldName: string]: {
            [microtime: number]: string;
        };
    };
};

export default PolicyType;
