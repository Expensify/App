import {act, render, screen} from '@testing-library/react-native';

import SidePanelReport from '@components/SidePanel/SidePanelReport';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ComponentProps} from 'react';
import type ReactNative from 'react-native';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import {getFakeReportAction} from '../utils/ReportTestUtils';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@pages/inbox/ReportScreen', () => {
    const {Text: MockText} = jest.requireActual<typeof ReactNative>('react-native');
    function MockReportScreen({route}: {route: {params: {reportActionID?: string; reportActionAlignment?: string}}}) {
        return (
            <MockText testID="anchor">
                {route.params.reportActionID ?? 'no anchor'}:{route.params.reportActionAlignment ?? 'default'}
            </MockText>
        );
    }
    return {__esModule: true, default: MockReportScreen};
});

describe('SidePanelReport anchor', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));
    afterEach(() => Onyx.clear());

    it('drops a cached-reply anchor when the optimistic answer rolls back', async () => {
        // Given a pane opened at its preloaded answer.
        const navigation = createMock<ComponentProps<typeof SidePanelReport>['navigation']>({});
        const answerID = '901';
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}100`, {[answerID]: getFakeReportAction(901, {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT})});
        render(
            <SidePanelReport
                navigation={navigation}
                reportID="100"
                reportActionID="901"
            />,
        );
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText('901:start')).toBeOnTheScreen();

        // When sending the question fails and its optimistic reply is removed.
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}100`, {[answerID]: null});
        });
        await waitForBatchedUpdatesWithAct();

        // Then the synthetic route no longer points pagination at a missing action.
        expect(screen.getByText('no anchor:default')).toBeOnTheScreen();
    });
});
