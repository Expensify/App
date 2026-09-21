import {render} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ReportActionAvatars from '@components/ReportActionAvatars';
import type {AvatarIcon} from '@components/Avatar/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import type {PropsWithChildren} from 'react';

import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';

import createRandomReportAction from '../utils/collections/reportActions';
import {createRegularChat} from '../utils/collections/reports';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const MAIN_ACCOUNT_ID = 12345;
const COPILOT_ACCOUNT_ID = 67890;
const CHAT_REPORT_ID = 9500;
const REPORT_ACTION_ID = '9501';

/** Captures the `avatar` prop `ReportActionAvatars` hands to the single-avatar layout, which is where the copilot badge is attached. */
const capturedAvatars: AvatarIcon[] = [];

function MockSingleAvatar({avatar}: PropsWithChildren<{avatar: AvatarIcon}>) {
    capturedAvatars.push(avatar);
    return <View testID="MockSingleAvatar" />;
}

jest.mock('@components/Avatar/layouts/SingleAvatar', () => ({__esModule: true, default: MockSingleAvatar}));

const mockChatReport = createRegularChat(CHAT_REPORT_ID, [MAIN_ACCOUNT_ID, CONST.ACCOUNT_ID.CONCIERGE]);

/**
 * Builds the action shape the server returns for a track-expense whisper created while a copilot was driving the
 * main account: Concierge is the actor, but `delegateAccountID` still carries the copilot.
 */
function buildAction(actorAccountID: number): ReportAction {
    return {
        ...createRandomReportAction(Number(REPORT_ACTION_ID)),
        reportActionID: REPORT_ACTION_ID,
        actionName: CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_TRACK_EXPENSE_WHISPER,
        actorAccountID,
        delegateAccountID: COPILOT_ACCOUNT_ID,
    };
}

function renderAvatars(action: ReportAction) {
    return render(
        <OnyxListItemProvider>
            <ReportActionAvatars
                report={mockChatReport}
                action={action}
            />
        </OnyxListItemProvider>,
    );
}

describe('ReportActionAvatars copilot badge', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    beforeEach(async () => {
        capturedAvatars.length = 0;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, mockChatReport);
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [CONST.ACCOUNT_ID.CONCIERGE]: {accountID: CONST.ACCOUNT_ID.CONCIERGE, displayName: 'Concierge', login: 'concierge@expensify.com'},
            [MAIN_ACCOUNT_ID]: {accountID: MAIN_ACCOUNT_ID, displayName: 'Main Account', login: 'main@example.com'},
            [COPILOT_ACCOUNT_ID]: {accountID: COPILOT_ACCOUNT_ID, displayName: 'Copilot B', login: 'copilot@example.com'},
        });
        await waitForBatchedUpdates();
    });

    afterEach(() => {
        Onyx.clear();
    });

    it('does not attach a copilot to a Concierge-authored action that carries delegateAccountID', () => {
        // Given an action authored by Concierge that the server stamped with the copilot's account ID
        const action = buildAction(CONST.ACCOUNT_ID.CONCIERGE);

        // When the avatar for that action is rendered
        renderAvatars(action);

        // Then no copilot is attached, so the tooltip reads "Concierge" and not "Copilot B (as copilot for Concierge)"
        expect(capturedAvatars.length).toBeGreaterThan(0);
        for (const avatar of capturedAvatars) {
            expect(avatar.copilot).toBeUndefined();
        }
    });

    it('still attaches the copilot to an action a copilot authored on behalf of a real user', () => {
        // Given the same action authored by the main account rather than Concierge
        const action = buildAction(MAIN_ACCOUNT_ID);

        // When the avatar for that action is rendered
        renderAvatars(action);

        // Then the copilot badge is preserved, so guarding the Concierge case did not regress the real copilot case
        expect(capturedAvatars.at(-1)?.copilot?.accountID).toBe(COPILOT_ACCOUNT_ID);
    });
});
