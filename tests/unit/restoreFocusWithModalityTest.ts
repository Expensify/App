type MockTrap = {paused: boolean; pause: jest.Mock; unpause: jest.Mock};

let mockHadTabNavigation = true;

jest.mock('@libs/hadTabNavigation', () => ({
    __esModule: true,
    default: () => mockHadTabNavigation,
}));

jest.mock('@libs/sharedTrapStack', () => ({
    __esModule: true,
    default: [],
}));

const mockTrapStack = require<{default: MockTrap[]}>('@libs/sharedTrapStack').default;
const restoreFocusWithModality = require<{default: (el: HTMLElement, options?: {preventScroll?: boolean}) => void}>('@libs/restoreFocusWithModality').default;

function pushMockTrap({paused = false}: {paused?: boolean} = {}): MockTrap {
    const trap: MockTrap = {paused, pause: jest.fn(), unpause: jest.fn()};
    trap.pause.mockImplementation(() => {
        trap.paused = true;
    });
    trap.unpause.mockImplementation(() => {
        trap.paused = false;
    });
    mockTrapStack.push(trap);
    return trap;
}

beforeEach(() => {
    mockTrapStack.length = 0;
    mockHadTabNavigation = true;
});

describe('restoreFocusWithModality', () => {
    it('focuses the element with focusVisible derived from getHadTabNavigation', () => {
        const el = document.createElement('button');
        const focusSpy = jest.spyOn(el, 'focus');

        restoreFocusWithModality(el);

        expect(focusSpy).toHaveBeenCalledTimes(1);
        expect(focusSpy).toHaveBeenCalledWith({preventScroll: true, focusVisible: true});
    });

    it('passes focusVisible=false when the prior modality was not keyboard', () => {
        mockHadTabNavigation = false;
        const el = document.createElement('button');
        const focusSpy = jest.spyOn(el, 'focus');

        restoreFocusWithModality(el);

        expect(focusSpy).toHaveBeenCalledWith({preventScroll: true, focusVisible: false});
    });

    it('honors preventScroll: false so an off-screen launcher can scroll into view on modal close', () => {
        const el = document.createElement('button');
        const focusSpy = jest.spyOn(el, 'focus');

        restoreFocusWithModality(el, {preventScroll: false});

        expect(focusSpy).toHaveBeenCalledWith({preventScroll: false, focusVisible: true});
    });

    it('pauses and unpauses the topmost trap when it was active', () => {
        const trap = pushMockTrap({paused: false});
        const el = document.createElement('button');

        restoreFocusWithModality(el);

        expect(trap.pause).toHaveBeenCalledTimes(1);
        expect(trap.unpause).toHaveBeenCalledTimes(1);
    });

    it('leaves an already-paused trap untouched so a pause owned by another caller is not resurrected', () => {
        const trap = pushMockTrap({paused: true});
        const el = document.createElement('button');

        restoreFocusWithModality(el);

        expect(trap.pause).not.toHaveBeenCalled();
        expect(trap.unpause).not.toHaveBeenCalled();
        expect(trap.paused).toBe(true);
    });

    it('only affects the topmost trap', () => {
        const lower = pushMockTrap({paused: false});
        const topmost = pushMockTrap({paused: false});
        const el = document.createElement('button');

        restoreFocusWithModality(el);

        expect(topmost.pause).toHaveBeenCalledTimes(1);
        expect(topmost.unpause).toHaveBeenCalledTimes(1);
        expect(lower.pause).not.toHaveBeenCalled();
        expect(lower.unpause).not.toHaveBeenCalled();
    });

    it('is safe with an empty trap stack', () => {
        const el = document.createElement('button');
        expect(() => restoreFocusWithModality(el)).not.toThrow();
    });

    it('unpauses the trap even if el.focus throws — never leaves a trap paused', () => {
        const trap = pushMockTrap({paused: false});
        const el = document.createElement('button');
        jest.spyOn(el, 'focus').mockImplementation(() => {
            throw new Error('focus failed');
        });

        expect(() => restoreFocusWithModality(el)).toThrow('focus failed');
        expect(trap.pause).toHaveBeenCalledTimes(1);
        expect(trap.unpause).toHaveBeenCalledTimes(1);
    });

    it('unpauses the captured parent trap even when el.focus synchronously activates a new trap that takes the stack-top', () => {
        // focus-trap's unpause clears state.manuallyPaused=false BEFORE the topmost check; skipping it blocks the next trap's auto-unwind.
        const parent = pushMockTrap({paused: false});
        const el = document.createElement('button');
        jest.spyOn(el, 'focus').mockImplementation(() => {
            pushMockTrap({paused: false});
        });

        restoreFocusWithModality(el);

        expect(parent.pause).toHaveBeenCalledTimes(1);
        expect(parent.unpause).toHaveBeenCalledTimes(1);
    });
});
