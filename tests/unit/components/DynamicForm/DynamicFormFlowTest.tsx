import {render} from '@testing-library/react-native';

import DynamicFormFlow from '@components/DynamicForm';
import type {DynamicFormLayout, DynamicFormSubPageProps} from '@components/DynamicForm/types';
import {getListItems, getListItemSensitiveKey} from '@components/DynamicForm/utils/listItems';
import type {FormValue} from '@components/Form/types';

import useSubPage from '@hooks/useSubPage';
import type {SubPageProps} from '@hooks/useSubPage/types';

import Navigation from '@libs/Navigation/Navigation';

import {clearSensitiveAnswers, forgetSensitiveAnswers, saveDraftAnswers, saveSensitiveAnswers} from '@userActions/DynamicForm';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {DynamicFormField} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../../utils/waitForBatchedUpdatesWithAct';

/** useSubPage types its page as taking SubPageProps alone, so the flow's props are checked for at run time */
function hasDynamicFormProps(props: SubPageProps | undefined): props is DynamicFormSubPageProps {
    return !!props && 'onGroupSubmit' in props;
}

const mockCurrentPage = jest.fn<null, [SubPageProps]>(() => null);
const mockPrevPage = jest.fn();
const mockResetToPage = jest.fn();
const mockMoveTo = jest.fn();
let mockOnBackButtonPress: (() => void) | undefined;
const mockStepWrapper = jest.fn<null, [{stepNames: string[]; startStepIndex: number}]>(() => null);

jest.mock('@hooks/useSubPage', () => jest.fn());
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@userActions/DynamicForm', () => ({
    saveDraftAnswers: jest.fn(),
    saveSensitiveAnswers: jest.fn(),
    clearSensitiveAnswers: jest.fn(),
    forgetSensitiveAnswers: jest.fn(),
}));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn(), goBack: jest.fn()}));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/FullscreenLoadingIndicator', () => jest.fn(() => null));
jest.mock('@components/InteractiveStepWrapper', () => jest.fn((props: {stepNames: string[]; startStepIndex: number}) => mockStepWrapper(props)));
jest.mock('@components/Header/composed/HeaderWithBackButtonAndTitle', () =>
    jest.fn(({onBackButtonPress}: {onBackButtonPress: () => void}) => {
        mockOnBackButtonPress = onBackButtonPress;
        return null;
    }),
);

// Any form key works, and this one's draft takes every answer type, list entries included
const FORM_ID = ONYXKEYS.FORMS.DYNAMIC_FORM_LIST_ITEM_FORM;

const fields: DynamicFormField[] = [
    {key: 'firstName', type: 'text', required: true, group: 'Personal details'},
    {key: 'ssn', type: 'text', required: true, sensitive: true, group: 'Personal details'},
    {key: 'legalType', type: 'radio', required: true, group: 'Recipient', values: [{key: 'PRIVATE'}, {key: 'BUSINESS'}]},
    {key: 'companyNumber', type: 'text', required: true, group: 'Company', showWhen: {key: 'legalType', equals: ['BUSINESS']}},
];

const buildRoute = (pageName: string, action?: 'edit') => ROUTES.BANK_ACCOUNT_PERSONAL.getRoute(pageName, action);

type RenderFlowOptions = {
    flowFields?: DynamicFormField[];
    draft?: Record<string, FormValue>;
    sensitiveAnswers?: Record<string, string>;
    pageIndex?: number;
    currentPageName?: string;
    isRedirecting?: boolean;
    hasConfirmation?: boolean;
    layout?: DynamicFormLayout;
    isSubmitting?: boolean;
};

async function renderFlow({
    flowFields = fields,
    draft = {},
    sensitiveAnswers = {},
    pageIndex = 0,
    currentPageName = 'personal-details',
    isRedirecting = false,
    hasConfirmation,
    layout,
    isSubmitting,
}: RenderFlowOptions = {}) {
    await Onyx.set(`${FORM_ID}Draft`, draft);
    await Onyx.set(ONYXKEYS.RAM_ONLY_DYNAMIC_FORM_SENSITIVE_ANSWERS, {[FORM_ID]: sensitiveAnswers});
    jest.mocked(useSubPage<DynamicFormSubPageProps>).mockReturnValue({
        CurrentPage: mockCurrentPage,
        isEditing: false,
        currentPageName,
        pageIndex,
        lastPageIndex: 3,
        nextPage: jest.fn(),
        prevPage: mockPrevPage,
        moveTo: mockMoveTo,
        resetToPage: mockResetToPage,
        isRedirecting,
    });
    const onSubmit = jest.fn();
    const onBack = jest.fn();
    const onPageSubmit = jest.fn();
    const renderWith = (submitting?: boolean) => (
        <DynamicFormFlow
            fields={flowFields}
            formID={FORM_ID}
            headerTitle="Bank account"
            confirmationTitle="Confirm"
            testID="DynamicFormFlowTest"
            buildRoute={buildRoute}
            onSubmit={onSubmit}
            onBack={onBack}
            onPageSubmit={onPageSubmit}
            hasConfirmation={hasConfirmation}
            layout={layout}
            isSubmitting={submitting}
        />
    );
    const {rerender} = render(renderWith(isSubmitting));
    const setSubmitting = async (submitting?: boolean) => {
        rerender(renderWith(submitting));
        await waitForBatchedUpdatesWithAct();
    };
    await waitForBatchedUpdatesWithAct();
    const subPageOptions = jest.mocked(useSubPage<DynamicFormSubPageProps>).mock.lastCall?.[0];
    if (!subPageOptions) {
        throw new Error('useSubPage was not called');
    }
    const pageProps = mockCurrentPage.mock.lastCall?.[0];
    return {subPageOptions, setSubmitting, onSubmit, onBack, onPageSubmit, pageProps: hasDynamicFormProps(pageProps) ? pageProps : undefined};
}

describe('DynamicFormFlow', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
    });

    it('makes one page per group plus a confirmation page, and skips pages with nothing to ask', async () => {
        // Given a private recipient, so the company page has no visible field
        // When the flow renders with a confirmation page
        const {subPageOptions} = await renderFlow({draft: {legalType: 'PRIVATE'}, hasConfirmation: true});

        // Then every group is a page before the confirmation page, and the company page is skipped
        expect(subPageOptions.pages.map((page) => page.pageName)).toEqual(['personal-details', 'recipient', 'company', 'confirm']);
        expect(subPageOptions.skipPages).toEqual(['company']);
    });

    it('adds a confirmation page by default only to forms with more than five pages', async () => {
        // Given a form of six pages, and the shorter default form
        const sixPages: DynamicFormField[] = ['One', 'Two', 'Three', 'Four', 'Five', 'Six'].map((group) => ({key: group, type: 'text', required: true, group}));

        // When the flow renders each
        const longForm = (await renderFlow({flowFields: sixPages, currentPageName: 'one'})).subPageOptions;
        const shortForm = (await renderFlow()).subPageOptions;

        // Then only the long form ends on a confirmation page, so a short one does not ask the user to read their answers again
        expect(longForm.pages.at(-1)?.pageName).toBe('confirm');
        expect(shortForm.pages.map((page) => page.pageName)).toEqual(['personal-details', 'recipient', 'company']);
    });

    it('submits from the last page, with its answers, when no confirmation page follows', async () => {
        // Given the recipient page, the last one shown while no business recipient is chosen, with the first page answered
        const {pageProps, subPageOptions, onSubmit} = await renderFlow({draft: {firstName: 'Jane'}, sensitiveAnswers: {ssn: '123456789'}, pageIndex: 1, currentPageName: 'recipient'});

        // When the user picks a private recipient, and useSubPage finishes the flow with the page's answers
        subPageOptions.onFinished({legalType: 'PRIVATE'});

        // Then the page is marked last, so it shows Confirm, and the submission holds its answer, which the draft does not have yet
        expect(pageProps?.isLastPage).toBe(true);
        expect(onSubmit).toHaveBeenCalledWith({firstName: 'Jane', legalType: 'PRIVATE', ssn: '123456789'});
    });

    it('resumes a complete form without a confirmation page on its last page', async () => {
        // Given a complete form without sensitive fields or a confirmation page
        const flowFields = fields.filter((field) => field.key !== 'ssn');

        // When the flow renders
        const {subPageOptions} = await renderFlow({flowFields, draft: {firstName: 'Jane', legalType: 'PRIVATE'}});

        // Then it opens on the recipient page, the last one this recipient sees
        expect(subPageOptions.startFrom).toBe(1);
    });

    it('shows a step indicator from three pages on, unless the layout turns it off', async () => {
        // Given a business recipient, so all three pages are shown
        const draft = {legalType: 'BUSINESS'};

        // When the flow renders with the default layout, and then with plain pages
        await renderFlow({draft, pageIndex: 1, currentPageName: 'recipient'});
        const autoLayout = mockStepWrapper.mock.lastCall?.[0];
        mockStepWrapper.mockClear();
        await renderFlow({draft, layout: 'pages'});

        // Then the default layout names every page and highlights the current one, and plain pages have no indicator
        expect(autoLayout).toEqual(expect.objectContaining({stepNames: ['Personal details', 'Recipient', 'Company'], startStepIndex: 1}));
        expect(mockStepWrapper).not.toHaveBeenCalled();
    });

    it('starts a new form on its first page that has something to ask', async () => {
        // Given an empty draft, and a form whose first page only asks a follow-up to a later answer
        const followUpFirst: DynamicFormField[] = [{key: 'companyNumber', type: 'text', required: true, group: 'Company', showWhen: {key: 'legalType', equals: ['BUSINESS']}}, ...fields];

        // When the flow renders each
        const newForm = (await renderFlow()).subPageOptions;
        const skippedFirstPage = (await renderFlow({flowFields: followUpFirst})).subPageOptions;

        // Then the first form starts on page one, and the other skips its empty first page instead of showing it
        expect(newForm.startFrom).toBe(0);
        expect(skippedFirstPage.startFrom).toBe(1);
    });

    it('resumes a started form on the first page its draft leaves incomplete', async () => {
        // Given a form without sensitive fields whose first page is answered and whose recipient page is not
        const flowFields = fields.filter((field) => field.key !== 'ssn');

        // When the flow renders
        const {subPageOptions} = await renderFlow({flowFields, draft: {firstName: 'Jane'}});

        // Then it resumes on the recipient page, so the user does not walk through answered pages again
        expect(subPageOptions.startFrom).toBe(1);
    });

    it('opens the confirmation page when the draft completes every page', async () => {
        // Given a complete form without sensitive fields
        const flowFields = fields.filter((field) => field.key !== 'ssn');

        // When the flow renders with a confirmation page
        const {subPageOptions} = await renderFlow({flowFields, draft: {firstName: 'Jane', legalType: 'PRIVATE'}, hasConfirmation: true});

        // Then it opens on the confirmation page, where the user only has to confirm
        expect(subPageOptions.startFrom).toBe(3);
    });

    it('drops sensitive answers of an earlier visit and asks for them again on a new visit', async () => {
        // Given a draft that completes the form, and an SSN kept in memory from an earlier visit
        // When the flow opens with no page in the URL
        const {subPageOptions} = await renderFlow({draft: {firstName: 'Jane', legalType: 'PRIVATE'}, sensitiveAnswers: {ssn: '123456789'}, isRedirecting: true});

        // Then the old SSN is cleared and the visit starts on the SSN's page, since sensitive answers last one visit only
        expect(clearSensitiveAnswers).toHaveBeenCalledWith(FORM_ID);
        expect(subPageOptions.startFrom).toBe(0);
    });

    it('replaces a URL naming a skipped page with the next shown page', async () => {
        // Given a private recipient, so the company page has nothing to ask, and a confirmation page after it
        // When the URL names the company page
        await renderFlow({draft: {legalType: 'PRIVATE'}, currentPageName: 'company', pageIndex: 2, hasConfirmation: true});

        // Then the confirmation page takes the company page's place in the stack, so Back does not return to the empty page
        expect(Navigation.navigate).toHaveBeenCalledWith(buildRoute('confirm'), {forceReplace: true});
        expect(mockResetToPage).not.toHaveBeenCalled();
    });

    it('replaces a URL naming an unknown page with the page a new visit starts on', async () => {
        // Given a new form
        // When the URL names a page the form does not have, as an old link would
        await renderFlow({currentPageName: 'removed-page', pageIndex: 0});

        // Then the first page takes its place in the stack
        expect(Navigation.navigate).toHaveBeenCalledWith(buildRoute('personal-details'), {forceReplace: true});
    });

    it('drafts the page answers, keeps sensitive ones in memory, and hands the screen the page values', async () => {
        // Given the first page
        const {pageProps, onPageSubmit} = await renderFlow();
        const group = pageProps?.groups.at(0);
        if (!pageProps || !group) {
            throw new Error('No first page');
        }

        // When the user leaves it with Next, with FormProvider's values also holding another page's answer
        pageProps.onGroupSubmit(group, {firstName: 'Jane', ssn: '123456789', legalType: 'PRIVATE'});

        // Then only this page's name is drafted, the SSN goes to memory only, and the screen gets the values the page's form submitted
        expect(saveDraftAnswers).toHaveBeenCalledWith(FORM_ID, {firstName: 'Jane'});
        expect(saveSensitiveAnswers).toHaveBeenCalledWith(FORM_ID, {ssn: '123456789'});
        expect(onPageSubmit).toHaveBeenCalledWith(group, {firstName: 'Jane', ssn: '123456789', legalType: 'PRIVATE'});
    });

    it('submits the visible answers, sensitive ones included, from the confirmation page', async () => {
        // Given a complete form with a stale company number left from a business recipient
        const {subPageOptions, onSubmit} = await renderFlow({draft: {firstName: 'Jane', legalType: 'PRIVATE', companyNumber: '123'}, sensitiveAnswers: {ssn: '123456789'}});

        // When the user confirms
        subPageOptions.onFinished();

        // Then the answers include the SSN from memory and leave out the hidden company number
        expect(onSubmit).toHaveBeenCalledWith({firstName: 'Jane', legalType: 'PRIVATE', ssn: '123456789'});
    });

    it('drops sensitive answers once they are submitted', async () => {
        // Given a complete form with an SSN in memory, once submitted by a screen that reports no progress and once by one that does
        const draft = {firstName: 'Jane', legalType: 'PRIVATE'};
        const sensitiveAnswers = {ssn: '123456789'};
        const untracked = await renderFlow({draft, sensitiveAnswers});

        // When the user confirms on each
        untracked.subPageOptions.onFinished();
        const clearedWithoutTracking = jest.mocked(clearSensitiveAnswers).mock.calls.length;
        jest.mocked(clearSensitiveAnswers).mockClear();
        const tracked = await renderFlow({draft, sensitiveAnswers, isSubmitting: false});
        tracked.subPageOptions.onFinished();
        const clearedBeforeTheRequestEnds = jest.mocked(clearSensitiveAnswers).mock.calls.length;
        await tracked.setSubmitting(true);
        await tracked.setSubmitting(false);

        // Then the first drops the SSN right away, and the second only once its request ends without an error, so a retry still has it
        expect(clearedWithoutTracking).toBe(1);
        expect(clearedBeforeTheRequestEnds).toBe(0);
        expect(clearSensitiveAnswers).toHaveBeenCalledWith(FORM_ID);
    });

    it('shows no page and submits nothing while every field is hidden', async () => {
        // Given a form whose only field is shown for business recipients, and a private recipient
        const flowFields: DynamicFormField[] = [{key: 'companyNumber', type: 'text', required: true, group: 'Company', showWhen: {key: 'legalType', equals: ['BUSINESS']}}];

        // When the flow renders
        const {subPageOptions} = await renderFlow({flowFields, draft: {legalType: 'PRIVATE'}, currentPageName: 'company'});

        // Then no page is drawn and the hidden page is not skipped, since useSubPage needs a page to stay on
        expect(mockCurrentPage).not.toHaveBeenCalled();
        expect(subPageOptions.skipPages).toEqual([]);
    });

    it('sends the user to the incomplete page instead of submitting', async () => {
        // Given a form whose SSN was lost when the app restarted
        const {subPageOptions, onSubmit} = await renderFlow({draft: {firstName: 'Jane', legalType: 'PRIVATE'}});

        // When the user confirms from the confirmation page
        subPageOptions.onFinished();

        // Then the first page opens the way useSubPage changes pages, and nothing is submitted
        expect(mockResetToPage).toHaveBeenCalledWith('personal-details');
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('forgets sensitive answers when the user leaves from the first page', async () => {
        // Given the first page
        const {onBack} = await renderFlow({pageIndex: 0});

        // When the user presses back
        mockOnBackButtonPress?.();

        // Then the sensitive answers are cleared and the screen is left
        expect(clearSensitiveAnswers).toHaveBeenCalledWith(FORM_ID);
        expect(onBack).toHaveBeenCalled();
        expect(mockPrevPage).not.toHaveBeenCalled();
    });

    describe('with a list field', () => {
        const listFields: DynamicFormField[] = [
            {
                key: 'directors',
                type: 'list',
                required: true,
                group: 'Directors',
                itemLabel: 'director',
                itemFields: [
                    {key: 'firstName', type: 'text', required: true},
                    {key: 'ssn', type: 'text', required: false, sensitive: true},
                ],
            },
        ];
        const jane = {id: 'jane', firstName: 'Jane'};

        it('keeps the entry editors out of Next and Back', async () => {
            // Given a list with one entry
            // When the flow renders
            const {subPageOptions} = await renderFlow({flowFields: listFields, draft: {directors: [jane]}, currentPageName: 'directors'});

            // Then the editors of a new and of the existing entry are pages that only Add, Edit or a row can open
            expect(subPageOptions.skipPages).toEqual(expect.arrayContaining(['directors~new', 'directors~jane']));
        });

        it('opens the entry editor page when the user edits an entry', async () => {
            // Given the list page with one entry
            const {pageProps, subPageOptions} = await renderFlow({flowFields: listFields, draft: {directors: [jane]}, currentPageName: 'directors'});

            // When the user edits the entry
            pageProps?.onOpenListItemEditor('directors', 'jane');

            // Then the entry's editor page opens, outside edit mode since the list page was not opened from the confirmation page
            expect(mockMoveTo).toHaveBeenCalledWith(
                subPageOptions.pages.findIndex((page) => page.pageName === 'directors~jane'),
                false,
            );
        });

        it('drafts a new entry, keeps its SSN in memory, and returns to the list page', async () => {
            // Given the editor of a new director
            const {pageProps} = await renderFlow({flowFields: listFields, currentPageName: 'directors~new'});

            // When the user saves it
            pageProps?.onListItemSave('directors', undefined, {firstName: 'John', ssn: '123456789'});

            // Then the entry is added to the draft without its SSN, the SSN is kept in memory under the entry, and the list page opens again
            const draftedItems = getListItems(jest.mocked(saveDraftAnswers).mock.lastCall?.[1].directors);
            expect(draftedItems.map((item) => item.firstName)).toEqual(['John']);
            expect(draftedItems.at(0)?.ssn).toBeUndefined();
            expect(jest.mocked(saveSensitiveAnswers).mock.lastCall).toEqual([
                FORM_ID,
                Object.fromEntries(draftedItems.map((item) => [getListItemSensitiveKey('directors', item.id, 'ssn'), '123456789'])),
            ]);
            expect(Navigation.goBack).toHaveBeenCalledWith(buildRoute('directors'));
        });

        it('forgets the SSN of a removed entry when the user leaves the list page', async () => {
            // Given a director whose SSN is kept in memory, removed from the list on its page
            const {pageProps} = await renderFlow({
                flowFields: listFields,
                draft: {directors: [jane]},
                sensitiveAnswers: {[getListItemSensitiveKey('directors', 'jane', 'ssn')]: '123456789'},
                currentPageName: 'directors',
            });
            const group = pageProps?.groups.at(0);
            if (!pageProps || !group) {
                throw new Error('No list page');
            }

            // When the user leaves the page with Next
            pageProps.onGroupSubmit(group, {directors: []});

            // Then the removed director's SSN is dropped from memory instead of lasting the whole visit
            expect(forgetSensitiveAnswers).toHaveBeenCalledWith(FORM_ID, [getListItemSensitiveKey('directors', 'jane', 'ssn')]);
        });

        it('returns from an entry editor to its list page on back', async () => {
            // Given the editor of an existing entry
            const {onBack} = await renderFlow({flowFields: listFields, draft: {directors: [jane]}, currentPageName: 'directors~jane', pageIndex: 2});

            // When the user presses back
            mockOnBackButtonPress?.();

            // Then the list page opens, rather than the page before the editor or the screen before the flow
            expect(Navigation.goBack).toHaveBeenCalledWith(buildRoute('directors'));
            expect(onBack).not.toHaveBeenCalled();
        });

        it('submits each entry with its sensitive answers', async () => {
            // Given a director whose SSN is kept in memory
            const {subPageOptions, onSubmit} = await renderFlow({
                flowFields: listFields,
                draft: {directors: [jane]},
                sensitiveAnswers: {[getListItemSensitiveKey('directors', 'jane', 'ssn')]: '123456789'},
                currentPageName: 'confirm',
                hasConfirmation: true,
            });

            // When the user confirms
            subPageOptions.onFinished();

            // Then the entry is submitted with its SSN back in place
            expect(onSubmit).toHaveBeenCalledWith({directors: [{id: 'jane', firstName: 'Jane', ssn: '123456789'}]});
        });
    });

    it('goes back one page from a later page', async () => {
        // Given the second page
        await renderFlow({pageIndex: 1});

        // When the user presses back
        mockOnBackButtonPress?.();

        // Then the previous page opens and the sensitive answers are kept
        expect(mockPrevPage).toHaveBeenCalled();
        expect(clearSensitiveAnswers).not.toHaveBeenCalled();
    });
});
