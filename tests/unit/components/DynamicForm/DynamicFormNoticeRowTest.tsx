import {render, screen} from '@testing-library/react-native';

import DynamicFormFields from '@components/DynamicForm/components/DynamicFormFields';
import {LocaleContextProvider} from '@components/LocaleContextProvider';

import ONYXKEYS from '@src/ONYXKEYS';
import type {DynamicFormContentItem} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

describe('DynamicFormNoticeRow', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    it('shows a notice with our translation, or the server wording when it has none', async () => {
        // Given a notice with a translation and a notice with only the server wording
        const content: DynamicFormContentItem[] = [
            {key: 'alipayLimits', presentation: 'notice', textKey: 'addPersonalBankAccount.notices.alipayLimits', text: 'Server wording'},
            {key: 'closing', presentation: 'notice', text: 'Payments arrive in two days.'},
        ];

        // When the page's content renders
        render(
            <LocaleContextProvider>
                <DynamicFormFields
                    content={content}
                    values={{}}
                />
            </LocaleContextProvider>,
        );

        // Then the App's translation is shown over the server's wording, and a notice with no translation shows the server's
        expect(await screen.findByText(/50,000 CNY/)).toBeOnTheScreen();
        expect(screen.queryByText('Server wording')).toBeNull();
        expect(screen.getByText('Payments arrive in two days.')).toBeOnTheScreen();
    });
});
