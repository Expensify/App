/**
 * @jest-environment jsdom
 */
import {render} from '@testing-library/react-native';
import React, {use} from 'react';
import {EdgeToEdge, ModalLayoutContext, useLayoutState} from '@components/Modal/v2/compound/Layout';

type Snapshot = {hasEdgeToEdge: boolean};

function Probe({onState}: {onState: (state: Snapshot) => void}) {
    const state = use(ModalLayoutContext);
    if (!state) {
        throw new Error('Probe must be rendered inside <ModalLayoutContext>');
    }
    onState({hasEdgeToEdge: state.hasEdgeToEdge});
    return null;
}

function Harness({children, onState}: {children?: React.ReactNode; onState: (state: Snapshot) => void}) {
    const state = useLayoutState();
    return (
        <ModalLayoutContext value={state}>
            <Probe onState={onState} />
            {children}
        </ModalLayoutContext>
    );
}

describe('Modal/v2/compound/Layout — EdgeToEdge slot tracking', () => {
    it('hasEdgeToEdge is false when no slot is rendered', () => {
        const states: Snapshot[] = [];
        render(<Harness onState={(state) => states.push(state)} />);
        expect(states.at(-1)?.hasEdgeToEdge).toBe(false);
    });

    it('hasEdgeToEdge becomes true after <EdgeToEdge /> mounts', () => {
        const states: Snapshot[] = [];
        render(
            <Harness onState={(state) => states.push(state)}>
                <EdgeToEdge />
            </Harness>,
        );
        expect(states.at(-1)?.hasEdgeToEdge).toBe(true);
    });

    it('hasEdgeToEdge returns to false after <EdgeToEdge /> unmounts', () => {
        const states: Snapshot[] = [];
        const {rerender} = render(
            <Harness onState={(state) => states.push(state)}>
                <EdgeToEdge />
            </Harness>,
        );
        expect(states.at(-1)?.hasEdgeToEdge).toBe(true);

        rerender(<Harness onState={(state) => states.push(state)} />);
        expect(states.at(-1)?.hasEdgeToEdge).toBe(false);
    });

    it('stays true while at least one <EdgeToEdge /> marker is mounted', () => {
        const states: Snapshot[] = [];
        const treeWith = (count: number) => (
            <Harness onState={(state) => states.push(state)}>
                {Array.from({length: count}).map((_, index) => (
                    <EdgeToEdge
                        // eslint-disable-next-line react/no-array-index-key -- order-stable test fixtures
                        key={index}
                    />
                ))}
            </Harness>
        );
        const {rerender} = render(treeWith(2));
        expect(states.at(-1)?.hasEdgeToEdge).toBe(true);

        rerender(treeWith(1));
        expect(states.at(-1)?.hasEdgeToEdge).toBe(true);

        rerender(treeWith(0));
        expect(states.at(-1)?.hasEdgeToEdge).toBe(false);
    });

    it('<EdgeToEdge /> throws when rendered outside <ModalLayoutContext>', () => {
        const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
        expect(() => render(<EdgeToEdge />)).toThrow(/<Modal\.EdgeToEdge>/);
        spy.mockRestore();
    });
});
