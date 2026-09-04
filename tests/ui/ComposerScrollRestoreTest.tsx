import {act, fireEvent, render, screen} from '@testing-library/react-native';

import Composer from '@components/Composer';
import type WebComposer from '@components/Composer/implementation';

import ONYXKEYS from '@src/ONYXKEYS';

import type * as ReactNavigation from '@react-navigation/native';
import type {TextInputProps} from 'react-native';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';
import createWebComposerTextarea from '../utils/webComposerTextarea';

/**
 * Both scroll effects in the web Composer chain are guarded against re-running with unchanged inputs, because an
 * Activity reveal repeats them and would move the offset the user chose. This suite pins the other half of each guard:
 * a real change to the full size prop, or to the value with the caret at the end, still moves the scroll.
 */

const COMPOSER_TEST_ID = 'composer';

const mockComposerTextarea = createWebComposerTextarea();

// Jest resolves the native platform file, so the web Composer has to be required by its exact path.
jest.mock('@components/Composer', () => ({
    __esModule: true,
    default: jest.requireActual<{default: typeof WebComposer}>('../../src/components/Composer/implementation/index.tsx').default,
}));

// The shipped mock hands back a React Native TextInput instance. The web Composer needs a DOM node behind its ref.
jest.mock('@expensify/react-native-live-markdown', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const {TextInput} = jest.requireActual<{TextInput: React.ComponentType<TextInputProps>}>('react-native');

    function MarkdownTextInput({ref, ...props}: TextInputProps & {ref?: React.Ref<unknown>}) {
        ReactModule.useImperativeHandle(ref, () => mockComposerTextarea.element);
        return ReactModule.createElement(TextInput, props);
    }

    return {MarkdownTextInput, parseExpensiMark: () => [], getWorkletRuntime: () => ({})};
});

jest.mock('@components/OnyxListItemProvider', () => ({useSession: () => ({accountID: 1, encryptedAuthToken: 'token'})}));

jest.mock('@react-navigation/native', () => {
    const actualNavigation = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    return {...actualNavigation, useIsFocused: () => true};
});

/** Lets the Composer's debounced scroll listener record the current scroll offset. */
async function recordComposerScroll() {
    mockComposerTextarea.element.dispatchEvent(new Event('scroll'));
    await act(async () => {
        await new Promise((resolve) => {
            setTimeout(resolve, 150);
        });
    });
}

describe('the web Composer scroll effects', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        mockComposerTextarea.reset();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('restores the scroll offset when the composer switches to full size', async () => {
        Object.assign(mockComposerTextarea.metrics, {scrollHeight: 300, clientHeight: 100});
        const {rerender} = render(
            <Composer
                testID={COMPOSER_TEST_ID}
                value="where is my expense"
                selection={{start: 0, end: 0}}
                isComposerFullSize={false}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        fireEvent(screen.getByTestId(COMPOSER_TEST_ID), 'contentSizeChange', {nativeEvent: {contentSize: {height: 300, width: 100}}});
        mockComposerTextarea.metrics.scrollTop = 40;
        await recordComposerScroll();

        rerender(
            <Composer
                testID={COMPOSER_TEST_ID}
                value="where is my expense"
                selection={{start: 0, end: 0}}
                isComposerFullSize
            />,
        );
        await waitForBatchedUpdatesWithAct();

        expect(mockComposerTextarea.metrics.scrollTop).toBe(240);
    });

    it('scrolls to the end when the value grows with the caret at the end', async () => {
        Object.assign(mockComposerTextarea.metrics, {scrollHeight: 300, clientHeight: 100});
        const {rerender} = render(
            <Composer
                testID={COMPOSER_TEST_ID}
                value="where is my"
                selection={{start: 11, end: 11}}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        mockComposerTextarea.metrics.scrollTop = 0;

        rerender(
            <Composer
                testID={COMPOSER_TEST_ID}
                value="where is my expense"
                selection={{start: 19, end: 19}}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        expect(mockComposerTextarea.metrics.scrollTop).toBe(300);
    });
});
