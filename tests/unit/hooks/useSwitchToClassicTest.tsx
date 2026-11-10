import {act, renderHook} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useOpenClassic from '@hooks/useOpenClassic';
import useSwitchToClassic from '@hooks/useSwitchToClassic';

import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {writeExperienceCookie} from '@libs/ExperienceCookie';
import Growl from '@libs/Growl';

import {switchToOldDot} from '@userActions/ExitSurvey';
import {openOldDotLink} from '@userActions/Link';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Beta, Session} from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/ExperienceCookie', () => ({writeExperienceCookie: jest.fn(() => true), clearExperienceCookie: jest.fn(() => true)}));
jest.mock('@userActions/Link', () => ({openOldDotLink: jest.fn()}));
jest.mock('@userActions/ExitSurvey', () => ({switchToOldDot: jest.fn()}));
jest.mock('@libs/Growl', () => ({__esModule: true, default: {error: jest.fn()}}));
jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));

function Wrapper({children}: {children: React.ReactNode}) {
    return <OnyxListItemProvider>{children}</OnyxListItemProvider>;
}

async function renderSwitchToClassic() {
    const rendered = renderHook(() => useSwitchToClassic(), {wrapper: Wrapper});
    await waitForBatchedUpdatesWithAct();
    return rendered;
}

/** Stands in for the queued SwitchToOldDot request: optimistic data, then the success or failure data */
async function setSwitchRequestState(value: {isLoading: boolean; errors?: Errors | null}) {
    await act(async () => {
        await Onyx.merge(ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM, value);
    });
    await waitForBatchedUpdatesWithAct();
}

async function requestSwitchAndRespond(result: ReturnType<typeof useSwitchToClassic>, response: {isLoading: boolean; errors?: Errors | null}) {
    act(() => result.switchToClassic('Too many clicks'));
    await setSwitchRequestState({isLoading: true, errors: null});
    await setSwitchRequestState(response);
}

async function arrangeAccount(betas: Beta[], session?: Partial<Session>) {
    await Onyx.set(ONYXKEYS.BETAS, betas);
    await Onyx.set(ONYXKEYS.SESSION, {accountID: 1, email: 'user@expensify.com', authToken: 'token', ...session});
    await waitForBatchedUpdatesWithAct();
}

describe('useSwitchToClassic', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        jest.clearAllMocks();
    });

    it('marks the cookie and opens Classic only after the server saves the switch', async () => {
        // Given an account in the beta that uses the experience cookie
        await arrangeAccount([CONST.BETAS.HYBRID_WEB]);
        const {result} = await renderSwitchToClassic();

        // When the user switches and the request is still in flight
        act(() => result.current.switchToClassic('Too many clicks'));
        await setSwitchRequestState({isLoading: true, errors: null});

        // Then the switch is recorded, the buttons are disabled, and Classic doesn't open yet, because Classic would send the user back to New Expensify
        expect(switchToOldDot).toHaveBeenCalledWith('Too many clicks');
        expect(result.current.isSwitchingToClassic).toBe(true);
        expect(writeExperienceCookie).not.toHaveBeenCalled();
        expect(openOldDotLink).not.toHaveBeenCalled();

        // When the server saves the switch
        await setSwitchRequestState({isLoading: false});

        // Then the cookie is marked before Classic opens in the same tab
        expect(writeExperienceCookie).toHaveBeenCalledWith(CONST.EXPERIENCE_COOKIE.VALUES.CLASSIC);
        expect(openOldDotLink).toHaveBeenCalledTimes(1);
        expect(openOldDotLink).toHaveBeenCalledWith(CONST.OLDDOT_URLS.INBOX, true);
        expect(jest.mocked(writeExperienceCookie).mock.invocationCallOrder.at(0)).toBeLessThan(jest.mocked(openOldDotLink).mock.invocationCallOrder.at(0) ?? 0);
    });

    it('shows an error and stays in New Expensify when the server rejects the switch', async () => {
        // Given an account in the beta that uses the experience cookie
        await arrangeAccount([CONST.BETAS.HYBRID_WEB]);
        const {result} = await renderSwitchToClassic();

        // When the server rejects the switch
        await requestSwitchAndRespond(result.current, {isLoading: false, errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')});

        // Then the user sees an error, can retry, and nothing changes
        expect(Growl.error).toHaveBeenCalledWith({bodyText: 'common.genericErrorMessage'});
        expect(result.current.isSwitchingToClassic).toBe(false);
        expect(writeExperienceCookie).not.toHaveBeenCalled();
        expect(openOldDotLink).not.toHaveBeenCalled();
    });

    it('ignores a switch started elsewhere after a rejected one', async () => {
        // Given a switch from this screen that the server rejected
        await arrangeAccount([CONST.BETAS.HYBRID_WEB]);
        const {result} = await renderSwitchToClassic();
        await requestSwitchAndRespond(result.current, {isLoading: false, errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')});

        // When a switch started in another tab succeeds
        await setSwitchRequestState({isLoading: true, errors: null});
        await setSwitchRequestState({isLoading: false});

        // Then this screen doesn't navigate, because the user didn't ask it to again
        expect(openOldDotLink).not.toHaveBeenCalled();
    });

    it('ignores a switch started elsewhere after a saved one', async () => {
        // Given a switch from this screen that the server saved
        await arrangeAccount([CONST.BETAS.HYBRID_WEB]);
        const {result} = await renderSwitchToClassic();
        await requestSwitchAndRespond(result.current, {isLoading: false});

        // When a switch started in another tab finishes
        await setSwitchRequestState({isLoading: true, errors: null});
        await setSwitchRequestState({isLoading: false});

        // Then Classic isn't opened a second time, because only the switch started here belongs to this screen
        expect(openOldDotLink).toHaveBeenCalledTimes(1);
    });

    it('keeps waiting for the switch when the exit survey form is reset in another tab', async () => {
        // Given a switch from this screen that is waiting for the server
        await arrangeAccount([CONST.BETAS.HYBRID_WEB]);
        const {result} = await renderSwitchToClassic();
        act(() => result.current.switchToClassic('Too many clicks'));
        await setSwitchRequestState({isLoading: true, errors: null});

        // When another tab opens the exit survey, which resets the shared form
        await act(async () => {
            await Onyx.set(ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM, null);
        });
        await waitForBatchedUpdatesWithAct();

        // Then Classic doesn't open early, because the switch isn't saved yet
        expect(result.current.isSwitchingToClassic).toBe(true);
        expect(openOldDotLink).not.toHaveBeenCalled();

        // When the server saves the switch
        await setSwitchRequestState({isLoading: false});

        // Then Classic opens
        expect(openOldDotLink).toHaveBeenCalledWith(CONST.OLDDOT_URLS.INBOX, true);
    });

    it('waits for the new request when the form still holds an earlier saved switch', async () => {
        // Given a form that still holds a switch saved earlier, as after a Troubleshoot switch without the exit survey
        await arrangeAccount([CONST.BETAS.HYBRID_WEB]);
        await Onyx.merge(ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM, {isLoading: false});
        const {result} = await renderSwitchToClassic();

        // When the user switches again, before the new request's optimistic data arrives
        act(() => result.current.switchToClassic(''));
        await waitForBatchedUpdatesWithAct();

        // Then Classic doesn't open on the earlier result
        expect(result.current.isSwitchingToClassic).toBe(true);
        expect(openOldDotLink).not.toHaveBeenCalled();
    });

    it('opens Classic without marking the cookie for an account outside the beta', async () => {
        // Given an account with every beta except the one that uses the experience cookie, which the server only enables explicitly
        await Onyx.set(ONYXKEYS.BETA_CONFIGURATION, {explicitOnly: [CONST.BETAS.HYBRID_WEB]});
        await arrangeAccount([CONST.BETAS.ALL]);
        const {result} = await renderSwitchToClassic();

        // When the server saves the switch
        await requestSwitchAndRespond(result.current, {isLoading: false});

        // Then Classic opens but the cookie, which is only used for accounts in the beta, is left alone
        expect(openOldDotLink).toHaveBeenCalledWith(CONST.OLDDOT_URLS.INBOX, true);
        expect(writeExperienceCookie).not.toHaveBeenCalled();
    });

    it.each<[string, Partial<Session>]>([
        ['Supportal', {authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT}],
        ['Supportal with a used support token', {isSupportAuthTokenUsed: true}],
        ['Copilot', {authTokenType: CONST.AUTH_TOKEN_TYPES.DELEGATE}],
    ])('does not overwrite the agent cookie in a %s session', async (_, session) => {
        // Given an agent acting on an account in the beta that uses the experience cookie
        await arrangeAccount([CONST.BETAS.HYBRID_WEB], session);
        const {result} = await renderSwitchToClassic();

        // When the server saves the switch
        await requestSwitchAndRespond(result.current, {isLoading: false});

        // Then Classic opens, but the agent's own cookie in this browser isn't changed
        expect(openOldDotLink).toHaveBeenCalledWith(CONST.OLDDOT_URLS.INBOX, true);
        expect(writeExperienceCookie).not.toHaveBeenCalled();
    });

    it('ignores a request that was left loading or started elsewhere', async () => {
        // Given a switch request stored as loading before this screen mounted, for example from another tab
        await arrangeAccount([CONST.BETAS.HYBRID_WEB]);
        await Onyx.merge(ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM, {isLoading: true});
        const {result} = await renderSwitchToClassic();

        // Then the buttons stay enabled
        expect(result.current.isSwitchingToClassic).toBe(false);

        // When that request finishes
        await setSwitchRequestState({isLoading: false});

        // Then this screen doesn't navigate, because the user didn't ask it to
        expect(openOldDotLink).not.toHaveBeenCalled();
    });

    it('opens Classic right away without recording a switch', async () => {
        // Given an account in the beta that uses the experience cookie that the server already keeps in Classic
        await arrangeAccount([CONST.BETAS.HYBRID_WEB]);
        const {result} = renderHook(() => useOpenClassic(), {wrapper: Wrapper});
        await waitForBatchedUpdatesWithAct();

        // When the user takes the shortcut to Classic
        act(() => result.current());

        // Then the cookie is marked and Classic opens, without a SwitchToOldDot request
        expect(writeExperienceCookie).toHaveBeenCalledWith(CONST.EXPERIENCE_COOKIE.VALUES.CLASSIC);
        expect(openOldDotLink).toHaveBeenCalledWith(CONST.OLDDOT_URLS.INBOX, true);
        expect(switchToOldDot).not.toHaveBeenCalled();
    });
});
