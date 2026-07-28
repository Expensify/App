type HttpsErrorArguments = {message: string; status?: string; title?: string; requestID?: string};

/**
 * Custom error class useful for re-throwing fetch errors with status code or valid error responses with status 200 but non 200 jsonCode
 */
export default class HttpsError extends Error {
    name: string;

    status: string;

    title: string;

    /** Server-issued requestID, when the failure was reported in a parsed response body. */
    requestID?: string;

    constructor({message, status = '', title = '', requestID}: HttpsErrorArguments) {
        super(message);
        this.name = 'HttpsError';
        this.status = status;
        this.title = title;
        this.requestID = requestID;
    }
}
