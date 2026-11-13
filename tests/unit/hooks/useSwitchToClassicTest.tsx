import {act, renderHook} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useOpenClassic from '@hooks/useOpenClassic';
import useSwitchToClassic from '@hooks/useSwitchToClassic';

import {writeExperienceCookie} from '@libs/ExperienceCookie';
import Growl from '@libs/Growl';

import Navigation from '@navigation/Navigation';

import {switchToOldDot} from '@userActions/ExitSurvey';
import {openOldDotLink} from '@userActions/Link';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Beta, Session} from '@src/types/onyx';

import type {ValueOf} from 'type-fest';

import React from 'react';
import Onyx from 'react-native-onyx';

import getOnyxValue from '../../utils/getOnyxValue';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/ExperienceCookie', () => ({writeExperienceCookie: jest.fn(() => true), clearExperienceCookie: jest.fn(() => true)}));
jest.mock('@userActions/Link', () => ({openOldDotLink: jest.fn()}));
jest.mock('@userActions/ExitSurvey', () => ({...jest.requireActual<Record<string, unknown>>('@userActions/ExitSurvey'), switchToOldDot: jest.fn()}));
jest.mock('@navigation/Navigation', () => ({__esModule: true, default: {dismissModal: jest.fn()}}));
jest.mock('@libs/Growl', () => ({__esModule: true, default: {error: jest.fn()}}));
jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));

type SwitchResult = ValueOf<typeof CONST.EXIT_SURVEY.SWITCH_RESULT>;

function Wrapper({children}: {children: React.ReactNode}) {
    return <OnyxListItemProvider>{children}</OnyxListItemProvider>;
}

async function renderSwitchToClassic(options?: Parameters<typeof useSwitchToClassic>[0]) {
    const rendered = renderHook(() => useSwitchToClassic(options), {wrapper: Wrapper});
    await waitForBatchedUpdatesWithAct();
    return rendered;
}

/** Starts a switch whose SwitchToOldDot request gets the given ID */
function startSwitch(result: ReturnType<typeof useSwitchToClassic>, requestID: string) {
    jest.mocked(switchToOldDot).mockReturnValueOnce(requestID);
    act(() => result.switchToClassic('Too many clicks'));
}

/** Stands in for the success or failure data of the queued SwitchToOldDot requests, applied in one Onyx update */
async function respond(results: Record<string, SwitchResult>) {
    await act(async () => {
        await Onyx.merge(ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM, {switchToOldDotResults: results});
    });
    await waitForBatchedUpdatesWithAct();
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
        startSwitch(result.current, 'request');
        await waitForBatchedUpdatesWithAct();

        // Then the switch is recorded, the buttons are disabled, and Classic doesn't open yet, because Classic would send the user back to New Expensify
        expect(switchToOldDot).toHaveBeenCalledWith('Too many clicks');
        expect(result.current.isSwitchingToClassic).toBe(true);
        expect(writeExperienceCookie).not.toHaveBeenCalled();
        expect(openOldDotLink).not.toHaveBeenCalled();

        // When the server saves the switch
        await respond({request: CONST.EXIT_SURVEY.SWITCH_RESULT.SAVED});

        // Then the cookie is marked before Classic opens in the same tab
        expect(result.current.isSwitchingToClassic).toBe(false);
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
        startSwitch(result.current, 'request');
        await respond({request: CONST.EXIT_SURVEY.SWITCH_RESULT.FAILED});

        // Then the user sees an error, can retry, and nothing changes
        expect(Growl.error).toHaveBeenCalledWith({bodyText: 'common.genericErrorMessage'});
        expect(result.current.isSwitchingToClassic).toBe(false);
        expect(writeExperienceCookie).not.toHaveBeenCalled();
        expect(openOldDotLink).not.toHaveBeenCalled();
    });

    it('removes only the outcomes it has handled', async () => {
        // Given an outcome of a switch started in another tab
        await arrangeAccount([CONST.BETAS.HYBRID_WEB]);
        await Onyx.merge(ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM, {switchToOldDotResults: {otherTabRequest: CONST.EXIT_SURVEY.SWITCH_RESULT.SAVED}});
        const {result} = await renderSwitchToClassic();

        // When one request fails and the retry is saved
        startSwitch(result.current, 'failedRequest');
        await respond({failedRequest: CONST.EXIT_SURVEY.SWITCH_RESULT.FAILED});
        startSwitch(result.current, 'savedRequest');
        await respond({savedRequest: CONST.EXIT_SURVEY.SWITCH_RESULT.SAVED});

        // Then both handled outcomes are removed, so they don't pile up in storage, and the other tab's outcome stays
        const form = await getOnyxValue(ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM);
        expect(form?.switchToOldDotResults).toEqual({otherTabRequest: CONST.EXIT_SURVEY.SWITCH_RESULT.SAVED});
        expect(openOldDotLink).toHaveBeenCalledTimes(1);
    });

    it('lets each tab act on its own request when overlapping switches fail and then succeed', async () => {
        // Given two tabs that both started a switch before either request finished
        await arrangeAccount([CONST.BETAS.HYBRID_WEB]);
        const {result: firstTab} = await renderSwitchToClassic();
        const {result: secondTab} = await renderSwitchToClassic();
        startSwitch(firstTab.current, 'firstRequest');
        startSwitch(secondTab.current, 'secondRequest');
        await waitForBatchedUpdatesWithAct();

        // When the first request fails
        await respond({firstRequest: CONST.EXIT_SURVEY.SWITCH_RESULT.FAILED});

        // Then only the first tab shows the error, and the second keeps waiting for its own request
        expect(Growl.error).toHaveBeenCalledTimes(1);
        expect(firstTab.current.isSwitchingToClassic).toBe(false);
        expect(secondTab.current.isSwitchingToClassic).toBe(true);
        expect(openOldDotLink).not.toHaveBeenCalled();

        // When the second request succeeds
        await respond({secondRequest: CONST.EXIT_SURVEY.SWITCH_RESULT.SAVED});

        // Then the second tab opens Classic instead of reading the first request's failure
        expect(Growl.error).toHaveBeenCalledTimes(1);
        expect(secondTab.current.isSwitchingToClassic).toBe(false);
        expect(openOldDotLink).toHaveBeenCalledTimes(1);
    });

    it('lets each tab act on its own request when a failure and a success arrive in one update', async () => {
        // Given two tabs that both started a switch before either request finished
        await arrangeAccount([CONST.BETAS.HYBRID_WEB]);
        const {result: firstTab} = await renderSwitchToClassic();
        const {result: secondTab} = await renderSwitchToClassic();
        startSwitch(firstTab.current, 'firstRequest');
        startSwitch(secondTab.current, 'secondRequest');
        await waitForBatchedUpdatesWithAct();

        // When the first request's failure and the second request's success are applied together
        await respond({firstRequest: CONST.EXIT_SURVEY.SWITCH_RESULT.FAILED, secondRequest: CONST.EXIT_SURVEY.SWITCH_RESULT.SAVED});

        // Then the first tab shows one error and the second tab opens Classic once
        expect(Growl.error).toHaveBeenCalledTimes(1);
        expect(openOldDotLink).toHaveBeenCalledTimes(1);
        expect(firstTab.current.isSwitchingToClassic).toBe(false);
        expect(secondTab.current.isSwitchingToClassic).toBe(false);
    });

    it('ignores a switch started elsewhere', async () => {
        // Given a screen where the user hasn't started a switch, and a form that holds an earlier saved switch
        await arrangeAccount([CONST.BETAS.HYBRID_WEB]);
        await Onyx.merge(ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM, {switchToOldDotResults: {earlierRequest: CONST.EXIT_SURVEY.SWITCH_RESULT.SAVED}});
        const {result} = await renderSwitchToClassic();

        // When a switch started in another tab finishes
        await respond({otherTabRequest: CONST.EXIT_SURVEY.SWITCH_RESULT.SAVED});

        // Then this screen doesn't navigate, because the user didn't ask it to
        expect(result.current.isSwitchingToClassic).toBe(false);
        expect(openOldDotLink).not.toHaveBeenCalled();
    });

    it('keeps waiting for the switch when the exit survey form is reset in another tab', async () => {
        // Given a switch from this screen that is waiting for the server
        await arrangeAccount([CONST.BETAS.HYBRID_WEB]);
        const {result} = await renderSwitchToClassic();
        startSwitch(result.current, 'request');
        await waitForBatchedUpdatesWithAct();

        // When another tab opens the exit survey, which resets the shared form
        await act(async () => {
            await Onyx.set(ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM, null);
        });
        await waitForBatchedUpdatesWithAct();

        // Then Classic doesn't open early, because the switch isn't saved yet
        expect(result.current.isSwitchingToClassic).toBe(true);
        expect(openOldDotLink).not.toHaveBeenCalled();

        // When the server saves the switch
        await respond({request: CONST.EXIT_SURVEY.SWITCH_RESULT.SAVED});

        // Then Classic opens
        expect(openOldDotLink).toHaveBeenCalledWith(CONST.OLDDOT_URLS.INBOX, true);
    });

    it('closes the exit survey before Classic opens when the screen asks for it', async () => {
        // Given the exit survey, which is a modal that stays behind the browser on desktop and native
        await arrangeAccount([CONST.BETAS.HYBRID_WEB]);
        const {result} = await renderSwitchToClassic({shouldDismissModal: true});

        // When the server saves the switch
        startSwitch(result.current, 'request');
        await respond({request: CONST.EXIT_SURVEY.SWITCH_RESULT.SAVED});

        // Then the modal is closed before Classic opens
        expect(Navigation.dismissModal).toHaveBeenCalledTimes(1);
        expect(jest.mocked(Navigation.dismissModal).mock.invocationCallOrder.at(0)).toBeLessThan(jest.mocked(openOldDotLink).mock.invocationCallOrder.at(0) ?? 0);
    });

    it('keeps the screen open when the switch fails or the screen is not a modal', async () => {
        // Given the exit survey and Troubleshoot, which isn't a modal
        await arrangeAccount([CONST.BETAS.HYBRID_WEB]);
        const {result: exitSurvey} = await renderSwitchToClassic({shouldDismissModal: true});
        const {result: troubleshoot} = await renderSwitchToClassic();

        // When the exit survey's switch fails and the Troubleshoot switch is saved
        startSwitch(exitSurvey.current, 'exitSurveyRequest');
        startSwitch(troubleshoot.current, 'troubleshootRequest');
        await respond({exitSurveyRequest: CONST.EXIT_SURVEY.SWITCH_RESULT.FAILED, troubleshootRequest: CONST.EXIT_SURVEY.SWITCH_RESULT.SAVED});

        // Then nothing is dismissed, so the user can retry from the survey and Troubleshoot has no modal to close
        expect(Navigation.dismissModal).not.toHaveBeenCalled();
        expect(openOldDotLink).toHaveBeenCalledTimes(1);
    });

    it('opens Classic without marking the cookie for an account outside the beta', async () => {
        // Given an account with every beta except the one that uses the experience cookie, which the server only enables explicitly
        await Onyx.set(ONYXKEYS.BETA_CONFIGURATION, {explicitOnly: [CONST.BETAS.HYBRID_WEB]});
        await arrangeAccount([CONST.BETAS.ALL]);
        const {result} = await renderSwitchToClassic();

        // When the server saves the switch
        startSwitch(result.current, 'request');
        await respond({request: CONST.EXIT_SURVEY.SWITCH_RESULT.SAVED});

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
        startSwitch(result.current, 'request');
        await respond({request: CONST.EXIT_SURVEY.SWITCH_RESULT.SAVED});

        // Then Classic opens, but the agent's own cookie in this browser isn't changed
        expect(openOldDotLink).toHaveBeenCalledWith(CONST.OLDDOT_URLS.INBOX, true);
        expect(writeExperienceCookie).not.toHaveBeenCalled();
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
