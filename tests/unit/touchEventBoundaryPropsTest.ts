/* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle -- Sentry's touch boundary keeps its internals in underscore-prefixed fields */
import touchEventBoundaryProps from '@libs/telemetry/touchEventBoundaryProps';

import CONST from '@src/CONST';

import {TouchEventBoundary} from '@sentry/react-native';

/** The part of a React fiber that Sentry's touch boundary reads while walking up from the touched view. */
type Fiber = {
    memoizedProps: Record<string, unknown>;
    elementType: string | {displayName: string};
    return?: Fiber;
};

type TouchPathItem = {name?: string; label?: string};

/** Sentry's private methods that pick the label for a touch and log it as a breadcrumb; the span is named after the same label. */
type TouchEventBoundaryInternals = {
    _onTouchStart: (event: {_targetInst: Fiber}) => void;
    _logTouchEvent: (path: TouchPathItem[], label?: string) => void;
};

/** Props of a view, plus the `displayName` of its component when it is a named component rather than a native view. */
type View = Record<string, unknown> & {displayName?: string};

/** Builds the fiber chain from the touched view up to the root, the way React Native hands it to the boundary. */
function buildFiberChain(...viewsFromTouchedUp: View[]): Fiber {
    let fiber: Fiber | undefined;
    for (const {displayName, ...props} of [...viewsFromTouchedUp].reverse()) {
        fiber = {memoizedProps: props, elementType: displayName ? {displayName} : 'RCTView', return: fiber};
    }
    if (!fiber) {
        throw new Error('A fiber chain needs at least one view');
    }
    return fiber;
}

/** Touches the view at the start of the chain and returns the label Sentry would name the span after, and the breadcrumb path. */
function touch(...viewsFromTouchedUp: View[]) {
    const boundary = new TouchEventBoundary({...TouchEventBoundary.defaultProps, ...touchEventBoundaryProps});
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the label is picked in private methods, so the test reaches them directly
    const internals = boundary as unknown as TouchEventBoundaryInternals;
    const logTouchEvent = jest.spyOn(internals, '_logTouchEvent');

    internals._onTouchStart({_targetInst: buildFiberChain(...viewsFromTouchedUp)});

    return {wasLogged: logTouchEvent.mock.calls.length > 0, path: logTouchEvent.mock.calls.at(0)?.at(0), label: logTouchEvent.mock.calls.at(0)?.at(1)};
}

describe('touchEventBoundaryProps', () => {
    it('names a tap after the nearest sentryLabel, skipping the user data in the views inside it', () => {
        // Given a list row whose label sits above views that carry a name, an email and a report ID
        // When the user taps the email inside it
        const {label, path} = touch(
            {children: 'john.smith@example.com'},
            {accessibilityLabel: 'Navigates to a chat with John Smith', testID: 'report-screen-123'},
            {sentryLabel: CONST.SENTRY_LABEL.LHN.OPTION_ROW, accessibilityLabel: 'John Smith, $879.17'},
        );

        // Then the tap is named after our label and none of the user data reaches the span or the breadcrumb
        expect(label).toBe(CONST.SENTRY_LABEL.LHN.OPTION_ROW);
        expect(path).toEqual([{label: CONST.SENTRY_LABEL.LHN.OPTION_ROW}]);
    });

    it('skips named components between the tapped view and its label', () => {
        // Given a named component with user data in its accessibility label, inside a labelled pressable
        // When the user taps the avatar
        const {label, path} = touch({displayName: 'Avatar', accessibilityLabel: 'John Smith'}, {displayName: 'Text'}, {sentryLabel: CONST.SENTRY_LABEL.LHN.OPTION_ROW});

        // Then neither the component names nor the accessibility label end up in the span or the breadcrumb
        expect(label).toBe(CONST.SENTRY_LABEL.LHN.OPTION_ROW);
        expect(path).toEqual([{label: CONST.SENTRY_LABEL.LHN.OPTION_ROW}]);
    });

    it('does not report a tap on an element without a sentryLabel', () => {
        // Given a view that only has an accessibility label, a test ID and text with user data
        // When the user taps it
        const {wasLogged, label} = touch({children: 'B. Smith, London (Licensing Trip), $879.17'}, {accessibilityLabel: 'B. Smith', testID: 'transaction-item-row'});

        // Then no span is named after it and no breadcrumb is logged
        expect(label).toBeUndefined();
        expect(wasLogged).toBe(false);
    });

    it('does not report a sentryLabel that is not one of the labels in CONST', () => {
        // Given a sentryLabel built at runtime instead of taken from CONST.SENTRY_LABEL
        // When the user taps the element with that label
        const {wasLogged} = touch({sentryLabel: 'Search-Advanced-Filter-john.smith@example.com'});

        // Then it is treated like a missing label, so a label can never carry data that wasn't written in the code
        expect(wasLogged).toBe(false);
    });
});
