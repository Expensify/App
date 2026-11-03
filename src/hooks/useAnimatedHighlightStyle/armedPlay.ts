/** The play a row last armed, and how far it has got. */
type ArmedPlay = {
    key: string | undefined;

    /** `armed` owes an entry and a pulse; `awaitingVisibility` is revealed and owes only the pulse; `played` owes nothing. */
    stage: 'armed' | 'awaitingVisibility' | 'played';
};

type NextArmedPlayInput = {
    /** Key of the item the row shows now. */
    highlightKey: string | undefined;

    shouldHighlight: boolean;

    /** `shouldHighlight` on the previous run, so a request that stays on doesn't arm a second play. */
    wasHighlightRequested: boolean;
};

type NextArmedPlay = {
    play: ArmedPlay | undefined;

    /** Whether a dropped play was never revealed. Its row mounted invisible, so it still needs revealing. */
    shouldRevealDroppedRow: boolean;
};

/** What a row does with its play now, and the play once that has started. */
type PlayStep = {step: 'none'; play: ArmedPlay | undefined} | {step: 'entryThenPulse' | 'pulse' | 'revealThenWait' | 'wait'; play: ArmedPlay};

/** Drops a play the row no longer shows the item for, and arms a play the row owes for the item it shows now. */
function getNextArmedPlay(previousPlay: ArmedPlay | undefined, {highlightKey, shouldHighlight, wasHighlightRequested}: NextArmedPlayInput): NextArmedPlay {
    const isPlayForThisRow = !!previousPlay && previousPlay.key === highlightKey;
    let play = previousPlay;
    let shouldRevealDroppedRow = false;
    if (previousPlay && previousPlay.stage !== 'played' && !isPlayForThisRow) {
        // The row shows another item now, so this play is dropped.
        shouldRevealDroppedRow = previousPlay.stage === 'armed';
        play = {key: previousPlay.key, stage: 'played'};
    }
    // Owed when asked for and not yet played for this item. It stays owed once armed, since some callers ask for a single render.
    if (shouldHighlight && (!wasHighlightRequested || !isPlayForThisRow)) {
        // A row already revealed keeps waiting, rather than owing a second reveal.
        const isRevealedAndWaiting = isPlayForThisRow && previousPlay.stage === 'awaitingVisibility';
        play = {key: highlightKey, stage: isRevealedAndWaiting ? 'awaitingVisibility' : 'armed'};
    }
    return {play, shouldRevealDroppedRow};
}

/** A covered row is revealed at once, since the screen may never be uncovered. Only its pulse waits. */
function getPlayStep(play: ArmedPlay | undefined, {didScreenTransitionEnd, isScreenVisible}: {didScreenTransitionEnd: boolean; isScreenVisible: boolean}): PlayStep {
    if (!play || play.stage === 'played' || !didScreenTransitionEnd) {
        return {step: 'none', play};
    }
    if (isScreenVisible) {
        return {step: play.stage === 'awaitingVisibility' ? 'pulse' : 'entryThenPulse', play: {key: play.key, stage: 'played'}};
    }
    if (play.stage === 'armed') {
        return {step: 'revealThenWait', play: {key: play.key, stage: 'awaitingVisibility'}};
    }
    return {step: 'wait', play};
}

export {getNextArmedPlay, getPlayStep};
export type {ArmedPlay};
