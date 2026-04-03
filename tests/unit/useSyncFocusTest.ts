import {renderHook} from '@testing-library/react-native';
import type {RefObject} from 'react';
import type {View} from 'react-native';
import useSyncFocus from '@hooks/useSyncFocus/useSyncFocusImplementation';

describe('useSyncFocus', () => {
    function attachFocusSpy<T extends HTMLElement>(element: T) {
        const originalFocus = element.focus.bind(element);
        const focusSpy = jest.fn((options?: FocusOptions) => originalFocus(options));
        Object.defineProperty(element, 'focus', {
            value: focusSpy,
            configurable: true,
        });
        return focusSpy;
    }

    function createOption(label: string, listbox?: HTMLElement) {
        const option = document.createElement('div');
        option.setAttribute('role', 'option');
        option.setAttribute('aria-label', label);
        option.tabIndex = -1;
        (listbox ?? document.body).appendChild(option);
        return option;
    }

    function createListbox() {
        const listbox = document.createElement('div');
        listbox.setAttribute('role', 'listbox');
        document.body.appendChild(listbox);
        return listbox;
    }

    afterEach(() => {
        document.body.innerHTML = '';
        jest.restoreAllMocks();
    });

    it('useSyncFocus should only focus if shouldSyncFocus is true', () => {
        const refMock = {current: {focus: jest.fn()}};

        // When useSyncFocus is rendered initially while shouldSyncFocus is false.
        const {rerender} = renderHook(
            ({
                ref = refMock,
                isFocused = true,
                shouldSyncFocus = false,
            }: {
                isFocused?: boolean;
                shouldSyncFocus?: boolean;
                ref?: {
                    current: {
                        focus: jest.Mock;
                    };
                };
            }) => useSyncFocus(ref as unknown as RefObject<View>, isFocused, shouldSyncFocus),
            {initialProps: {}},
        );
        // Then the ref focus will not be called.
        expect(refMock.current.focus).not.toHaveBeenCalled();

        rerender({isFocused: false});
        expect(refMock.current.focus).not.toHaveBeenCalled();

        // When shouldSyncFocus and isFocused are true
        rerender({isFocused: true, shouldSyncFocus: true});

        // Then the ref focus will be called.
        expect(refMock.current.focus).toHaveBeenCalled();
        expect(refMock.current.focus).toHaveBeenCalledWith({preventScroll: true});
    });

    it("doesn't steal focus from another already-focused element", () => {
        const refMock = {current: {focus: jest.fn()}};
        const activeButton = document.createElement('button');
        document.body.appendChild(activeButton);
        activeButton.focus();

        renderHook(() => useSyncFocus(refMock as unknown as RefObject<View>, true, true));

        expect(document.activeElement).toBe(activeButton);
        expect(refMock.current.focus).not.toHaveBeenCalled();
    });

    it('allows focus transfer between option rows in the same listbox', () => {
        const listbox = createListbox();
        const activeOption = createOption('Advertising', listbox);
        const nextOption = createOption('Benefits', listbox);
        const focusSpy = attachFocusSpy(nextOption);

        activeOption.focus();

        renderHook(() => useSyncFocus({current: nextOption} as unknown as RefObject<View>, true, true));

        expect(focusSpy).toHaveBeenCalledWith({preventScroll: true});
        expect(document.activeElement).toBe(nextOption);
    });

    it("doesn't steal focus from the search input", () => {
        const listbox = createListbox();
        const nextOption = createOption('Benefits', listbox);
        const focusSpy = attachFocusSpy(nextOption);
        const searchInput = document.createElement('input');
        document.body.appendChild(searchInput);
        searchInput.focus();

        renderHook(() => useSyncFocus({current: nextOption} as unknown as RefObject<View>, true, true));

        expect(document.activeElement).toBe(searchInput);
        expect(focusSpy).not.toHaveBeenCalled();
    });

    it("doesn't transfer focus between options in different listboxes", () => {
        const activeListbox = createListbox();
        const targetListbox = createListbox();
        const activeOption = createOption('Advertising', activeListbox);
        const nextOption = createOption('Benefits', targetListbox);
        const focusSpy = attachFocusSpy(nextOption);

        activeOption.focus();

        renderHook(() => useSyncFocus({current: nextOption} as unknown as RefObject<View>, true, true));

        expect(document.activeElement).toBe(activeOption);
        expect(focusSpy).not.toHaveBeenCalled();
    });
});
