// Bypass haste: react-native preset defaults to iOS → would resolve to the no-op index.native.ts.
type SuppressModule = {default: () => () => void};
const suppressNextEscapeKeyUp = jest.requireActual<SuppressModule>('../../src/libs/suppressNextEscapeKeyUp/index.ts').default;

function dispatchAndCheckPropagation(key: string): boolean {
    let reached = false;
    const sentinel = () => {
        reached = true;
    };
    document.addEventListener('keyup', sentinel, true);
    // body+bubbles instead of dispatching on document: jsdom skips at-target capture listeners.
    document.body.dispatchEvent(new KeyboardEvent('keyup', {key, bubbles: true}));
    document.removeEventListener('keyup', sentinel, true);
    return reached;
}

afterEach(() => {
    // Drain any pending suppressor — the helper has module-scope state.
    dispatchAndCheckPropagation('Escape');
});

describe('suppressNextEscapeKeyUp', () => {
    it('stops propagation of the next Escape keyup', () => {
        suppressNextEscapeKeyUp();
        expect(dispatchAndCheckPropagation('Escape')).toBe(false);
    });

    it('ignores non-Escape keys', () => {
        suppressNextEscapeKeyUp();
        expect(dispatchAndCheckPropagation('Enter')).toBe(true);
    });

    it('removes itself after firing — the next Escape is not suppressed', () => {
        suppressNextEscapeKeyUp();
        dispatchAndCheckPropagation('Escape');
        expect(dispatchAndCheckPropagation('Escape')).toBe(true);
    });

    it('singleton: a second install evicts the first; only one Escape is suppressed across two installs', () => {
        suppressNextEscapeKeyUp();
        suppressNextEscapeKeyUp();
        expect(dispatchAndCheckPropagation('Escape')).toBe(false);
        expect(dispatchAndCheckPropagation('Escape')).toBe(true);
    });

    it('cleanup return defuses a pending suppressor', () => {
        const cleanup = suppressNextEscapeKeyUp();
        cleanup();
        expect(dispatchAndCheckPropagation('Escape')).toBe(true);
    });

    it('survives a document-capture preempt — no leak when an earlier document listener stops propagation', () => {
        // PopoverProvider analog: stops Escape keyup on document capture, registered before our suppressor.
        let preemptActive = true;
        const preempt = (e: KeyboardEvent) => {
            if (!preemptActive || e.key !== 'Escape') {
                return;
            }
            e.stopImmediatePropagation();
        };
        document.addEventListener('keyup', preempt, true);
        try {
            suppressNextEscapeKeyUp();
            dispatchAndCheckPropagation('Escape');
            preemptActive = false;
            expect(dispatchAndCheckPropagation('Escape')).toBe(true);
        } finally {
            document.removeEventListener('keyup', preempt, true);
        }
    });
});
