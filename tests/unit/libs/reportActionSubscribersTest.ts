import {notifyNewAction, subscribeToNewActionEvent} from '@libs/actions/Report/reportActionSubscribers';

describe('subscribeToNewActionEvent', () => {
    test('notifies the subscriber of the matching report', () => {
        const callback = jest.fn();
        const unsubscribe = subscribeToNewActionEvent('1', callback);

        notifyNewAction('1', undefined, true);

        expect(callback).toHaveBeenCalledWith(true, undefined, 'local');
        unsubscribe();
    });

    test('does not notify subscribers of other reports', () => {
        const callback = jest.fn();
        const unsubscribe = subscribeToNewActionEvent('1', callback);

        notifyNewAction('2', undefined, true);

        expect(callback).not.toHaveBeenCalled();
        unsubscribe();
    });

    test('notifies every subscriber whose report id is in the list', () => {
        const firstCallback = jest.fn();
        const secondCallback = jest.fn();
        const otherCallback = jest.fn();
        const unsubscribes = [subscribeToNewActionEvent('1', firstCallback), subscribeToNewActionEvent('2', secondCallback), subscribeToNewActionEvent('3', otherCallback)];

        notifyNewAction(['1', '2'], undefined, false);

        expect(firstCallback).toHaveBeenCalled();
        expect(secondCallback).toHaveBeenCalled();
        expect(otherCallback).not.toHaveBeenCalled();
        for (const unsubscribe of unsubscribes) {
            unsubscribe();
        }
    });

    test('ignores an undefined report id', () => {
        const callback = jest.fn();
        const unsubscribe = subscribeToNewActionEvent('1', callback);

        notifyNewAction(undefined, undefined, true);

        expect(callback).not.toHaveBeenCalled();
        unsubscribe();
    });

    test('stops notifying after the unsubscribe function runs', () => {
        const callback = jest.fn();
        const unsubscribe = subscribeToNewActionEvent('1', callback);

        unsubscribe();
        notifyNewAction('1', undefined, true);

        expect(callback).not.toHaveBeenCalled();
    });

    test('identifies realtime notifications separately from local actions', () => {
        // Given a subscriber listening to the current report
        const callback = jest.fn();
        const unsubscribe = subscribeToNewActionEvent('1', callback);

        // When a realtime echo arrives without an action payload
        notifyNewAction('1', undefined, true, 'realtime');

        // Then the subscriber can distinguish it from a local money request
        expect(callback).toHaveBeenCalledWith(true, undefined, 'realtime');
        unsubscribe();
    });
});
