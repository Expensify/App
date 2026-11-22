import {render} from '@testing-library/react-native';

import FormWrapper from '@components/Form/FormWrapper';

import useInputFSClass from '@hooks/useInputFSClass';

import type {FSClass} from '@libs/Fullstory/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

const mockOnResolve = jest.fn<void, [FSClass]>();

/** Reports the class a text input inside the form would set on itself */
function InputFSClassProbe() {
    mockOnResolve(useInputFSClass(undefined, {}));
    return null;
}

function renderForm(shouldUseScrollView: boolean, forwardedFSClass?: FSClass) {
    render(
        <FormWrapper
            formID={ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM}
            onSubmit={() => {}}
            inputRefs={{current: {}}}
            errors={{}}
            submitButtonText="Save"
            shouldUseScrollView={shouldUseScrollView}
            forwardedFSClass={forwardedFSClass}
        >
            <InputFSClassProbe />
        </FormWrapper>,
    );
    return mockOnResolve.mock.lastCall?.at(0);
}

describe('FormWrapper FullStory class', () => {
    beforeEach(() => {
        mockOnResolve.mockClear();
    });

    it.each([true, false])('should hand a masked class to the inputs inside when shouldUseScrollView is %s', (shouldUseScrollView) => {
        // Given a masked form, with or without its scroll view
        // When an input inside it works out the class to set on itself
        const fsClass = renderForm(shouldUseScrollView, CONST.FULLSTORY.CLASS.MASK);

        // Then it's masked in both layouts, because the class has to reach the inputs whether or not the form scrolls
        expect(fsClass).toBe(CONST.FULLSTORY.CLASS.MASK);
    });

    it('should leave the inputs unmasked when a form without a scroll view gets no class', () => {
        // Given a form without a scroll view and without a class, like the agent rule forms
        // When an input inside it works out the class to set on itself
        const fsClass = renderForm(false);

        // Then it keeps the unmasked default
        expect(fsClass).toBe(CONST.FULLSTORY.CLASS.UNMASK);
    });
});
