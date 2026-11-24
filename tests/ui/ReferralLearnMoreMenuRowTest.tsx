/** Referral learn-more keeps its external-link actions after MenuItem composition. */
import {fireEvent, render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';

import {openExternalLink} from '@libs/actions/Link';

import DynamicReferralDetailsPage from '@pages/DynamicReferralDetailsPage';
import {showContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';

import {callIfAuthenticated} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

let mockIsExecuting = false;
jest.mock(
    '@components/HeaderPageLayout',
    () =>
        ({children}: React.PropsWithChildren) =>
            children,
);
jest.mock('@components/ContextMenuItem', () => () => null);
jest.mock('@hooks/useDynamicBackPath', () => () => '');
jest.mock('@hooks/useSingleExecution', () => () => ({isExecuting: mockIsExecuting, singleExecution: (callback: () => void) => callback}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@libs/actions/Link', () => ({openExternalLink: jest.fn()}));
jest.mock('@pages/inbox/report/ContextMenu/ReportActionContextMenu', () => ({showContextMenu: jest.fn()}));
jest.mock('@userActions/Session', () => ({callIfAuthenticated: jest.fn((callback: () => void) => callback)}));

function renderPage() {
    return render(
        <LocaleContextProvider>
            <DynamicReferralDetailsPage
                {...createMock<React.ComponentProps<typeof DynamicReferralDetailsPage>>({route: {params: {contentType: CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND}}})}
            />
        </LocaleContextProvider>,
    );
}

beforeAll(() => Onyx.init({keys: ONYXKEYS}));
beforeEach(async () => {
    jest.clearAllMocks();
    mockIsExecuting = false;
    await Onyx.clear();
    await Onyx.set(ONYXKEYS.SESSION, {authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT});
    await waitForBatchedUpdates();
});

it('preserves authenticated navigation and the row-anchored link context menu', () => {
    // Given a referral details page with the real compound external-link leaf.
    renderPage();

    // When the row is activated and then long pressed.
    const row = screen.getByRole('button', {name: /^requestorStep.learnMore/});
    fireEvent.press(row, {nativeEvent: {}});
    fireEvent(row, 'longPress', {preventDefault: () => {}});

    // Then both actions still use the referral help URL and the row's own context-menu anchor.
    expect(openExternalLink).toHaveBeenCalledWith(CONST.REFERRAL_PROGRAM.LEARN_MORE_LINK);
    expect(callIfAuthenticated).toHaveBeenCalledWith(expect.any(Function), {authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT});
    expect(showContextMenu).toHaveBeenCalledWith(expect.objectContaining({type: CONST.CONTEXT_MENU_TYPES.LINK, selection: CONST.REFERRAL_PROGRAM.LEARN_MORE_LINK}));
    const anchor = jest.mocked(showContextMenu).mock.calls.at(0)?.at(0)?.contextMenuAnchor;
    expect(anchor).toBeDefined();
    expect(anchor).not.toBeNull();
});

it('prevents a second learn-more action while execution is disabled', () => {
    // Given the single-execution guard is already busy.
    mockIsExecuting = true;
    renderPage();

    // When the user attempts to activate the same row again.
    const row = screen.getByRole('button', {name: /^requestorStep.learnMore/});
    fireEvent.press(row, {nativeEvent: {}});

    // Then the disabled control does not open a second external page.
    expect(row).toBeDisabled();
    expect(openExternalLink).not.toHaveBeenCalled();
});
