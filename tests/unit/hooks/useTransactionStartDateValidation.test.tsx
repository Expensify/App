import {act, renderHook} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';

import useTransactionStartDateValidation from '@hooks/useTransactionStartDateValidation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import {translateLocal} from '../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const CUSTOM = CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM;
const FROM_BEGINNING = CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.FROM_BEGINNING;
const A_DATE = '2026-09-15';

function Wrapper({children}: {children: React.ReactNode}) {
    return <LocaleContextProvider>{children}</LocaleContextProvider>;
}

type Params = Parameters<typeof useTransactionStartDateValidation>[0];

function setup(initialProps: Params) {
    return renderHook((props: Params) => useTransactionStartDateValidation(props), {wrapper: Wrapper, initialProps});
}

describe('useTransactionStartDateValidation', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.DEFAULT);
        return waitForBatchedUpdatesWithAct();
    });

    it('says nothing before the page has been submitted', () => {
        // Given a custom date the user has cleared but not tried to save yet
        const {result} = setup({dateOption: CUSTOM, startDate: ''});

        // When the field is drawn
        // Then no error is shown, since the user is still filling the date in
        expect(result.current.requiredError).toBe('');
    });

    it('reports the missing date once saving is attempted', () => {
        // Given a custom date that was cleared
        const {result} = setup({dateOption: CUSTOM, startDate: ''});

        // When the page is submitted
        let canSubmit = true;
        act(() => {
            canSubmit = result.current.validateOnSubmit();
        });

        // Then saving is refused and the field says what is missing
        expect(canSubmit).toBe(false);
        expect(result.current.requiredError).toBe(translateLocal('common.error.fieldRequired'));
    });

    it('takes the error back down once an option is picked again', () => {
        // Given a page that was submitted without a date
        const {result} = setup({dateOption: CUSTOM, startDate: ''});
        act(() => {
            result.current.validateOnSubmit();
        });
        expect(result.current.requiredError).not.toBe('');

        // When the user answers the question again
        act(() => {
            result.current.forgetSubmitAttempt();
        });

        // Then the error goes, rather than sitting there while they decide
        expect(result.current.requiredError).toBe('');
    });

    it('needs no date for the option that does not ask for one', () => {
        // Given the option to take everything from the beginning, which carries no date of its own
        const {result} = setup({dateOption: FROM_BEGINNING, startDate: ''});

        // When the page is submitted
        let canSubmit = false;
        act(() => {
            canSubmit = result.current.validateOnSubmit();
        });

        // Then it saves, since there is nothing to be missing
        expect(canSubmit).toBe(true);
        expect(result.current.requiredError).toBe('');
    });

    it('refuses to save an entry the field could not read', () => {
        // Given a date field reporting digits that do not add up to a date, so it handed nothing over
        const {result} = setup({dateOption: CUSTOM, startDate: A_DATE});
        act(() => {
            result.current.onValidationErrorChange('That is not a date this field can use');
        });

        // When the page is submitted
        let canSubmit = true;
        act(() => {
            canSubmit = result.current.validateOnSubmit();
        });

        // Then saving is refused, since it would keep the date from before the edit and discard what was typed
        expect(canSubmit).toBe(false);
        // And no required error is raised, because a date is there and the field is already saying what is wrong with it
        expect(result.current.requiredError).toBe('');
    });

    it('saves once the field stops reporting', () => {
        // Given a field that was reporting an unreadable entry and then had it corrected
        const {result} = setup({dateOption: CUSTOM, startDate: A_DATE});
        act(() => {
            result.current.onValidationErrorChange('That is not a date this field can use');
        });
        act(() => {
            result.current.onValidationErrorChange('');
        });

        // When the page is submitted
        let canSubmit = false;
        act(() => {
            canSubmit = result.current.validateOnSubmit();
        });

        // Then it saves
        expect(canSubmit).toBe(true);
    });

    it('ignores an error left behind by a date the page is no longer asking for', () => {
        // Given a field that reported an unreadable entry before the user switched option
        const {result, rerender} = setup({dateOption: CUSTOM, startDate: ''});
        act(() => {
            result.current.onValidationErrorChange('That is not a date this field can use');
        });

        // When the option that needs no date is picked
        rerender({dateOption: FROM_BEGINNING, startDate: ''});
        let canSubmit = false;
        act(() => {
            canSubmit = result.current.validateOnSubmit();
        });

        // Then saving goes ahead, since the date that error was about is not being asked for any more
        expect(canSubmit).toBe(true);
    });
});
