/** Verifies password-manager hints on real React Native Web HTML inputs, not wrapper props. */
// cspell:ignore lpignore
import {fireEvent, screen} from '@testing-library/dom';

import ComposeProviders from '@components/ComposeProviders';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import SelectionListTextInput from '@components/SelectionList/components/TextInput';
import TextInput from '@components/TextInput';
import type {BaseTextInputProps} from '@components/TextInput/BaseTextInput/types';

import ONYXKEYS from '@src/ONYXKEYS';

import React, {act} from 'react';
import {createRoot} from 'react-dom/client';

/* eslint-disable testing-library/no-unnecessary-act -- These tests render a React DOM root and dispatch DOM events directly. */
jest.mock('react-native', () => jest.requireActual<Record<string, unknown>>('react-native-web'));
// The global Reanimated mock exposes a native ref. Use the real web primitive so dataSet conversion is exercised in the DOM.
jest.mock('@components/RNTextInput', () => ({
    __esModule: true,
    default: jest.requireActual<typeof TextInput>('react-native-web/dist/cjs/exports/TextInput'),
}));
jest.mock('@components/Form/FormWrapper', () => ({__esModule: true, default: ({children}: {children: React.ReactNode}) => children}));
jest.mock('@hooks/useIsFocusedRef', () => () => ({current: true}));
jest.mock('@react-navigation/native', () => ({...jest.requireActual<Record<string, unknown>>('@react-navigation/native'), useFocusEffect: jest.fn()}));
jest.mock('@components/TextInput', () => jest.requireActual<Record<string, unknown>>('../../src/components/TextInput/index.tsx'));
jest.mock('@components/TextInput/BaseTextInput/implementation', () => jest.requireActual<Record<string, unknown>>('../../src/components/TextInput/BaseTextInput/implementation/index.tsx'));

describe('web TextInput password-manager hints', () => {
    let container: HTMLDivElement;
    let root: ReturnType<typeof createRoot>;

    function renderInput(props: BaseTextInputProps = {}) {
        act(() =>
            root.render(
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                    <TextInput
                        accessibilityLabel="Email"
                        {...props}
                    />
                </ComposeProviders>,
            ),
        );
        return screen.getByRole<HTMLInputElement>('textbox', {name: 'Email'});
    }

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => root.unmount());
        container.remove();
    });

    it.each<BaseTextInputProps>([{inputMode: 'email'}, {keyboardType: 'email-address'}, {shouldIgnorePasswordManager: true}])('puts ignore attributes on the HTML input for %j', (props) => {
        // Given an email input or an explicitly opted-in recipient search
        // When the shared web input reaches React Native Web
        const input = renderInput({...props, dataSet: {customHint: 'preserved'}});

        // Then both managers receive their hints on the input, without losing caller metadata
        expect(input.tagName).toBe('INPUT');
        expect(input.getAttribute('data-1p-ignore')).toBe('true');
        expect(input.getAttribute('data-lpignore')).toBe('true');
        expect(input.getAttribute('data-custom-hint')).toBe('preserved');
        expect(input.hasAttribute('shouldIgnorePasswordManager')).toBe(false);
    });

    it.each<BaseTextInputProps>([
        {autoComplete: 'email'},
        {autoCompleteType: 'email'},
        {textContentType: 'emailAddress'},
        {autoComplete: 'username'},
        {autoCompleteType: 'username'},
        {textContentType: 'username'},
    ])('preserves requested autofill despite email input semantics for %j', (props) => {
        // Given an email input that would otherwise suppress password managers
        const input = renderInput({inputMode: 'email', keyboardType: 'email-address'});
        expect(input.getAttribute('data-1p-ignore')).toBe('true');
        expect(input.getAttribute('data-lpignore')).toBe('true');

        // When a caller requests saved email or username details without an explicit suppression override
        renderInput({inputMode: 'email', keyboardType: 'email-address', ...props, dataSet: {customHint: 'preserved'}});

        // Then generated hints are removed so managers can fill the field, without losing unrelated metadata
        expect(input.hasAttribute('data-1p-ignore')).toBe(false);
        expect(input.hasAttribute('data-lpignore')).toBe(false);
        expect(input.getAttribute('data-custom-hint')).toBe('preserved');
        expect(input.type).toBe('email');
    });

    it.each<BaseTextInputProps>([{autoComplete: 'email'}, {autoCompleteType: 'username'}])('allows explicit suppression to override autofill hints for %j', (props) => {
        // Given a caller that deliberately suppresses suggestions despite its autofill hints
        // When the shared input renders with that explicit override
        const input = renderInput({...props, shouldIgnorePasswordManager: true});

        // Then the caller's explicit choice takes precedence over the automatic exemption
        expect(input.getAttribute('data-1p-ignore')).toBe('true');
        expect(input.getAttribute('data-lpignore')).toBe('true');
    });

    it('preserves login autofill when explicitly exempted', () => {
        // Given the login username field, which also uses email input mode
        // When login opts out of suppression
        const input = renderInput({inputMode: 'email', autoCompleteType: 'username', textContentType: 'username', name: 'username', shouldIgnorePasswordManager: false});

        // Then managers can still autofill it and its original input semantics remain intact
        expect(input.hasAttribute('data-1p-ignore')).toBe(false);
        expect(input.hasAttribute('data-lpignore')).toBe(false);
        expect(input.getAttribute('autocomplete')).toBe('username');
        expect(input.getAttribute('name')).toBe('username');
        expect(input.type).toBe('email');
    });

    it('does not suppress ordinary text fields and removes generated hints on rerender', () => {
        // Given an email field with generated ignore attributes
        const input = renderInput({inputMode: 'email'});
        expect(input.getAttribute('data-1p-ignore')).toBe('true');

        // When the same field becomes ordinary text
        renderInput({inputMode: 'text'});

        // Then no generated hints remain on that input
        expect(input.hasAttribute('data-1p-ignore')).toBe(false);
        expect(input.hasAttribute('data-lpignore')).toBe(false);
    });

    it('removes generated hints when suppression is explicitly disabled', () => {
        // Given an email field that would suppress managers by default
        const input = renderInput({inputMode: 'email'});
        expect(input.getAttribute('data-1p-ignore')).toBe('true');

        // When a caller disables suppression without remounting
        renderInput({inputMode: 'email', shouldIgnorePasswordManager: false});

        // Then React removes the attributes instead of leaving imperative mutations behind
        expect(input.hasAttribute('data-1p-ignore')).toBe(false);
        expect(input.hasAttribute('data-lpignore')).toBe(false);
    });

    it('preserves email change handlers and browser validation', () => {
        // Given an uncontrolled email field with its original change handler
        const onChangeText = jest.fn();
        const input = renderInput({inputMode: 'email', onChangeText, uncontrolled: true});

        // When invalid and valid email values are entered
        act(() => fireEvent.input(input, {target: {value: 'invalid'}}));
        expect(input.validity.typeMismatch).toBe(true);
        act(() => fireEvent.input(input, {target: {value: 'person@example.com'}}));

        // Then suppression has not changed validation or swallowed input events
        expect(input.validity.typeMismatch).toBe(false);
        expect(onChangeText).toHaveBeenLastCalledWith('person@example.com');
    });

    it('preserves requested email autofill through real form registration and input wrappers', () => {
        // Given an email input requesting saved details, as in onboarding and reimbursement flows
        // When FormProvider and InputWrapper forward its options
        act(() =>
            root.render(
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                    <FormProvider
                        formID={ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM}
                        onSubmit={() => {}}
                        submitButtonText="Save"
                    >
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID="email"
                            accessibilityLabel="Email"
                            inputMode="email"
                            autoComplete="email"
                            dataSet={{customHint: 'preserved'}}
                        />
                    </FormProvider>
                </ComposeProviders>,
            ),
        );

        // Then form forwarding preserves the autofill exemption and unrelated metadata
        const input = screen.getByRole('textbox', {name: 'Email'});
        expect(input.hasAttribute('data-1p-ignore')).toBe(false);
        expect(input.hasAttribute('data-lpignore')).toBe(false);
        expect(input.getAttribute('autocomplete')).toBe('email');
        expect(input.getAttribute('data-custom-hint')).toBe('preserved');
    });

    it.each([
        {options: undefined, shouldSuppress: true},
        {options: {label: 'Recipient'}, shouldSuppress: true},
        {options: {label: 'Recipient', shouldIgnorePasswordManager: true}, shouldSuppress: true},
        {options: {label: 'Recipient', shouldIgnorePasswordManager: false}, shouldSuppress: false},
    ])('defaults selection searches to suppression while respecting explicit overrides: %j', ({options, shouldSuppress}) => {
        // Given a selection search without credential-specific input semantics
        // When its options are omitted, use the default, or explicitly override suppression
        act(() =>
            root.render(
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                    <SelectionListTextInput
                        accessibilityLabel="Recipient"
                        options={options}
                        shouldShowTextInput
                        onFocusChange={() => {}}
                        focusTextInput={() => {}}
                    />
                </ComposeProviders>,
            ),
        );

        // Then suppression defaults to enabled but explicit false is preserved without changing the input type
        const input = screen.getByRole<HTMLInputElement>('textbox', {name: 'Recipient'});
        expect(input.getAttribute('data-1p-ignore')).toBe(shouldSuppress ? 'true' : null);
        expect(input.getAttribute('data-lpignore')).toBe(shouldSuppress ? 'true' : null);
        expect(input.type).toBe('text');
    });
});
