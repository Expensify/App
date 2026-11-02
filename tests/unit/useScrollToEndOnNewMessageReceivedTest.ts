import {renderHook} from '@testing-library/react-native';

import useScrollToEndOnNewMessageReceived from '@hooks/useScrollToEndOnNewMessageReceived';

type HookProps = {
    lastActionID: string;
    visibleActionsLength: number;
    shouldSkipScrollForLastAction: boolean;
};

const renderScrollHook = (scrollToEnd: jest.Mock) =>
    renderHook(
        ({lastActionID, visibleActionsLength, shouldSkipScrollForLastAction}: HookProps) =>
            useScrollToEndOnNewMessageReceived({
                // Near the newest end of the list, inside the autoscroll threshold
                scrollOffsetRef: {current: 100},
                lastActionID,
                visibleActionsLength,
                hasNewestReportAction: true,
                setIsFloatingMessageCounterVisible: jest.fn(),
                scrollToEnd,
                shouldSkipScrollForLastAction,
            }),
        {initialProps: {lastActionID: '1', visibleActionsLength: 1, shouldSkipScrollForLastAction: false}},
    );

describe('useScrollToEndOnNewMessageReceived', () => {
    it('scrolls to the newest action when one arrives near the end of the list', () => {
        // Given a list scrolled close to its newest action
        const scrollToEnd = jest.fn();
        const {rerender} = renderScrollHook(scrollToEnd);

        // When a new action arrives
        rerender({lastActionID: '2', visibleActionsLength: 2, shouldSkipScrollForLastAction: false});

        // Then the list follows it, as a chat should
        expect(scrollToEnd).toHaveBeenCalledTimes(1);
    });

    it('leaves the list in place when the new action is one it should skip', () => {
        // Given a list scrolled close to its newest action
        const scrollToEnd = jest.fn();
        const {rerender} = renderScrollHook(scrollToEnd);

        // When the new action records an edit the user made from the expense form above the comments
        rerender({lastActionID: '2', visibleActionsLength: 2, shouldSkipScrollForLastAction: true});

        // Then the list does not move, so the form the user is editing stays put
        expect(scrollToEnd).not.toHaveBeenCalled();
    });
});
