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
