import {renderHook} from '@testing-library/react-native';

import useActionAvatar from '@components/Avatar/connected/useActionAvatar';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {getDisplayNameForParticipant} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../../../../utils/createMock';
import waitForBatchedUpdates from '../../../../utils/waitForBatchedUpdates';

const mockTranslate = jest.fn((path: string) => path);
const mockFormatPhoneNumber = jest.fn((value: string) => value);

jest.mock('@hooks/useLocalize', () => () => ({translate: mockTranslate, formatPhoneNumber: mockFormatPhoneNumber, localeCompare: (a: string, b: string) => a.localeCompare(b)}));

jest.mock('@libs/ReportUtils', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- jest.requireActual returns an untyped module object
    const actual = jest.requireActual('@libs/ReportUtils');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- spreads the untyped module object from jest.requireActual
    return {
        ...actual,
        __esModule: true,
        getDisplayNameForParticipant: jest.fn(() => 'Resolved Name'),
    };
});

const mockGetDisplayNameForParticipant = jest.mocked(getDisplayNameForParticipant);

const ACTOR_ACCOUNT_ID = 636363;
const CHAT_REPORT_ID = '1';

const wrapper = ({children}: {children: React.ReactNode}) => (
    <OnyxListItemProvider>
        <CurrentUserPersonalDetailsProvider>{children}</CurrentUserPersonalDetailsProvider>
    </OnyxListItemProvider>
);

describe('useActionAvatar translate wiring', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('should hand the translated "Hidden" label from useLocalize to the actor name lookup', async () => {
        // Given a comment in a DM, whose actor is named through getDisplayNameForParticipant when their personal details hide their name
        const report: Report = {reportID: CHAT_REPORT_ID, type: CONST.REPORT.TYPE.CHAT, participants: {[ACTOR_ACCOUNT_ID]: {notificationPreference: 'always'}}};
        const action = createMock<ReportAction>({
            reportActionID: '2',
            created: '2024-01-01 00:00:00',
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            actorAccountID: ACTOR_ACCOUNT_ID,
            message: [{type: 'COMMENT', html: 'Hi', text: 'Hi'}],
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, report);
        await waitForBatchedUpdates();

        // When the comment's avatar is resolved
        renderHook(() => useActionAvatar({report, action, shouldUseRealActor: false}), {wrapper});
        await waitForBatchedUpdates();

        // Then the actor's name lookup receives the label useLocalize translated, so a hidden actor reads in the user's language
        expect(mockGetDisplayNameForParticipant).toHaveBeenCalledWith(expect.objectContaining({accountID: ACTOR_ACCOUNT_ID, hiddenTranslation: 'common.hidden'}));
    });
});
