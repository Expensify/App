/**
 * @jest-environment jsdom
 */
import {render} from '@testing-library/react-native';
import React, {use} from 'react';
import createHeadingSystem from '@components/Overlay/createHeadingSystem';
import useHeadingState from '@components/Overlay/hooks/useHeadingState';

const {StateContext, Title, Description} = createHeadingSystem('Test');

type Snapshot = {hasTitle: boolean; hasDescription: boolean; titleId: string; descriptionId: string};

function Probe({onState}: {onState: (state: Snapshot) => void}) {
    const state = use(StateContext);
    if (!state) {
        throw new Error('Probe must be rendered inside the StateContext');
    }
    onState({hasTitle: state.hasTitle, hasDescription: state.hasDescription, titleId: state.titleId, descriptionId: state.descriptionId});
    return null;
}

function Harness({children, onState}: {children?: React.ReactNode; onState: (state: Snapshot) => void}) {
    const state = useHeadingState();
    return (
        <StateContext value={state}>
            <Probe onState={onState} />
            {children}
        </StateContext>
    );
}

describe('createHeadingSystem slot presence tracking', () => {
    it('hasTitle and hasDescription are false when no slot is rendered', () => {
        const states: Snapshot[] = [];
        render(<Harness onState={(state) => states.push(state)} />);
        const last = states.at(-1);
        expect(last?.hasTitle).toBe(false);
        expect(last?.hasDescription).toBe(false);
    });

    it('hasTitle becomes true after <Title> mounts', () => {
        const states: Snapshot[] = [];
        render(
            <Harness onState={(state) => states.push(state)}>
                <Title>Heading</Title>
            </Harness>,
        );
        const last = states.at(-1);
        expect(last?.hasTitle).toBe(true);
        expect(last?.hasDescription).toBe(false);
    });

    it('hasDescription becomes true after <Description> mounts', () => {
        const states: Snapshot[] = [];
        render(
            <Harness onState={(state) => states.push(state)}>
                <Description>Body</Description>
            </Harness>,
        );
        const last = states.at(-1);
        expect(last?.hasTitle).toBe(false);
        expect(last?.hasDescription).toBe(true);
    });

    it('hasTitle returns to false after <Title> unmounts', () => {
        const states: Snapshot[] = [];
        const {rerender} = render(
            <Harness onState={(state) => states.push(state)}>
                <Title>Heading</Title>
            </Harness>,
        );
        expect(states.at(-1)?.hasTitle).toBe(true);

        rerender(<Harness onState={(state) => states.push(state)} />);
        expect(states.at(-1)?.hasTitle).toBe(false);
    });
});
