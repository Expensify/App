import {render} from '@testing-library/react-native';

import DynamicFormFieldsPage from '@components/DynamicForm/components/DynamicFormFieldsPage';
import FormProvider from '@components/Form/FormProvider';

import ONYXKEYS from '@src/ONYXKEYS';
import type {DynamicFormPage} from '@src/types/onyx';

import React from 'react';

jest.mock('@components/Form/FormProvider', () => jest.fn(() => null));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));

const page: DynamicFormPage = {key: 'identity', title: 'Identity', content: [{key: 'ssn', type: 'text', required: true, sensitive: true}]};

function renderPage(isLastPage: boolean) {
    render(
        <DynamicFormFieldsPage
            isEditing={false}
            isLastPage={isLastPage}
            currentPageName={page.key}
            onNext={jest.fn()}
            onMove={jest.fn()}
            formID={ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM}
            pages={[page]}
            allFields={[]}
            values={{}}
            onPageSubmit={jest.fn()}
            onOpenListItemEditor={jest.fn()}
            onListItemsChange={jest.fn()}
            onListItemSave={jest.fn()}
            confirmationTitle="Confirm"
        />,
    );
    return jest.mocked(FormProvider).mock.lastCall?.[0];
}

describe('DynamicFormFieldsPage', () => {
    it('lets the user move on to the next page while offline', () => {
        // Given a page that a later page or a confirmation page follows
        // When it renders
        const formProps = renderPage(false);

        // Then its button works offline, since moving between pages sends nothing
        expect(formProps?.enabledWhenOffline).toBe(true);
    });

    it('submits the last page only while online', () => {
        // Given the last page of a flow without a confirmation page, so its button submits the form
        // When it renders
        const formProps = renderPage(true);

        // Then its button is disabled offline, since an offline request is saved to disk with the sensitive answers it carries
        expect(formProps?.enabledWhenOffline).toBe(false);
    });
});
