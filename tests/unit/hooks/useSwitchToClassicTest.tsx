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
        // Given an account in the hybridWeb beta
        await arrangeAccount([CONST.BETAS.HYBRID_WEB]);
        const {result} = await renderSwitchToClassic();

        // When the user switches and the request is still in flight
        act(() => result.current.switchToClassic('Too many clicks'));
        await setSwitchRequestState({isLoading: true, errors: null});

        // Then the switch is recorded, the buttons are disabled, and Classic doesn't open yet, because it would read the old tryNewDot
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
        // Given an account in the hybridWeb beta
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

    it('opens Classic without marking the cookie for an account outside the beta', async () => {
        // Given an account with every beta but hybridWeb, which the server only enables explicitly
        await Onyx.set(ONYXKEYS.BETA_CONFIGURATION, {explicitOnly: [CONST.BETAS.HYBRID_WEB]});
        await arrangeAccount([CONST.BETAS.ALL]);
        const {result} = await renderSwitchToClassic();

        // When the server saves the switch
        await requestSwitchAndRespond(result.current, {isLoading: false});

        // Then Classic opens but the cookie, which the router only reads for beta accounts, is left alone
        expect(openOldDotLink).toHaveBeenCalledWith(CONST.OLDDOT_URLS.INBOX, true);
        expect(writeExperienceCookie).not.toHaveBeenCalled();
    });

    it.each<[string, Partial<Session>]>([
        ['Supportal', {authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT}],
        ['Supportal with a used support token', {isSupportAuthTokenUsed: true}],
        ['Copilot', {authTokenType: CONST.AUTH_TOKEN_TYPES.DELEGATE}],
    ])('does not overwrite the agent cookie in a %s session', async (_, session) => {
        // Given an agent acting on an account in the hybridWeb beta
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
        // Given an account in the hybridWeb beta that the server already keeps in Classic
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
