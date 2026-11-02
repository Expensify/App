import toDynamicFormValues from '@components/DynamicForm/utils/toDynamicFormValues';

describe('toDynamicFormValues', () => {
    it('keeps answers a form input can hold and drops everything else', () => {
        // Given a draft with answers next to form bookkeeping and malformed values
        const draft = {
            name: 'Jane',
            accepted: true,
            countries: ['GB', 'US'],
            files: [{name: 'passport.pdf'}],
            directors: [{id: 'jane', firstName: 'Jane'}],
            errors: {name: 'Required'},
            errorList: [{message: 'Required'}],
            mixedList: ['GB', 1],
            count: 3,
        };

        // When it is read as dynamic form answers
        const values = toDynamicFormValues(draft);

        // Then only the answers remain
        expect(values).toEqual({name: 'Jane', accepted: true, countries: ['GB', 'US'], files: [{name: 'passport.pdf'}], directors: [{id: 'jane', firstName: 'Jane'}]});
    });

    it('returns no answers for a missing draft', () => {
        // Given no draft yet, as on a first visit
        // When it is read
        // Then there are no answers, so the form starts empty instead of failing
        expect(toDynamicFormValues(undefined)).toEqual({});
    });
});
