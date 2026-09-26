import createScheduleOnce from '@libs/Navigation/helpers/createScheduleOnce';

describe('createScheduleOnce', () => {
    it('coalesces pending calls and can schedule again after the callback runs', async () => {
        const run = jest.fn();
        const schedule = createScheduleOnce(run);

        schedule();
        schedule();

        expect(run).not.toHaveBeenCalled();

        await Promise.resolve();

        expect(run).toHaveBeenCalledTimes(1);

        schedule();
        await Promise.resolve();

        expect(run).toHaveBeenCalledTimes(2);
    });
});
