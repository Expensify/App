import {act, renderHook} from '@testing-library/react-native';

import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import usePersonalDetailOptions from '@hooks/usePersonalDetailOptions';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const CURRENT_USER_ACCOUNT_ID = 1;
const CURRENT_USER_EMAIL = 'me@example.com';

const PERSONAL_DETAILS: PersonalDetailsList = Object.fromEntries(
    [
        {accountID: CURRENT_USER_ACCOUNT_ID, login: CURRENT_USER_EMAIL, displayName: 'Me'},
        {accountID: 2, login: 'member@example.com', displayName: 'Member'},
        {accountID: 3, login: 'outsider@example.com', displayName: 'Outsider'},
        {accountID: 4, login: 'other@example.com', displayName: 'Other'},
    ].map((personalDetail) => [personalDetail.accountID, personalDetail]),
);

function Wrapper({children}: {children: React.ReactNode}) {
    return (
        <OnyxListItemProvider>
            <LocaleContextProvider>
                <CurrentUserPersonalDetailsProvider>{children}</CurrentUserPersonalDetailsProvider>
            </LocaleContextProvider>
        </OnyxListItemProvider>
    );
}

const renderOptions = async (includeLoginsOnly?: Set<string>) => {
    const {result} = renderHook(() => usePersonalDetailOptions({includeLoginsOnly}), {wrapper: Wrapper});
    await waitForBatchedUpdatesWithAct();
    return result;
};

const loginsOf = (options: ReturnType<typeof usePersonalDetailOptions>['options']) => (options ?? []).map((option) => option.login).toSorted();

describe('usePersonalDetailOptions', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        IntlStore.load(CONST.LOCALES.EN);
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await Onyx.multiSet({
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: PERSONAL_DETAILS,
                [ONYXKEYS.SESSION]: {accountID: CURRENT_USER_ACCOUNT_ID, email: CURRENT_USER_EMAIL},
                [ONYXKEYS.COUNTRY_CODE]: CONST.DEFAULT_COUNTRY_CODE,
            });
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterAll(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('builds an option for every personal detail when no allowlist is given', async () => {
        const result = await renderOptions();

        expect(loginsOf(result.current.options)).toEqual(['me@example.com', 'member@example.com', 'other@example.com', 'outsider@example.com']);
        expect(result.current.currentOption?.login).toBe(CURRENT_USER_EMAIL);
        expect(result.current.isLoading).toBe(false);
    });

    it('builds options only for the allowlisted logins', async () => {
        const result = await renderOptions(new Set(['member@example.com']));

        expect(loginsOf(result.current.options)).toEqual(['member@example.com']);
    });

    it('drops the current user option when the current user is not allowlisted', async () => {
        const result = await renderOptions(new Set(['member@example.com']));

        expect(result.current.currentOption).toBeUndefined();
    });

    it('keeps the current user option when the current user is allowlisted', async () => {
        const result = await renderOptions(new Set(['member@example.com', CURRENT_USER_EMAIL]));

        expect(result.current.currentOption?.login).toBe(CURRENT_USER_EMAIL);
        expect(loginsOf(result.current.options)).toEqual([CURRENT_USER_EMAIL, 'member@example.com']);
    });

    it('returns an empty, loaded list when the allowlist matches nothing', async () => {
        const result = await renderOptions(new Set(['nobody@example.com']));

        expect(result.current.options).toEqual([]);
        expect(result.current.isLoading).toBe(false);
    });
});
