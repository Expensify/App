import getConfirmationItems from '@components/DynamicForm/utils/getConfirmationItems';
import {getAllFields} from '@components/DynamicForm/utils/paginate';
import type {SummaryGroupRow} from '@components/SubStepForms/ConfirmationStep';

import type {DynamicFormPage} from '@src/types/onyx';

import {translateLocal} from '../../../utils/TestHelper';

const pages: DynamicFormPage[] = [
    {
        key: 'identity',
        title: 'Identity',
        content: [
            {key: 'name', type: 'text', required: true, label: 'Name'},
            {key: 'ssn', type: 'text', required: true, label: 'SSN', sensitive: true},
            {key: 'country', type: 'text', required: false, label: 'Country', readonly: true},
        ],
    },
    {key: 'business', title: 'Business', showWhen: {key: 'type', equals: ['BUSINESS']}, content: [{key: 'ein', type: 'text', required: true, label: 'EIN'}]},
];

// A row may be a list heading, which has no onPress
function pressRow(row: SummaryGroupRow | undefined) {
    if (!row || !('onPress' in row)) {
        return;
    }
    row.onPress();
}

describe('getConfirmationItems', () => {
    it('masks sensitive answers and opens the page of an editable row', () => {
        // Given answers with an SSN
        const onEditPage = jest.fn();
        const [group] = getConfirmationItems(pages, getAllFields(pages), {name: 'Ada', ssn: '123451234', country: 'US'}, translateLocal, onEditPage, jest.fn());

        // When the user taps the SSN row
        const ssnRow = group.rows.find((row) => row.id === 'ssn');
        pressRow(ssnRow);

        // Then the SSN is masked to its last four digits and the page is opened
        expect(ssnRow?.title).toBe('•••-••-1234');
        expect(onEditPage).toHaveBeenCalledWith(0);
    });

    it('shows a readonly row with no chevron and no action', () => {
        // Given a readonly field
        const onEditPage = jest.fn();
        const [group] = getConfirmationItems(pages, getAllFields(pages), {name: 'Ada', ssn: '123451234', country: 'US'}, translateLocal, onEditPage, jest.fn());

        // When its row is tapped
        const row = group.rows.find((candidate) => candidate.id === 'country');
        pressRow(row);

        // Then it is not editable
        expect(row).toMatchObject({shouldShowRightIcon: false});
        expect(onEditPage).not.toHaveBeenCalled();
    });

    it('has no group for a page that is not shown', () => {
        // Given a private recipient, so the business page is skipped
        const values = {type: 'PRIVATE', name: 'Ada', ein: '1'};

        // When the confirmation page lists the answers
        const groups = getConfirmationItems(pages, getAllFields(pages), values, translateLocal, jest.fn(), jest.fn());

        // Then only the identity page is summarized
        expect(groups.map((group) => group.id)).toEqual(['identity']);
    });

    it('leaves the section of an untitled page with several questions unnamed', () => {
        // Given a page the form built from a flat list, so it has no title, asking an account number and a currency
        const untitledPages: DynamicFormPage[] = [
            {
                key: 'page-1',
                content: [
                    {key: 'accountNumber', type: 'text', required: true, label: 'Account number'},
                    {key: 'currency', type: 'currency', required: true, label: 'Settlement currency'},
                ],
            },
        ];

        // When the confirmation sections are built
        const [group] = getConfirmationItems(untitledPages, getAllFields(untitledPages), {accountNumber: '12345678', currency: 'GBP'}, translateLocal, jest.fn(), jest.fn());

        // Then the section has no name, since naming it after its first answer would mislabel the others
        expect(group.name).toBe('');
        expect(group.rows.map((row) => row.id)).toEqual(['accountNumber', 'currency']);
    });

    it('shows each list entry as its own row that opens the entry', () => {
        // Given a page with a list of directors holding one entry
        const directorsPages: DynamicFormPage[] = [
            {
                key: 'directors',
                content: [
                    {
                        key: 'directors',
                        type: 'list',
                        required: true,
                        itemFields: [
                            {key: 'firstName', type: 'text', required: true},
                            {key: 'lastName', type: 'text', required: true},
                        ],
                    },
                ],
            },
        ];
        const values = {directors: [{id: 'jane', firstName: 'Jane', lastName: 'Doe'}]};
        const onEditListItem = jest.fn();

        // When the confirmation sections are built and the entry row is tapped
        const row = getConfirmationItems(directorsPages, getAllFields(directorsPages), values, translateLocal, jest.fn(), onEditListItem)
            .at(0)
            ?.rows.find((candidate) => 'kind' in candidate && candidate.kind === 'avatar');
        pressRow(row);

        // Then the entry is an avatar row named by its leading text answers, and tapping it opens that entry rather than the page
        expect(row).toMatchObject({kind: 'avatar', title: 'Jane Doe'});
        expect(onEditListItem).toHaveBeenCalledWith('directors', 'jane');
    });

    it('shows an empty list as a row that opens its page', () => {
        // Given a page with an optional list of directors that holds no entry
        const directorsPages: DynamicFormPage[] = [
            {
                key: 'directors',
                content: [{key: 'directors', label: 'Directors', type: 'list', required: false, itemFields: [{key: 'firstName', type: 'text', required: true}]}],
            },
        ];
        const onEditPage = jest.fn();
        const onEditListItem = jest.fn();

        // When the confirmation sections are built and the list row is tapped
        const row = getConfirmationItems(directorsPages, getAllFields(directorsPages), {directors: []}, translateLocal, onEditPage, onEditListItem).at(0)?.rows.at(0);
        pressRow(row);

        // Then the list still has a row, so the user can go back and add a director from the confirmation page
        expect(row).toMatchObject({description: 'Directors', title: ''});
        expect(onEditPage).toHaveBeenCalledWith(0);
        expect(onEditListItem).not.toHaveBeenCalled();
    });

    it('names a sensitive answer by its visible ending for screen readers', () => {
        // Given answers with an SSN, which shows as bullets and its last four digits
        // When the confirmation sections are built
        const [group] = getConfirmationItems(pages, getAllFields(pages), {name: 'Ada', ssn: '123451234', country: 'US'}, translateLocal, jest.fn(), jest.fn());

        // Then screen readers hear the field and the digits the user can see instead of every bullet, while plain answers keep their usual reading
        expect(group.rows.find((row) => row.id === 'ssn')).toMatchObject({accessibilityLabel: translateLocal('dynamicForm.maskedValueLabel', {label: 'SSN', ending: '1234'})});
        expect(group.rows.find((row) => row.id === 'name')).toMatchObject({accessibilityLabel: undefined});
    });

    it('names a list above its entry rows when other answers share its section', () => {
        // Given a page titled Business holding the company name and a labelled list of owners with one entry
        const businessPages: DynamicFormPage[] = [
            {
                key: 'business',
                title: 'Business',
                content: [
                    {key: 'companyName', label: 'Company name', type: 'text', required: true},
                    {key: 'owners', label: 'Owners', type: 'list', required: true, itemFields: [{key: 'firstName', type: 'text', required: true}]},
                ],
            },
        ];

        // When the confirmation sections are built
        const [group] = getConfirmationItems(
            businessPages,
            getAllFields(businessPages),
            {companyName: 'Acme', owners: [{id: 'jane', firstName: 'Jane'}]},
            translateLocal,
            jest.fn(),
            jest.fn(),
        );

        // Then a heading with the list's label comes before the entry, so the names are not read as more business answers
        expect(group.rows.map((row) => ('kind' in row ? [row.kind, row.title] : [row.id]))).toEqual([['companyName'], ['label', 'Owners'], ['avatar', 'Jane']]);
    });

    it('leaves out the list heading when the list is alone in a named section', () => {
        // Given a page titled Ownership holding only the Owners list
        const ownersPages: DynamicFormPage[] = [
            {
                key: 'ownership',
                title: 'Ownership',
                content: [{key: 'owners', label: 'Owners', type: 'list', required: true, itemFields: [{key: 'firstName', type: 'text', required: true}]}],
            },
        ];

        // When the confirmation sections are built
        const [group] = getConfirmationItems(ownersPages, getAllFields(ownersPages), {owners: [{id: 'jane', firstName: 'Jane'}]}, translateLocal, jest.fn(), jest.fn());

        // Then only the entry is listed, since the section heading already says what the entries are, whatever its wording
        expect(group.rows).toHaveLength(1);
    });

    it('names a list alone in a section without a heading', () => {
        // Given an untitled page asking only for owners, with no question to name it
        const ownersPages: DynamicFormPage[] = [
            {
                key: 'owners',
                content: [{key: 'owners', label: 'Owners', type: 'list', required: true, itemFields: [{key: 'firstName', type: 'text', required: true}]}],
            },
        ];

        // When the confirmation sections are built
        const [group] = getConfirmationItems(ownersPages, getAllFields(ownersPages), {owners: [{id: 'jane', firstName: 'Jane'}]}, translateLocal, jest.fn(), jest.fn());

        // Then the list heading is the only name the entries get, so it is shown
        expect(group.name).toBe('');
        expect(group.rows.at(0)).toMatchObject({kind: 'label', title: 'Owners'});
    });

    describe('a link that opts out of a question', () => {
        const ssnPages: DynamicFormPage[] = [
            {
                key: 'representative',
                title: 'Representative',
                content: [
                    {key: 'ssn', type: 'text', required: true, label: 'SSN', showWhen: {key: 'hasNoSSN', equals: ['false']}},
                    {key: 'hasNoSSN', type: 'boolean', presentation: 'link', required: false, label: "I don't have an SSN"},
                ],
            },
        ];

        it('has no row while it is off', () => {
            // Given an admin who typed an SSN and left the no-SSN link off
            const values = {ssn: '123451234', hasNoSSN: false};

            // When the confirmation sections are built
            const [group] = getConfirmationItems(ssnPages, getAllFields(ssnPages), values, translateLocal, jest.fn(), jest.fn());

            // Then only the SSN is listed, since a "No" under the link would answer nothing the SSN does not
            expect(group.rows.map((row) => row.id)).toEqual(['ssn']);
        });

        it('stands in for the question it hides while it is on', () => {
            // Given an admin who turned the no-SSN link on, which hides the SSN
            const values = {ssn: '', hasNoSSN: true};

            // When the confirmation sections are built
            const [group] = getConfirmationItems(ssnPages, getAllFields(ssnPages), values, translateLocal, jest.fn(), jest.fn());

            // Then the SSN row says there is no SSN, so the opt-out never shows as a separate yes or no question
            expect(group.rows).toEqual([expect.objectContaining({id: 'hasNoSSN', description: 'SSN', title: "I don't have an SSN"})]);
        });

        describe('when the question it hides is on a page the form skips', () => {
            const skippedPages: DynamicFormPage[] = [
                {key: 'residence', title: 'Residence', content: [{key: 'country', type: 'text', required: true, label: 'Country'}]},
                {key: 'consent', title: 'Consent', content: [{key: 'hasNoSSN', type: 'boolean', presentation: 'link', required: false, label: "I don't have an SSN"}]},
                {
                    key: 'usIdentity',
                    title: 'US identity',
                    showWhen: {key: 'country', equals: ['US']},
                    content: [{key: 'ssn', type: 'text', required: true, label: 'SSN', showWhen: {key: 'hasNoSSN', equals: ['false']}}],
                },
            ];

            it('keeps its no row while it is off', () => {
                // Given an admin outside the US, so the SSN page is skipped whatever the link says, who left the link off
                const values = {country: 'GB', hasNoSSN: false};

                // When the confirmation sections are built
                const groups = getConfirmationItems(skippedPages, getAllFields(skippedPages), values, translateLocal, jest.fn(), jest.fn());

                // Then the "No" stays, since the skipped SSN page carries no answer in its place
                const consentGroup = groups.find((group) => group.id === 'consent');
                expect(consentGroup?.rows).toEqual([expect.objectContaining({id: 'hasNoSSN', description: "I don't have an SSN", title: translateLocal('common.no')})]);
            });

            it('keeps its own label while it is on', () => {
                // Given an admin outside the US, so the SSN page is skipped whatever the link says, who turned the link on
                const values = {country: 'GB', hasNoSSN: true};

                // When the confirmation sections are built
                const groups = getConfirmationItems(skippedPages, getAllFields(skippedPages), values, translateLocal, jest.fn(), jest.fn());

                // Then the row is not labeled as the SSN, since the form never asks this admin for one
                const consentGroup = groups.find((group) => group.id === 'consent');
                expect(consentGroup?.rows).toEqual([expect.objectContaining({id: 'hasNoSSN', description: "I don't have an SSN", title: translateLocal('common.yes')})]);
            });
        });

        describe('when it opts out of nothing', () => {
            const linkPages: DynamicFormPage[] = [
                {key: 'consent', title: 'Consent', content: [{key: 'skipNewsletter', type: 'boolean', presentation: 'link', required: false, label: 'Skip the newsletter'}]},
            ];

            it('keeps its yes row while it is on', () => {
                // Given a link that is on with no other field depending on it
                // When the confirmation sections are built
                const [group] = getConfirmationItems(linkPages, getAllFields(linkPages), {skipNewsletter: true}, translateLocal, jest.fn(), jest.fn());

                // Then the link keeps its own label, since there is no question for it to stand in for
                expect(group.rows).toEqual([expect.objectContaining({id: 'skipNewsletter', description: 'Skip the newsletter', title: translateLocal('common.yes')})]);
            });

            it('keeps its no row while it is off', () => {
                // Given a link that is off with no other field depending on it
                // When the confirmation sections are built
                const [group] = getConfirmationItems(linkPages, getAllFields(linkPages), {skipNewsletter: false}, translateLocal, jest.fn(), jest.fn());

                // Then the "No" stays, since no other row carries that answer
                expect(group.rows).toEqual([expect.objectContaining({id: 'skipNewsletter', description: 'Skip the newsletter', title: translateLocal('common.no')})]);
            });
        });
    });
});
