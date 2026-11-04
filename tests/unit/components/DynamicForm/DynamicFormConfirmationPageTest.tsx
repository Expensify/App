import {render} from '@testing-library/react-native';

import DynamicFormConfirmationPage from '@components/DynamicForm/components/DynamicFormConfirmationPage';
import type {DynamicFormSubPageProps} from '@components/DynamicForm/types';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

const mockConfirmationStep = jest.fn<null, [{isLoading?: boolean}]>(() => null);

jest.mock('@components/SubStepForms/ConfirmationStep', () => (props: {isLoading?: boolean}) => mockConfirmationStep(props));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

function renderPage(props: Partial<DynamicFormSubPageProps>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the page reads only a few of the flow's props, and the rest have no bearing on loading
    const pageProps = {
        isEditing: false,
        onNext: jest.fn(),
        onMove: jest.fn(),
        pages: [],
        allFields: [],
        values: {},
        formID: ONYXKEYS.FORMS.DYNAMIC_FORM_LIST_ITEM_FORM,
        confirmationTitle: 'Confirm',
        onOpenListItemEditor: jest.fn(),
        ...props,
    } as unknown as DynamicFormSubPageProps;
    render(<DynamicFormConfirmationPage {...pageProps} />);
    return mockConfirmationStep.mock.lastCall?.[0].isLoading;
}

describe('DynamicFormConfirmationPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows Confirm loading while a page saved on the way is still saving', () => {
        // Given a screen that sends nothing on Confirm, whose last page is still saving
        // When the confirmation page renders
        const isLoading = renderPage({isSubmitting: false, isSavingPages: true});

        // Then Confirm shows that a save is running, so a tap that waits for it does not look ignored
        expect(isLoading).toBe(true);
    });

    it('stops loading once every page has saved', () => {
        // Given a screen that sends nothing on Confirm, whose pages have all saved
        // When the confirmation page renders
        const isLoading = renderPage({isSubmitting: false, isSavingPages: false});

        // Then Confirm is ready to press
        expect(isLoading).toBe(false);
    });

    it('shows Confirm loading while the screen sends the answers', () => {
        // Given a screen that is sending the answers, with no page saving
        // When the confirmation page renders
        const isLoading = renderPage({isSubmitting: true});

        // Then Confirm shows that the answers are on their way
        expect(isLoading).toBe(true);
    });
});
