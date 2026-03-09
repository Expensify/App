import type * as ReactNavigation from '@react-navigation/native';
import {act, render, screen, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import OptionsListContextProvider from '@components/OptionListContextProvider';
import {RoomInvitePage} from '@pages/RoomInvitePage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {fakePersonalDetails, getFakeReport} from '../utils/LHNTestUtils';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');

    return {
        ...actualNavigation,
        useIsFocused: () => true,
        useRoute: jest.fn(() => ({key: '', name: '', params: {}})),
        useFocusEffect: jest.fn(),
        usePreventRemove: jest.fn(),
        useNavigation: () => ({
            navigate: jest.fn(),
            addListener: jest.fn(),
            getState: () => ({
                routes: [],
            }),
        }),
    };
});
jest.mock('@src/libs/Navigation/navigationRef');
jest.mock('@hooks/useAncestors', () => jest.fn(() => []));
jest.mock('@hooks/useReportIsArchived', () => jest.fn(() => false));
jest.mock('@libs/actions/Report', () => ({
    inviteToRoom: jest.fn(),
    inviteToRoomAction: jest.fn(),
    searchUserInServer: jest.fn(),
}));
jest.mock('@libs/actions/RoomMembersUserSearchPhrase', () => ({
    clearUserSearchPhrase: jest.fn(),
    updateUserSearchPhrase: jest.fn(),
}));

const wrapper = ({children}: {children: React.ReactNode}) => (
    <OnyxListItemProvider>
        <HTMLEngineProvider>
            <LocaleContextProvider>
                <OptionsListContextProvider>{children}</OptionsListContextProvider>
            </LocaleContextProvider>
        </HTMLEngineProvider>
    </OnyxListItemProvider>
);

describe('RoomInvitePage', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('should render without hitting the maximum update depth error', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const report = {
            ...getFakeReport([1, 2]),
            reportID: '1',
            policyID: '1',
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
        };

        await act(async () => {
            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: {accountID: 1, email: 'email1@test.com'},
                [ONYXKEYS.COUNTRY_CODE]: CONST.DEFAULT_COUNTRY_CODE,
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: fakePersonalDetails,
                [ONYXKEYS.ROOM_MEMBERS_USER_SEARCH_PHRASE]: '',
            });
        });
        await waitForBatchedUpdatesWithAct();

        render(
            <RoomInvitePage
                betas={[]}
                report={report}
                reportMetadata={undefined}
                isLoadingReportData={false}
                policy={undefined}
                didScreenTransitionEnd
                route={{params: {reportID: report.reportID, backTo: ''}, key: '', name: ''} as never}
                navigation={{} as never}
            />,
            {wrapper},
        );

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByTestId('selection-list-text-input')).toBeOnTheScreen();
        });

        const loggedMaximumUpdateDepthError = consoleErrorSpy.mock.calls.some((call) =>
            call.some((arg) => {
                if (typeof arg === 'string') {
                    return arg.includes('Maximum update depth exceeded');
                }

                return arg instanceof Error && arg.message.includes('Maximum update depth exceeded');
            }),
        );

        expect(loggedMaximumUpdateDepthError).toBe(false);

        consoleErrorSpy.mockRestore();
    });
});
