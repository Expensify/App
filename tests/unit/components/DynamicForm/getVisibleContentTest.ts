import getContentFields from '@components/DynamicForm/utils/getContentFields';
import {getVisibleContent} from '@components/DynamicForm/utils/getVisibleFields';

import type {DynamicFormField, DynamicFormHeading, DynamicFormLink} from '@src/types/onyx';

const email: DynamicFormField = {key: 'email', type: 'text', required: true};

const dataProtection: DynamicFormLink = {
    key: 'dataProtection',
    url: 'https://help.expensify.com/articles/new-expensify/settings/Encryption-and-Data-Security',
    textKey: 'addPersonalBankAccount.howDoWeProtectYourData',
};

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

    it('keeps a link that comes after the last field', () => {
        // Given a link placed after the page's fields, where a heading would be dropped for titling nothing
        const content = [email, dataProtection];

        // When the content is checked
        const visibleContent = getVisibleContent(content, {});

        // Then the link stays, since it points somewhere rather than titling the fields after it
        expect(visibleContent).toEqual([email, dataProtection]);
    });

    it('drops a link that would open a page outside Expensify or has no text', () => {
        // Given links the App should not show: one to another site, one over plain http, one with no wording
        const otherSite: DynamicFormLink = {...dataProtection, key: 'otherSite', url: 'https://example.com/expensify.com'};
        const lookalike: DynamicFormLink = {...dataProtection, key: 'lookalike', url: 'https://help.expensify.com.example.com/'};
        const insecure: DynamicFormLink = {...dataProtection, key: 'insecure', url: 'http://help.expensify.com/'};
        const withoutText: DynamicFormLink = {key: 'withoutText', url: dataProtection.url};

        // When the content is checked
        const visibleContent = getVisibleContent([email, otherSite, lookalike, insecure, withoutText], {});

        // Then only the field is left, since the schema comes from the server and a link opens outside the form
        expect(visibleContent).toEqual([email]);
    });

    it('hides a link while its condition is not met', () => {
        // Given a link shown only for business recipients
        const businessLink: DynamicFormLink = {...dataProtection, showWhen: {key: 'legalType', equals: ['BUSINESS']}};

        // When the content is checked for a private recipient
        const visibleContent = getVisibleContent([email, businessLink], {legalType: 'PRIVATE'});

        // Then the link is hidden, as a heading or field with the same condition would be
        expect(visibleContent).toEqual([email]);
    });

    it('does not count a link as a field', () => {
        // Given a page with a field and a link
        const content = [email, dataProtection];

        // When the page's fields are collected for validation, answers and the confirmation page
        const fields = getContentFields(content);

        // Then the link is left out, since it has no answer to check or submit
        expect(fields).toEqual([email]);
    });

    it('keeps a link under the heading it follows, and keeps it when that heading is dropped', () => {
        // Given a heading with a link under it, before the heading's field, and a second block whose field is hidden
        const bankDetails: DynamicFormHeading = {key: 'bankDetails', title: 'Bank details'};
        const business: DynamicFormHeading = {key: 'business', title: 'Business'};
        const businessLink: DynamicFormLink = {...dataProtection, key: 'businessLink'};
        const companyName: DynamicFormField = {key: 'companyName', type: 'text', required: true, showWhen: {key: 'legalType', equals: ['BUSINESS']}};

        // When the content is checked for a private recipient
        const visibleContent = getVisibleContent([bankDetails, dataProtection, email, business, businessLink, companyName], {legalType: 'PRIVATE'});

        // Then the first link stays between its heading and the field, and the second link still shows once its heading titles nothing
        expect(visibleContent).toEqual([bankDetails, dataProtection, email, businessLink]);
    });
});
