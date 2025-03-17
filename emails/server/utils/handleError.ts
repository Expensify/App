import type {NextFunction, Request, Response} from 'express';
import LiveReloadServer from '../LiveReloadServer';

/**
 * Handles errors and sends an HTML, JSON, or plain text response based on the request's Accept header.
 * Includes LiveReloadServer script for better development experience.
 *
 * @param err - The error object
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export default function handleError(err: Error, req: Request, res: Response, next: NextFunction): void {
    if (res.headersSent) {
        return next(err);
    }

    console.error('[SERVER ERROR]', err);

    res.status(500);

    const errorMessage = err.stack || err.message || 'Unknown error occurred';

    if (req.accepts('html')) {
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Error</title>
            </head>
            <body>
                <h1>Something went wrong :(</h1>
                <pre>${errorMessage}</pre>
                ${LiveReloadServer.clientConnectionScript}
            </body>
            </html>
        `);
        return;
    }

    if (req.accepts('json')) {
        res.json({error: 'Something went wrong!', details: err.message});
        return;
    }

    res.type('txt').send(`Something went wrong!\n${errorMessage}`);
}
