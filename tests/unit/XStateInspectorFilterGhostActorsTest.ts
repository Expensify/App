import type {InspectionEvent, Observer} from 'xstate';
import {createActor, createMachine} from 'xstate';
import {filterGhostActorRegistrations} from '@libs/XStateInspector/filterGhostActorRegistrations';

const machine = createMachine({
    id: 'test',
    initial: 'idle',
    states: {
        idle: {
            on: {GO: 'active'},
        },
        active: {},
    },
});

function createRecordingTarget() {
    const received: InspectionEvent[] = [];
    const target: Observer<InspectionEvent> = {
        next: (event) => received.push(event),
    };
    return {received, target};
}

function sessionEvents(received: InspectionEvent[], sessionId: string): InspectionEvent[] {
    return received.filter((event) => event.actorRef.sessionId === sessionId);
}

describe('filterGhostActorRegistrations', () => {
    it('never forwards the registration of an actor that is created but never started', () => {
        const {received, target} = createRecordingTarget();
        const inspect = filterGhostActorRegistrations(target);

        createActor(machine, {inspect});

        expect(received).toEqual([]);
    });

    it('forwards a started actor in full, with its registration first and exactly once', () => {
        const {received, target} = createRecordingTarget();
        const inspect = filterGhostActorRegistrations(target);

        const actor = createActor(machine, {inspect});
        actor.start();
        actor.send({type: 'GO'});

        const registrations = received.filter((event) => event.type === '@xstate.actor');
        expect(registrations).toHaveLength(1);
        expect(received.at(0)?.type).toBe('@xstate.actor');
        expect(received.length).toBeGreaterThan(1);
    });

    it('keeps the ghost out while the redone actor of the same machine passes through', () => {
        const {received, target} = createRecordingTarget();
        const inspect = filterGhostActorRegistrations(target);

        const ghost = createActor(machine, {inspect});
        const live = createActor(machine, {inspect});
        live.start();

        const registrations = received.filter((event) => event.type === '@xstate.actor');
        expect(registrations).toHaveLength(1);
        expect(registrations.at(0)?.actorRef.sessionId).toBe(live.sessionId);
        expect(sessionEvents(received, ghost.sessionId)).toEqual([]);
    });

    it('forwards an invoked child with its registration preceding all of its other events', () => {
        const childMachine = createMachine({
            id: 'child',
            initial: 'working',
            states: {working: {}},
        });
        const parentMachine = createMachine({
            id: 'parent',
            initial: 'running',
            states: {
                running: {
                    invoke: {src: childMachine},
                },
            },
        });
        const {received, target} = createRecordingTarget();
        const inspect = filterGhostActorRegistrations(target);

        const parent = createActor(parentMachine, {inspect});
        parent.start();

        const childSessionIds = new Set(received.filter((event) => event.type === '@xstate.actor').map((event) => event.actorRef.sessionId));
        childSessionIds.delete(parent.sessionId);
        expect(childSessionIds.size).toBe(1);

        const [childSessionId] = childSessionIds;
        const childEvents = sessionEvents(received, childSessionId);
        expect(childEvents.length).toBeGreaterThan(1);
        expect(childEvents.at(0)?.type).toBe('@xstate.actor');
    });

    it('forwards error and complete to the target observer', () => {
        const errors: unknown[] = [];
        let completed = false;
        const inspect = filterGhostActorRegistrations({
            error: (err) => errors.push(err),
            complete: () => {
                completed = true;
            },
        });

        inspect.error?.('boom');
        inspect.complete?.();

        expect(errors).toEqual(['boom']);
        expect(completed).toBe(true);
    });
});
