import {getVisibleContent} from '@components/DynamicForm/utils/getVisibleFields';

import type {DynamicFormField, DynamicFormHeading} from '@src/types/onyx';

const email: DynamicFormField = {key: 'email', type: 'text', required: true};

describe('getVisibleContent', () => {
    it('keeps a heading when the heading after it is hidden by its own condition', () => {
        // Given a heading, then a heading shown only for business recipients, then a field
        const details: DynamicFormHeading = {key: 'details', title: 'Details'};
        const business: DynamicFormHeading = {key: 'business', title: 'Business', showWhen: {key: 'legalType', equals: ['BUSINESS']}};

        // When the content is checked for a private recipient
        const visibleContent = getVisibleContent([details, business, email], {legalType: 'PRIVATE'});

        // Then the first heading titles the field, since a hidden heading is skipped and does not end the block above it
        expect(visibleContent).toEqual([details, email]);
    });

    it('drops the first of two shown headings in a row', () => {
        // Given two headings with no field between them
        const details: DynamicFormHeading = {key: 'details', title: 'Details'};
        const contact: DynamicFormHeading = {key: 'contact', title: 'Contact'};

        // When the content is checked
        const visibleContent = getVisibleContent([details, contact, email], {});

        // Then only the heading right above the field is kept, since the first one titles nothing
        expect(visibleContent).toEqual([contact, email]);
    });

    it('drops a heading with no text', () => {
        // Given a heading with neither a title nor a description, which would draw an empty gap
        const empty: DynamicFormHeading = {key: 'empty'};

        // When the content is checked
        const visibleContent = getVisibleContent([empty, email], {});

        // Then only the field is left
        expect(visibleContent).toEqual([email]);
    });

    it('hides a field whose controlling field on another page is hidden', () => {
        // Given a page with a field controlled by companyName, which sits on another page and is shown only for business recipients
        const companyName: DynamicFormField = {key: 'companyName', type: 'text', required: true, showWhen: {key: 'legalType', equals: ['BUSINESS']}};
        const companyNumber: DynamicFormField = {key: 'companyNumber', type: 'text', required: true, showWhen: {key: 'companyName', equals: ['Acme']}};

        // When the page is checked with the whole form, and companyName keeps an answer from before the user switched to a private recipient
        const visibleContent = getVisibleContent([companyNumber], {legalType: 'PRIVATE', companyName: 'Acme'}, [companyName, companyNumber]);

        // Then companyNumber stays hidden, because the question it depends on is hidden
        expect(visibleContent).toEqual([]);
    });
});
