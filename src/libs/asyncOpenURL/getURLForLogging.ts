import {sanitizeUrlForLogging} from '@libs/sanitizeLogParams';

/** Returns a version of the URL that is safe to log, without the tokens or validate codes it can carry */
function getURLForLogging<T>(url: string | ((params: T) => string)): string {
    return typeof url === 'string' ? sanitizeUrlForLogging(url) : '[function]';
}

export default getURLForLogging;
