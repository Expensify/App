import type {ArmedPlay} from '@hooks/useAnimatedHighlightStyle/armedPlay';
import {getNextArmedPlay, getPlayStep} from '@hooks/useAnimatedHighlightStyle/armedPlay';

describe('getNextArmedPlay', () => {
    it('arms a play the first time a row is asked to highlight', () => {
        // Given a row that has never played
        const previousPlay = undefined;

        // When it is asked to highlight the item it shows
        const next = getNextArmedPlay(previousPlay, {highlightKey: 'A', shouldHighlight: true, wasHighlightRequested: false});

        // Then it owes that item an entry and a pulse
        expect(next).toEqual({play: {key: 'A', stage: 'armed'}, shouldRevealDroppedRow: false});
    });

    it('does not arm a second play while the request stays on for the same item', () => {
        // Given a row that already played for its item
        const previousPlay: ArmedPlay = {key: 'A', stage: 'played'};

        // When it re-renders with the request still on
        const next = getNextArmedPlay(previousPlay, {highlightKey: 'A', shouldHighlight: true, wasHighlightRequested: true});

        // Then it owes nothing, so a re-render never replays the highlight
        expect(next).toEqual({play: {key: 'A', stage: 'played'}, shouldRevealDroppedRow: false});
    });

    it('arms again when the request turns off and back on', () => {
        // Given a row that already played for its item
        const previousPlay: ArmedPlay = {key: 'A', stage: 'played'};

        // When the request comes back on after being off
        const next = getNextArmedPlay(previousPlay, {highlightKey: 'A', shouldHighlight: true, wasHighlightRequested: false});

        // Then the item is new again and owes another play
        expect(next).toEqual({play: {key: 'A', stage: 'armed'}, shouldRevealDroppedRow: false});
    });

    it('keeps an armed play when the request is withdrawn, since some callers ask for a single render', () => {
        // Given a row armed for its item
        const previousPlay: ArmedPlay = {key: 'A', stage: 'armed'};

        // When the request turns off before the play ran
        const next = getNextArmedPlay(previousPlay, {highlightKey: 'A', shouldHighlight: false, wasHighlightRequested: true});

        // Then the play is still owed
        expect(next).toEqual({play: {key: 'A', stage: 'armed'}, shouldRevealDroppedRow: false});
    });

    it('drops a play when the list recycles the row into another item, and reveals the row if the play never did', () => {
        // Given a row armed for item A, which mounted invisible
        const previousPlay: ArmedPlay = {key: 'A', stage: 'armed'};

        // When the list reuses the row for item B, which is not new
        const next = getNextArmedPlay(previousPlay, {highlightKey: 'B', shouldHighlight: false, wasHighlightRequested: true});

        // Then A's play is dropped, and the row is revealed so B doesn't stay invisible
        expect(next).toEqual({play: {key: 'A', stage: 'played'}, shouldRevealDroppedRow: true});
    });

    it('does not reveal a recycled row again when its dropped play had already revealed it', () => {
        // Given a covered row that was revealed for item A and waits to pulse
        const previousPlay: ArmedPlay = {key: 'A', stage: 'awaitingVisibility'};

        // When the list reuses the row for item B
        const next = getNextArmedPlay(previousPlay, {highlightKey: 'B', shouldHighlight: false, wasHighlightRequested: true});

        // Then A's pulse is dropped without a second reveal
        expect(next).toEqual({play: {key: 'A', stage: 'played'}, shouldRevealDroppedRow: false});
    });

    it('arms for the item a recycled row shows now when that item is new too', () => {
        // Given a row armed for item A
        const previousPlay: ArmedPlay = {key: 'A', stage: 'armed'};

        // When the list reuses the row for item B, which is also new, with the request on throughout
        const next = getNextArmedPlay(previousPlay, {highlightKey: 'B', shouldHighlight: true, wasHighlightRequested: true});

        // Then A's play is dropped and B gets its own
        expect(next).toEqual({play: {key: 'B', stage: 'armed'}, shouldRevealDroppedRow: true});
    });

    it('keeps a revealed row waiting for its pulse, rather than owing a second reveal', () => {
        // Given a covered row already revealed for its item, waiting to pulse
        const previousPlay: ArmedPlay = {key: 'A', stage: 'awaitingVisibility'};

        // When the request turns off and back on while the row is covered
        const next = getNextArmedPlay(previousPlay, {highlightKey: 'A', shouldHighlight: true, wasHighlightRequested: false});

        // Then the row still owes only its pulse
        expect(next).toEqual({play: {key: 'A', stage: 'awaitingVisibility'}, shouldRevealDroppedRow: false});
    });
});

describe('getPlayStep', () => {
    it('does nothing without a play owed, or before the screen transition ends, and leaves the play as it was', () => {
        // Given rows that owe nothing, and a row whose screen is still transitioning in
        const visible = {didScreenTransitionEnd: true, isScreenVisible: true};

        // When each is asked for its next step
        const steps = [
            getPlayStep(undefined, visible),
            getPlayStep({key: 'A', stage: 'played'}, visible),
            getPlayStep({key: 'A', stage: 'armed'}, {didScreenTransitionEnd: false, isScreenVisible: true}),
        ];

        // Then none of them plays anything, and the transitioning row still owes its play for when the transition ends
        expect(steps).toEqual([
            {step: 'none', play: undefined},
            {step: 'none', play: {key: 'A', stage: 'played'}},
            {step: 'none', play: {key: 'A', stage: 'armed'}},
        ]);
    });

    it('plays the entry and pulse for an armed row the user can see, and only the pulse for a row already revealed', () => {
        // Given a visible screen
        const visible = {didScreenTransitionEnd: true, isScreenVisible: true};

        // When an armed row and an already revealed row are asked for their next step
        const steps = [getPlayStep({key: 'A', stage: 'armed'}, visible), getPlayStep({key: 'A', stage: 'awaitingVisibility'}, visible)];

        // Then the armed row enters and pulses, the revealed row only pulses, and neither owes anything afterwards
        expect(steps).toEqual([
            {step: 'entryThenPulse', play: {key: 'A', stage: 'played'}},
            {step: 'pulse', play: {key: 'A', stage: 'played'}},
        ]);
    });

    it('reveals an armed row on a covered screen and waits to pulse, and only waits for a row already revealed', () => {
        // Given a covered screen, which may never be uncovered
        const covered = {didScreenTransitionEnd: true, isScreenVisible: false};

        // When an armed row and an already revealed row are asked for their next step
        const steps = [getPlayStep({key: 'A', stage: 'armed'}, covered), getPlayStep({key: 'A', stage: 'awaitingVisibility'}, covered)];

        // Then the armed row is revealed now, and both wait owing only the pulse, so the reveal is not repeated
        expect(steps).toEqual([
            {step: 'revealThenWait', play: {key: 'A', stage: 'awaitingVisibility'}},
            {step: 'wait', play: {key: 'A', stage: 'awaitingVisibility'}},
        ]);
    });
});
