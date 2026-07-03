// Bypass haste: react-native preset defaults to iOS → would resolve to the no-op index.native.ts.
type ClaimModule = {default: (handler: () => void) => () => void};
const claimEscapeKeyDown = jest.requireActual<ClaimModule>('../../src/libs/claimEscapeKeyDown/index.ts').default;

function dispatchKeyDown(key: string): boolean {
    let reached = false;
    const sentinel = () => {
        reached = true;
    };
    document.addEventListener('keydown', sentinel, true);
    document.body.dispatchEvent(new KeyboardEvent('keydown', {key, bubbles: true}));
    document.removeEventListener('keydown', sentinel, true);
    return reached;
}

describe('claimEscapeKeyDown', () => {
    it('calls the handler on Escape and stops document-level propagation', () => {
        const handler = jest.fn();
        const cleanup = claimEscapeKeyDown(handler);
        try {
            expect(dispatchKeyDown('Escape')).toBe(false);
            expect(handler).toHaveBeenCalledTimes(1);
        } finally {
            cleanup();
        }
    });

    it('ignores non-Escape keys', () => {
        const handler = jest.fn();
        const cleanup = claimEscapeKeyDown(handler);
        try {
            expect(dispatchKeyDown('Enter')).toBe(true);
            expect(handler).not.toHaveBeenCalled();
        } finally {
            cleanup();
        }
    });

    it('cleanup detaches the listener', () => {
        const handler = jest.fn();
        const cleanup = claimEscapeKeyDown(handler);
        cleanup();
        expect(dispatchKeyDown('Escape')).toBe(true);
        expect(handler).not.toHaveBeenCalled();
    });

    it('runs ahead of a document-capture handler — preempts the shortcut-stack analog', () => {
        // Simulate react-native-key-command's document-capture keydown listener (which would walk the shortcut stack).
        const stackWalker = jest.fn();
        document.addEventListener('keydown', stackWalker, true);
        const handler = jest.fn();
        const cleanup = claimEscapeKeyDown(handler);
        try {
            dispatchKeyDown('Escape');
            expect(handler).toHaveBeenCalledTimes(1);
            expect(stackWalker).not.toHaveBeenCalled();
        } finally {
            cleanup();
            document.removeEventListener('keydown', stackWalker, true);
        }
    });
});
