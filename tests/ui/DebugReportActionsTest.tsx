import {act, fireEvent, render, screen} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type Navigation from '@libs/Navigation/Navigation';
import DebugReportActions from '@pages/Debug/Report/DebugReportActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportAction} from '@src/types/onyx';
import createRandomPolicy from '../utils/collections/policies';
import createRandomReportAction from '../utils/collections/reportActions';
import {createRandomReport} from '../utils/collections/reports';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: () => true,
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));

describe('DebugReportActions', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
        act(() => {
            Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('should show no results message when search is empty', async () => {
        const policyID = '12';
        const reportID = '1';
        const reportActionID = '123';
        const policy: Policy = createRandomPolicy(Number(policyID));
        const report: Report = {...createRandomReport(Number(reportID), CONST.REPORT.CHAT_TYPE.POLICY_ROOM), policyID};
        const reportActionL: ReportAction = {
            ...createRandomReportAction(Number(reportActionID)),
            reportID,
            message: {
                html: '',
                text: '',
                type: '',
            },
        };
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.NVP_PREFERRED_LOCALE}`, 'en');
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                [reportActionID]: reportActionL,
            });
        });

        render(
            <OnyxListItemProvider>
                <LocaleContextProvider>
                    <DebugReportActions reportID={reportID} />
                </LocaleContextProvider>
            </OnyxListItemProvider>,
        );

        await waitForBatchedUpdatesWithAct();

        const input = screen.getByTestId('selection-list-text-input');
        fireEvent.changeText(input, 'Should show no results found');
        expect(await screen.findByText('No results found')).toBeOnTheScreen();
    });
});
