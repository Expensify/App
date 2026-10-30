import {fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import Navigation from '@libs/Navigation/Navigation';

import ReportDetailsNameSection from '@pages/DynamicReportDetailsPage/ReportDetailsNameSection';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));
jest.mock('@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute', () => jest.fn(() => 'report-settings-name'));

const GROUP_CHAT: Report = {
    reportID: '1',
    reportName: 'Weekend trip',
    chatType: CONST.REPORT.CHAT_TYPE.GROUP,
    type: CONST.REPORT.TYPE.CHAT,
};

const WORKSPACE_CHAT: Report = {
    reportID: '2',
    reportName: 'Acme expenses',
    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
    type: CONST.REPORT.TYPE.CHAT,
    policyID: 'policy',
};

async function renderSection(report: Report) {
    await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <ReportDetailsNameSection reportID={report.reportID} />
        </ComposeProviders>,
    );
    await waitForBatchedUpdatesWithAct();
}

describe('ReportDetailsNameSection', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        await Onyx.clear();
        jest.clearAllMocks();
    });

    it('opens the rename page from a report the user can rename, announcing the field name before the report name', async () => {
        // Given a group chat, which the user can rename and which shows its name as a push row
        await renderSection(GROUP_CHAT);

        // When the name row is pressed
        fireEvent.press(screen.getByRole('button', {name: `${translateLocal('newRoomPage.groupName')}, Weekend trip`}), {type: 'press'});

        // Then the rename page opens
        expect(Navigation.navigate).toHaveBeenCalledWith('report-settings-name');
    });

    it('renders the name of a report that cannot be renamed as static text', async () => {
        // Given a workspace chat, whose name the user cannot change
        await renderSection(WORKSPACE_CHAT);

        // When the section renders
        const row = screen.getByLabelText('Acme expenses');

        // Then the row is not a button, so it offers no rename action
        expect(row).not.toHaveProp('role', CONST.ROLE.BUTTON);
        expect(screen.queryByRole('button')).toBeNull();
    });
});
