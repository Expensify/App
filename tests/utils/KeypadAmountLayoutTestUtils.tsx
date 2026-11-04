import {render, renderHook} from '@testing-library/react-native';

import Button from '@components/Button';
import ComposeProviders from '@components/ComposeProviders';
import KeypadAmountEditor from '@components/KeypadAmountEditor';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

/** Test identifier given to the KeypadAmountEditor root, which the layout suffixes for each of its parts */
const ROOT_TEST_ID = 'layout';
const BODY_TEST_ID = `${ROOT_TEST_ID}-body`;
const MAIN_TEST_ID = `${ROOT_TEST_ID}-main`;
const AMOUNT_TEST_ID = `${ROOT_TEST_ID}-amount`;
const PAD_TEST_ID = `${ROOT_TEST_ID}-pad`;
const FOOTER_TEST_ID = `${ROOT_TEST_ID}-footer`;
const INPUT_TEST_ID = 'numeric-text-input';
const FLIP_TEST_ID = 'flip-button';

function Providers({children}: {children: React.ReactNode}) {
    return <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>{children}</ComposeProviders>;
}

/** Styles the layout parts render with, read through the same hook. Call it before rendering the layout, since it updates `screen`. */
function getLayoutStyles() {
    return renderHook(() => useThemeStyles()).result.current;
}

/** Renders the KeypadAmountEditor layout with the providers its parts read from, kept around the tree on rerender */
function renderWithProviders(children: React.ReactElement) {
    return render(children, {wrapper: Providers});
}

/** Renders a standard single-column KeypadAmountEditor with a footer button and basic text input */
function renderLayout() {
    return renderWithProviders(
        <KeypadAmountEditor
            value="12.5"
            testID={ROOT_TEST_ID}
            footer={<Button onPress={jest.fn()}>Save</Button>}
        >
            <KeypadAmountEditor.Input />
        </KeypadAmountEditor>,
    );
}

export {AMOUNT_TEST_ID, BODY_TEST_ID, FLIP_TEST_ID, FOOTER_TEST_ID, INPUT_TEST_ID, MAIN_TEST_ID, PAD_TEST_ID, ROOT_TEST_ID, getLayoutStyles, renderLayout, renderWithProviders};
