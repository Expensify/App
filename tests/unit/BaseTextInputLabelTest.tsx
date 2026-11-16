import {render} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import BaseTextInputImplementation from '@components/TextInput/BaseTextInput/implementation';
import {ACTIVE_LABEL_SCALE, ACTIVE_LABEL_TRANSLATE_Y, INACTIVE_LABEL_SCALE, INACTIVE_LABEL_TRANSLATE_Y} from '@components/TextInput/styleConst';

import type {Ref} from 'react';
import type {TextInputProps} from 'react-native';

import React from 'react';
import * as Reanimated from 'react-native-reanimated';

let mockInput: HTMLInputElement;

jest.mock('react-native-reanimated', () => {
    const reanimated = jest.requireActual<typeof Reanimated>('react-native-reanimated/mock');
    return {...reanimated, withTiming: jest.fn(reanimated.withTiming)};
});

// The web implementation subscribes to DOM focus events; native test-renderer refs do not expose them.
jest.mock('@components/RNTextInput', () => {
    const ReactMock = jest.requireActual<typeof React>('react');
    function MockInput({ref, ...props}: TextInputProps & {ref?: Ref<HTMLInputElement>}) {
        ReactMock.useImperativeHandle(ref, () => mockInput, []);
        return ReactMock.createElement('TextInput', props);
    }
    return {__esModule: true, default: MockInput};
});

const WebBaseTextInputImplementation = jest.requireActual<{default: typeof BaseTextInputImplementation}>('../../src/components/TextInput/BaseTextInput/implementation/index.tsx').default;

const labelConditions = [
    {name: 'prefix', props: {prefixCharacter: '$'}},
    {name: 'suffix', props: {suffixCharacter: 'USD'}},
    {name: 'forced active label', props: {forceActiveLabel: true}},
];

describe.each([
    {platform: 'web', Input: WebBaseTextInputImplementation},
    {platform: 'native', Input: BaseTextInputImplementation},
])('BaseTextInput label ($platform)', ({Input}) => {
    const animate = jest.mocked(Reanimated.withTiming);

    const renderInput = (props = {}) => (
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <Input
                label="Amount"
                value=""
                {...props}
            />
        </ComposeProviders>
    );

    beforeEach(() => {
        mockInput = document.createElement('input');
        // JSDOM treats the autofill pseudo-class as a match even for an untouched input.
        jest.spyOn(mockInput, 'matches').mockReturnValue(false);
        document.body.appendChild(mockInput);
        animate.mockClear();
    });

    afterEach(() => {
        mockInput.remove();
    });

    it.each(labelConditions)('floats an empty, unfocused label when adding $name and lowers it on removal', ({props}) => {
        // Given an empty, unfocused input whose label is inline
        const {rerender} = render(renderInput());
        animate.mockClear();

        // When an adornment or forced-active setting is added without remounting
        rerender(renderInput(props));

        // Then the label must float instead of overlapping the new adornment
        expect(animate).toHaveBeenCalledWith(ACTIVE_LABEL_TRANSLATE_Y, expect.any(Object));
        expect(animate).toHaveBeenCalledWith(ACTIVE_LABEL_SCALE, expect.any(Object));
        animate.mockClear();

        // When the adornment or forced-active setting is removed again
        rerender(renderInput());

        // Then the empty, unfocused input can show its inline label again
        expect(animate).toHaveBeenCalledWith(INACTIVE_LABEL_TRANSLATE_Y, expect.any(Object));
        expect(animate).toHaveBeenCalledWith(INACTIVE_LABEL_SCALE, expect.any(Object));
    });

    it('floats the label after specific currency to Any currency to another currency', () => {
        // Given an empty input that starts with a currency prefix
        const {rerender} = render(renderInput({prefixCharacter: '$'}));

        // When Any currency removes the prefix, then a different currency restores it
        rerender(renderInput({prefixCharacter: ''}));
        animate.mockClear();
        rerender(renderInput({prefixCharacter: 'AED'}));

        // Then both label transforms move to the floated state
        expect(animate).toHaveBeenCalledWith(ACTIVE_LABEL_TRANSLATE_Y, expect.any(Object));
        expect(animate).toHaveBeenCalledWith(ACTIVE_LABEL_SCALE, expect.any(Object));
    });

    it('keeps the label floated when removing an adornment from a populated input', () => {
        // Given a populated input whose prefix already keeps the label floated
        const {rerender} = render(renderInput({prefixCharacter: '$', value: '10'}));
        animate.mockClear();

        // When the currency prefix is removed but the amount remains
        rerender(renderInput({prefixCharacter: '', value: '10'}));

        // Then the label must not return inline over the amount
        expect(animate).not.toHaveBeenCalledWith(INACTIVE_LABEL_TRANSLATE_Y, expect.any(Object));
        expect(animate).not.toHaveBeenCalledWith(INACTIVE_LABEL_SCALE, expect.any(Object));
    });
});
