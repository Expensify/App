import {act, renderHook} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useRepairExperienceCookie from '@hooks/useRepairExperienceCookie';
import useSwitchToClassic from '@hooks/useSwitchToClassic';

import {switchToOldDot} from '@userActions/ExitSurvey';
import {openOldDotLink} from '@userActions/Link';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/ExperienceCookie', () => ({
    isSharedProductHost: jest.fn(() => true),
    readExperienceCookie: jest.fn(() => 'new'),
    writeExperienceCookie: jest.fn(() => true),
    clearExperienceCookie: jest.fn(() => true),
}));
jest.mock('@userActions/Link', () => ({openOldDotLink: jest.fn()}));
jest.mock('@userActions/ExitSurvey', () => ({...jest.requireActual<Record<string, unknown>>('@userActions/ExitSurvey'), switchToOldDot: jest.fn(() => 'request')}));
jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));

function Wrapper({children}: {children: React.ReactNode}) {
    return <OnyxListItemProvider>{children}</OnyxListItemProvider>;
}

// Opening Classic on expensify.com is remembered for the whole page, so this file holds a single test
describe('useOpenClassic', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    it('opens Classic once on expensify.com when the cookie repair and a switch finish together', async () => {
        // Given an account in the beta with a `new` cookie, where the user switched to Classic while the app was still loading
        await Onyx.multiSet({
            [ONYXKEYS.BETAS]: [CONST.BETAS.HYBRID_WEB],
            [ONYXKEYS.BETA_CONFIGURATION]: {explicitOnly: []},
            [ONYXKEYS.SESSION]: {accountID: 1, email: 'user@expensify.com', authToken: 'token'},
        });
        await Onyx.merge(ONYXKEYS.NVP_TRY_NEW_DOT, {classicRedirect: {dismissed: false}});
        const {result} = renderHook(
            () => {
                useRepairExperienceCookie();
                return useSwitchToClassic();
            },
            {wrapper: Wrapper},
        );
        await waitForBatchedUpdatesWithAct();
        act(() => result.current.switchToClassic('Too many clicks'));
        expect(switchToOldDot).toHaveBeenCalledTimes(1);

        // When the start's response and the saved switch are applied in one update, so both hooks want to open Classic
        await act(async () => {
            await Onyx.update([
                {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.NVP_TRY_NEW_DOT, value: {classicRedirect: {dismissed: true}}},
                {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM, value: {switchToOldDotResults: {request: CONST.EXIT_SURVEY.SWITCH_RESULT.SAVED}}},
                {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.RAM_ONLY_HAS_FRESH_APP_DATA, value: true},
            ]);
        });
        await waitForBatchedUpdatesWithAct();

        // Then Classic opens only once, because the page is already on its way there
        expect(openOldDotLink).toHaveBeenCalledTimes(1);
        expect(openOldDotLink).toHaveBeenCalledWith(CONST.OLDDOT_URLS.INBOX, true);
    });
});
