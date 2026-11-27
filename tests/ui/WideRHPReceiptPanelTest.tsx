import {act, render} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import useRHPWidth from '@components/WideRHPContextProvider/useRHPWidth';

import WideRHPReceiptPanel from '@pages/inbox/WideRHPReceiptPanel';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';

import type * as ReactNavigation from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

const REPORT_ID = '7001';
const mockRoute = {key: 'SearchReport-key', name: SCREENS.RIGHT_MODAL.SEARCH_REPORT, params: {reportID: REPORT_ID}};

jest.mock('@components/WideRHPContextProvider/useRHPWidth', () => jest.fn());
// The wide panel only exists on wide screens
jest.mock('@hooks/useResponsiveLayout');
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigation>('@react-navigation/native'),
    useRoute: () => mockRoute,
}));

function renderPanel() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <WideRHPReceiptPanel />
        </ComposeProviders>,
    );
}

describe('WideRHPReceiptPanel', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.clearAllMocks();
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('opens a trip room in a wide panel', async () => {
        // Given a trip room opened in the Spend panel
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createMock<Report>({reportID: REPORT_ID, type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.TRIP_ROOM}));
        });

        // When the panel renders
        renderPanel();
        await waitForBatchedUpdatesWithAct();

        // Then it asks for a wide panel from the room itself, so it stays wide even when the mark from the row press was used up by an earlier mount
        expect(useRHPWidth).toHaveBeenLastCalledWith('wide');
    });

    it('keeps a regular chat in a narrow panel', async () => {
        // Given a regular chat opened in the Spend panel
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createMock<Report>({reportID: REPORT_ID, type: CONST.REPORT.TYPE.CHAT}));
        });

        // When the panel renders
        renderPanel();
        await waitForBatchedUpdatesWithAct();

        // Then it stays narrow, since only trip rooms and expenses open wide
        expect(useRHPWidth).toHaveBeenLastCalledWith('narrow');
    });
});
