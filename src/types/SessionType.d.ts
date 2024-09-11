import * as CommonTypes from './common';

type SessionType = CommonTypes.BaseState & {
    /** The user's email for the current session */
    email: string;

    /** Currently logged in user authToken */
    authToken: string;

    /** Currently logged in user accountID */
    accountID: number;
};

export default SessionType;
