import {render, screen} from '@testing-library/react-native';

import FSClassView from '@components/FSClassView';

import useInputFSClass from '@hooks/useInputFSClass';

import type {SensitiveInputHints} from '@libs/Fullstory/isSensitiveInput';
import type {FSClass} from '@libs/Fullstory/types';

import CONST from '@src/CONST';

import React from 'react';

type ProbeProps = SensitiveInputHints & {
    forwardedFSClass?: FSClass;
};

const mockOnResolve = jest.fn<void, [FSClass]>();

/** Reports the class a text input would set on itself, so the tests can read it */
function InputFSClassProbe({forwardedFSClass, ...hints}: ProbeProps) {
    mockOnResolve(useInputFSClass(forwardedFSClass, hints));
    return null;
}

function getProbeFSClass() {
    return mockOnResolve.mock.lastCall?.at(0);
}

describe('useInputFSClass', () => {
    beforeEach(() => {
        mockOnResolve.mockClear();
    });

    it('should unmask an input with no container and no class', () => {
        // Given an input outside any FSClassView, like most inputs in the App
        // When the input renders and works out the class to set on itself
        render(<InputFSClassProbe />);

        // Then it keeps the unmasked default, since the App root is unmasked
        expect(getProbeFSClass()).toBe(CONST.FULLSTORY.CLASS.UNMASK);
    });

    it('should mask an input inside a masked FSClassView', () => {
        // Given an input inside a masked container, like the company card feed credentials
        // When the input renders and works out the class to set on itself
        render(
            <FSClassView forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}>
                <InputFSClassProbe />
            </FSClassView>,
        );

        // Then the input masks itself too, because FullStory lets an input's own fs-unmask override a masked parent
        expect(getProbeFSClass()).toBe(CONST.FULLSTORY.CLASS.MASK);
    });

    it('should follow the closest FSClassView', () => {
        // Given an unmasked container nested inside a masked one
        // When the input renders and works out the class to set on itself
        render(
            <FSClassView forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}>
                <FSClassView forwardedFSClass={CONST.FULLSTORY.CLASS.UNMASK}>
                    <InputFSClassProbe />
                </FSClassView>
            </FSClassView>,
        );

        // Then the input takes the inner class, matching how FullStory resolves nested classes
        expect(getProbeFSClass()).toBe(CONST.FULLSTORY.CLASS.UNMASK);
    });

    it('should keep the outer class when an FSClassView gets no class', () => {
        // Given a component that forwards an optional class it wasn't given, inside a masked container
        // When the input renders and works out the class to set on itself
        render(
            <FSClassView forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}>
                <FSClassView>
                    <InputFSClassProbe />
                </FSClassView>
            </FSClassView>,
        );

        // Then the missing class doesn't reset the input to unmasked
        expect(getProbeFSClass()).toBe(CONST.FULLSTORY.CLASS.MASK);
    });

    it('should let a class passed to the input win over its container', () => {
        // Given an input explicitly unmasked inside a masked container
        // When the input renders and works out the class to set on itself
        render(
            <FSClassView forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}>
                <InputFSClassProbe forwardedFSClass={CONST.FULLSTORY.CLASS.UNMASK} />
            </FSClassView>,
        );

        // Then the explicit class wins, so screens can still opt an input out on purpose
        expect(getProbeFSClass()).toBe(CONST.FULLSTORY.CLASS.UNMASK);
    });

    it('should mask a sensitive input inside an unmasked container', () => {
        // Given a card number input inside an unmasked screen, with no class passed to it
        // When the input renders and works out the class to set on itself
        render(
            <FSClassView forwardedFSClass={CONST.FULLSTORY.CLASS.UNMASK}>
                <InputFSClassProbe autoComplete="cc-number" />
            </FSClassView>,
        );

        // Then its autofill hint masks it, so a new sensitive input is covered even if nobody remembers to mask it
        expect(getProbeFSClass()).toBe(CONST.FULLSTORY.CLASS.MASK);
    });
});

describe('FSClassView', () => {
    it('should set its class on the view it renders', () => {
        // Given a masked FSClassView
        // When it renders
        render(
            <FSClassView
                testID="container"
                forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
            />,
        );

        // Then the rendered view carries fs-mask, so non-input content inside inherits it in recordings
        expect(screen.getByTestId('container')).toHaveProp('fsClass', CONST.FULLSTORY.CLASS.MASK);
    });
});
