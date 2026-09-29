/** All times are `performance.now()` milliseconds, the clock React Native also uses for PerformanceObserver entries. */

type ScreenChange = {
    time: number;
    screen: string;
};

/** A press (fixed window after it) or a scroll (open until it ends). The latest-started active interaction owns a frame. */
type Interaction = {
    id: number;
    label: string;
    start: number;
    end?: number;
};

/** A piece of JS work, e.g. applying an API response. The latest-started active operation owns a frame. */
type Operation = {
    id: number;
    name: string;
    start: number;
    end?: number;
};

type FrameDropContext = {
    screen: string;
    interaction: string;
    operation: string;
};

/** A stretch of time during which the context didn't change. `interactionID` tells two presses with the same label apart. */
type Segment = FrameDropContext & {
    start: number;
    end: number;
    interactionID?: number;
};

type LongTask = {
    start: number;
    duration: number;
};

export type {FrameDropContext, Interaction, LongTask, Operation, ScreenChange, Segment};
