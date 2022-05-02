import createOnReadyTask from '../../src/libs/createOnReadyTask';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';

test('createOnReadyTask', () => {
    // Given a generic onReady task and a mock callback executed when we are ready
    const readyTask = createOnReadyTask();
    const mock = jest.fn();
    readyTask.isReady().then(mock);
    return waitForPromisesToResolve()
        .then(() => {
            expect(mock).toHaveBeenCalledTimes(0);

            // When we set ready
            readyTask.setIsReady();
            return waitForPromisesToResolve();
        })
        .then(() => {
            // Then we should expect mock to be called
            expect(mock).toHaveBeenCalledTimes(1);

            // When we reset the task and wait for it again
            readyTask.reset();
            readyTask.isReady().then(mock);
            return waitForPromisesToResolve();
        })
        .then(() => {
            // Then we should not expect mock to be called again
            expect(mock).toHaveBeenCalledTimes(1);

            // When we set it to ready again
            readyTask.setIsReady();
            return waitForPromisesToResolve();
        })
        .then(() => {
            // Then we should expect the mock to get called twice
            expect(mock).toHaveBeenCalledTimes(2);
        });
});
