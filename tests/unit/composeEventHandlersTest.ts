import composeEventHandlers from '@libs/composeEventHandlers';

type TestEvent = {defaultPrevented: boolean; preventDefault: () => void};

function makeEvent(defaultPrevented = false): TestEvent {
    const event: TestEvent = {
        defaultPrevented,
        preventDefault: () => {
            event.defaultPrevented = true;
        },
    };
    return event;
}

describe('composeEventHandlers', () => {
    it('runs the consumer handler before the library handler', () => {
        const order: string[] = [];
        const handler = composeEventHandlers<TestEvent>(
            () => order.push('consumer'),
            () => order.push('library'),
        );
        handler(makeEvent());
        expect(order).toEqual(['consumer', 'library']);
    });

    it('skips the library handler when the consumer calls preventDefault', () => {
        const library = jest.fn();
        const handler = composeEventHandlers<TestEvent>((event) => event.preventDefault(), library);
        handler(makeEvent());
        expect(library).not.toHaveBeenCalled();
    });

    it('runs the library handler unconditionally when checkForDefaultPrevented is false', () => {
        const library = jest.fn();
        const handler = composeEventHandlers<TestEvent>((event) => event.preventDefault(), library, {checkForDefaultPrevented: false});
        handler(makeEvent());
        expect(library).toHaveBeenCalledTimes(1);
    });

    it('runs only the library handler when no consumer handler is supplied', () => {
        const library = jest.fn();
        const handler = composeEventHandlers<TestEvent>(undefined, library);
        handler(makeEvent());
        expect(library).toHaveBeenCalledTimes(1);
    });

    it('respects a pre-prevented event when checkForDefaultPrevented is true', () => {
        const library = jest.fn();
        const handler = composeEventHandlers<TestEvent>(undefined, library);
        handler(makeEvent(true));
        expect(library).not.toHaveBeenCalled();
    });
});
