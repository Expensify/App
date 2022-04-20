/**
 * Custom error class useful for re-throwing fetch errors with status code or valid error responses with status 200 but non 200 jsonCode
 */
export default class HttpsError extends Error {
    constructor({
        message,
        status = '',
        type = '',
        title = '',
        jsonCode = '',
    }) {
        super(message);
        this.name = 'HttpsError';
        this.status = status;
        this.title = title;
        this.type = type;
        this.jsonCode = jsonCode;
    }
}
