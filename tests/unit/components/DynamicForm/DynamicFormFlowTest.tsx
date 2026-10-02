import {render} from '@testing-library/react-native';

import DynamicFormFlow from '@components/DynamicForm';
import type {DynamicFormSubPageProps} from '@components/DynamicForm/types';

import useSubPage from '@hooks/useSubPage';
import type {SubPageProps} from '@hooks/useSubPage/types';

import Navigation from '@libs/Navigation/Navigation';

import {clearSensitiveAnswers, saveSensitiveAnswers} from '@userActions/DynamicForm';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {DynamicFormField} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../../utils/waitForBatchedUpdatesWithAct';

function hasDynamicFormProps(props: SubPageProps | undefined): props is DynamicFormSubPageProps {
    return !!props && 'onGroupSubmit' in props;
}

const mockCurrentPage = jest.fn<null, [SubPageProps]>(() => null);
const mockPrevPage = jest.fn();
let mockOnBackButtonPress: (() => void) | undefined;

jest.mock('@hooks/useSubPage', () => jest.fn());
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@userActions/DynamicForm', () => ({saveSensitiveAnswers: jest.fn(), clearSensitiveAnswers: jest.fn()}));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn(), goBack: jest.fn()}));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/FullscreenLoadingIndicator', () => jest.fn(() => null));
jest.mock('@components/Header/composed/HeaderWithBackButtonAndTitle', () =>
    jest.fn(({onBackButtonPress}: {onBackButtonPress: () => void}) => {
        mockOnBackButtonPress = onBackButtonPress;
        return null;
    }),
);

const FORM_ID = ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM;

const fields: DynamicFormField[] = [
    {key: 'firstName', type: 'text', required: true, group: 'Personal details'},
    {key: 'ssn', type: 'text', required: true, sensitive: true, group: 'Personal details'},
    {key: 'legalType', type: 'radio', required: true, group: 'Recipient', values: [{key: 'PRIVATE'}, {key: 'BUSINESS'}]},
    {key: 'companyNumber', type: 'text', required: true, group: 'Company', showWhen: {key: 'legalType', equals: ['BUSINESS']}},
];

const buildRoute = (pageName: string, action?: 'edit') => ROUTES.BANK_ACCOUNT_PERSONAL.getRoute(pageName, action);

type RenderFlowOptions = {
    draft?: Record<string, string>;
    sensitiveAnswers?: Record<string, string>;
    pageIndex?: number;
};

async function renderFlow({draft = {}, sensitiveAnswers = {}, pageIndex = 0}: RenderFlowOptions = {}) {
    await Onyx.set(`${FORM_ID}Draft`, draft);
    await Onyx.set(ONYXKEYS.RAM_ONLY_DYNAMIC_FORM_SENSITIVE_ANSWERS, {[FORM_ID]: sensitiveAnswers});
    jest.mocked(useSubPage<DynamicFormSubPageProps>).mockReturnValue({
        CurrentPage: mockCurrentPage,
        isEditing: false,
        currentPageName: 'personal-details',
        pageIndex,
        lastPageIndex: 3,
        nextPage: jest.fn(),
        prevPage: mockPrevPage,
        moveTo: jest.fn(),
        resetToPage: jest.fn(),
        isRedirecting: false,
    });
    const onSubmit = jest.fn();
    const onBack = jest.fn();
    const onGroupSubmit = jest.fn();
    render(
        <DynamicFormFlow
            fields={fields}
            formID={FORM_ID}
            headerTitle="Bank account"
            confirmationTitle="Confirm"
            testID="DynamicFormFlowTest"
            buildRoute={buildRoute}
            onSubmit={onSubmit}
            onBack={onBack}
            onGroupSubmit={onGroupSubmit}
        />,
    );
    await waitForBatchedUpdatesWithAct();
    const subPageOptions = jest.mocked(useSubPage<DynamicFormSubPageProps>).mock.lastCall?.[0];
    if (!subPageOptions) {
        throw new Error('useSubPage was not called');
    }
    const pageProps = mockCurrentPage.mock.lastCall?.[0];
    if (!hasDynamicFormProps(pageProps)) {
        throw new Error('The current page did not get the flow props');
    }
    return {subPageOptions, onSubmit, onBack, onGroupSubmit, pageProps};
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
        // When the flow renders
        const {subPageOptions} = await renderFlow({draft: {legalType: 'PRIVATE'}});

        // Then every group is a page before the confirmation page, and the company page is skipped
        expect(subPageOptions.pages.map((page) => page.pageName)).toEqual(['personal-details', 'recipient', 'company', 'confirm']);
        expect(subPageOptions.skipPages).toEqual(['company']);
    });

    it('starts a new form on its first page and resumes a started one on its first incomplete page', async () => {
        // Given an empty draft, then a form whose first page is answered and whose recipient page is not
        // When the flow renders each
        const newForm = (await renderFlow()).subPageOptions;
        const startedForm = (await renderFlow({draft: {firstName: 'Jane'}, sensitiveAnswers: {ssn: '123456789'}})).subPageOptions;

        // Then the new form starts on page one, and the started form resumes on the recipient page
        expect(newForm.startFrom).toBe(0);
        expect(startedForm.startFrom).toBe(1);
    });

    it('opens the confirmation page when every page is complete', async () => {
        // Given a complete form
        // When the flow renders
        const {subPageOptions} = await renderFlow({draft: {firstName: 'Jane', legalType: 'PRIVATE'}, sensitiveAnswers: {ssn: '123456789'}});

        // Then it opens on the confirmation page
        expect(subPageOptions.startFrom).toBe(3);
    });

    it('keeps sensitive answers out of the draft by saving them in memory', async () => {
        // Given the first page
        const {pageProps, onGroupSubmit} = await renderFlow();
        const group = pageProps.groups.at(0);
        if (!group) {
            throw new Error('No first page');
        }

        // When the user leaves it with Next
        pageProps.onGroupSubmit(group, {firstName: 'Jane', ssn: '123456789'});

        // Then only the SSN goes to memory, and the screen still gets the whole page
        expect(saveSensitiveAnswers).toHaveBeenCalledWith(FORM_ID, {ssn: '123456789'});
        expect(onGroupSubmit).toHaveBeenCalledWith(group, {firstName: 'Jane', ssn: '123456789'});
    });

    it('submits the visible answers, sensitive ones included, from the confirmation page', async () => {
        // Given a complete form with a stale company number left from a business recipient
        const {subPageOptions, onSubmit} = await renderFlow({draft: {firstName: 'Jane', legalType: 'PRIVATE', companyNumber: '123'}, sensitiveAnswers: {ssn: '123456789'}});

        // When the user confirms
        subPageOptions.onFinished();

        // Then the answers include the SSN from memory and leave out the hidden company number
        expect(onSubmit).toHaveBeenCalledWith({firstName: 'Jane', legalType: 'PRIVATE', ssn: '123456789'});
    });

    it('sends the user to the incomplete page instead of submitting', async () => {
        // Given a form whose SSN was lost when the app restarted
        const {subPageOptions, onSubmit} = await renderFlow({draft: {firstName: 'Jane', legalType: 'PRIVATE'}});

        // When the user confirms from the confirmation page
        subPageOptions.onFinished();

        // Then the first page opens and nothing is submitted
        expect(Navigation.navigate).toHaveBeenCalledWith(buildRoute('personal-details'));
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
