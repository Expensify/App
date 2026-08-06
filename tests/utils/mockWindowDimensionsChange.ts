import type {EmitterSubscription, ScaledSize} from 'react-native';

import {Dimensions} from 'react-native';

type WindowDimensionsChangeMock = {
    /** Delivers a window size change to whoever subscribed to Dimensions. */
    emit: (size: ScaledSize) => void;

    /** Replaces the size Dimensions.get reports, for code that reads it when it subscribes. */
    setCurrentSize: (size: ScaledSize) => void;

    /** The remove function of the subscription, so tests can check that it was cleaned up. */
    removeSubscription: jest.Mock;

    /** How many subscriptions were opened, which tells apart a shared store from a per screen listener. */
    getSubscriptionCount: () => number;
};

/** Builds a window size, the shape Dimensions reports for both the window and the screen. */
function buildWindowSize(width: number, height: number): ScaledSize {
    return {width, height, scale: 2, fontScale: 1};
}

/**
 * Takes over the Dimensions change events for a test. React Native does not emit them in Jest, and the code that
 * reveals deprioritized screens on a resize is driven entirely by them.
 */
function mockWindowDimensionsChange(initialSize: ScaledSize): WindowDimensionsChangeMock {
    let changeHandler: ((dimensions: {window: ScaledSize; screen: ScaledSize}) => void) | undefined;
    let subscriptionCount = 0;
    const removeSubscription = jest.fn();

    const getSpy = jest.spyOn(Dimensions, 'get').mockReturnValue(initialSize);
    jest.spyOn(Dimensions, 'addEventListener').mockImplementation((_type, handler) => {
        changeHandler = handler;
        subscriptionCount++;
        // Only `remove` is ever called on the subscription, and an EmitterSubscription cannot be built here
        // without an emitter, so the mock is narrowed by hand.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        return {remove: removeSubscription} as unknown as EmitterSubscription;
    });

    return {
        emit: (size: ScaledSize) => changeHandler?.({window: size, screen: size}),
        setCurrentSize: (size: ScaledSize) => getSpy.mockReturnValue(size),
        removeSubscription,
        getSubscriptionCount: () => subscriptionCount,
    };
}

export type {WindowDimensionsChangeMock};
export {mockWindowDimensionsChange, buildWindowSize};
