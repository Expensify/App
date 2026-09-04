import {render, screen} from '@testing-library/react-native';

import type {MarkdownRange} from '@expensify/react-native-live-markdown/src/commonTypes';

import MarkdownTextInput from '@expensify/react-native-live-markdown/src/MarkdownTextInput';
import MarkdownTextInputDecoratorViewNativeComponent from '@expensify/react-native-live-markdown/src/MarkdownTextInputDecoratorViewNativeComponent';
import React, {StrictMode} from 'react';

import renderScreenWithCover from '../../utils/ScreenCoverHarness';

// The component refuses a parser that is not a worklet, and the worklets babel plugin is skipped under Jest, so the
// hash that marks a function as one is attached by hand.
const parser = Object.assign((): MarkdownRange[] => [], Object.fromEntries([['__workletHash', 1]]));

/** The ids the C++ registry would resolve, which is what `.at()` in `MarkdownGlobal.cpp` looks a parse up by. */
const liveParserIds = new Set<number>();
let nextParserId = 1;
let registerCallCount = 0;

function getDecoratorParserId(): number {
    const {parserId} = screen.UNSAFE_getByType(MarkdownTextInputDecoratorViewNativeComponent).props;
    if (typeof parserId !== 'number') {
        throw new Error('The decorator view rendered without a parser id');
    }
    return parserId;
}

/**
 * Home renders the Concierge prompt composer, which is a `MarkdownTextInput`. The parser worklet lives in a C++
 * registry keyed by an id the decorator view carries, and a hide runs the effect cleanup that erases that entry.
 * Shipped, only the cleanup existed, so the erased id was never replaced: every parse after the first cover looks up
 * an id the registry no longer has, which iOS turns into empty ranges and Android into a native lookup failure, and
 * the composer stops formatting markdown for the rest of its life. The dev StrictMode gate hits the same path.
 */
describe('MarkdownTextInput parser registration', () => {
    beforeEach(() => {
        liveParserIds.clear();
        nextParserId = 1;
        registerCallCount = 0;
        global.jsi_setMarkdownRuntime = () => {};
        global.jsi_registerMarkdownWorklet = () => {
            const parserId = nextParserId;
            nextParserId += 1;
            registerCallCount += 1;
            liveParserIds.add(parserId);
            return parserId;
        };
        global.jsi_unregisterMarkdownWorklet = (parserId: number) => {
            liveParserIds.delete(parserId);
        };
    });

    it('leaves the decorator on a registered parser id across a cover and reveal', async () => {
        const screenCover = renderScreenWithCover(
            <MarkdownTextInput
                parser={parser}
                testID="concierge-composer"
            />,
        );
        expect(liveParserIds.has(getDecoratorParserId())).toBe(true);

        await screenCover.hide();
        await screenCover.reveal();

        expect(liveParserIds.has(getDecoratorParserId())).toBe(true);
        expect(liveParserIds.size).toBe(1);

        screenCover.unmount();
        expect(liveParserIds.size).toBe(0);
    });

    it('registers the parser once for a mount that is never covered', () => {
        render(
            <MarkdownTextInput
                parser={parser}
                testID="concierge-composer"
            />,
        );

        expect(registerCallCount).toBe(1);
        expect(liveParserIds.has(getDecoratorParserId())).toBe(true);
    });

    it('leaves one live parser id behind the decorator under StrictMode', () => {
        render(
            <StrictMode>
                <MarkdownTextInput
                    parser={parser}
                    testID="concierge-composer"
                />
            </StrictMode>,
        );

        expect(liveParserIds.has(getDecoratorParserId())).toBe(true);
        expect(liveParserIds.size).toBe(1);
    });
});
