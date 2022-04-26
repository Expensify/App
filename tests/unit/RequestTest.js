import * as Request from '../../src/libs/Request';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';

beforeAll(() => {
    global.fetch = jest.fn()
        .mockImplementation(() => Promise.resolve({
            json: () => Promise.resolve({
                jsonCode: 200,
            }),
        }));
});

beforeEach(() => {
    Request.clearMiddlewares();
});

test('Request.use() can register a middleware and it will run', () => {
    const testMiddleware = jest.fn();
    Request.use(testMiddleware);
    const request = {
        command: 'MockCommand',
        data: {authToken: 'testToken', persist: true},
    };

    Request.processWithMiddleware(request, true);
    return waitForPromisesToResolve()
        .then(() => {
            const [promise, returnedRequest, isFromSequentialQueue] = testMiddleware.mock.calls[0];
            expect(testMiddleware).toHaveBeenCalled();
            expect(returnedRequest).toEqual(request);
            expect(isFromSequentialQueue).toBe(true);
            expect(promise).toBeInstanceOf(Promise);
        });
});

test('Request.use() can register two middlewares. They can pass a response to the next and throw errors', () => {
    // Given an initial middleware that returns a promise with a resolved value
    const testMiddleware = jest.fn().mockResolvedValue({
        jsonCode: 404,
    });

    // And another middleware that will throw when it sees this jsonCode
    const errorThrowingMiddleware = promise => promise.then(response => new Promise((resolve, reject) => {
        if (response.jsonCode !== 404) {
            return;
        }

        reject(new Error('Oops'));
    }));

    Request.use(testMiddleware);
    Request.use(errorThrowingMiddleware);

    const request = {
        command: 'MockCommand',
        data: {authToken: 'testToken'},
    };

    const catchHandler = jest.fn();
    Request.processWithMiddleware(request).catch(catchHandler);
    return waitForPromisesToResolve()
        .then(() => {
            expect(catchHandler).toHaveBeenCalled();
            expect(catchHandler).toHaveBeenCalledWith(new Error('Oops'));
        });
});
