import {render, screen} from '@testing-library/react-native';

import DynamicFormFields from '@components/DynamicForm/components/DynamicFormFields';

import type {DynamicFormLink} from '@src/types/onyx';

import React from 'react';

jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

const HELP_URL = 'https://help.expensify.com/articles/new-expensify/settings/Encryption-and-Data-Security';

describe('DynamicFormLinkRow', () => {
    it('shows a link from the schema with its translated text and address', () => {
        // Given a page whose schema has a link to the data security article
        const dataProtection: DynamicFormLink = {key: 'dataProtection', url: HELP_URL, textKey: 'addPersonalBankAccount.howDoWeProtectYourData', text: 'Server wording'};

        // When the page's content renders
        render(
            <DynamicFormFields
                content={[dataProtection]}
                values={{}}
            />,
        );

        // Then the App's translation is shown over the server's wording, and the link opens the article
        const link = screen.getByText('addPersonalBankAccount.howDoWeProtectYourData');
        expect(link.props.href).toBe(HELP_URL);
        expect(screen.queryByText('Server wording')).toBeNull();
    });

    it("shows the server's wording when the link has no translation", () => {
        // Given a link with only the schema author's wording
        const learnMore: DynamicFormLink = {key: 'learnMore', url: HELP_URL, text: 'Learn more'};

        // When the page's content renders
        render(
            <DynamicFormFields
                content={[learnMore]}
                values={{}}
            />,
        );

        // Then that wording is the link
        expect(screen.getByText('Learn more').props.href).toBe(HELP_URL);
    });
});
