import {renderHook} from '@testing-library/react-native';

import useAskConcierge from '@components/Search/SearchRouter/useAskConcierge';

import {addAttachmentWithComment, addComment} from '@userActions/Report';
import {createTaskFromMarkdown} from '@userActions/Task';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';

import Onyx from 'react-native-onyx';

const ACCOUNT_ID = 1;
const DELEGATE_ACCOUNT_ID = '99';
const TIMEZONE = 'Europe/Warsaw';
const CONCIERGE_REPORT_ID = '100';
const ADMINS_ROOM_REPORT_ID = '200';

let mockSidePanelReportID: string | undefined;
let mockIsInSidePanel = false;
const mockOpenConciergeAnywhere = jest.fn();

jest.mock('@hooks/useSidePanelReportID', () => ({
    __esModule: true,
    default: () => mockSidePanelReportID,
}));

jest.mock('@hooks/useOpenConciergeAnywhere', () => ({
    __esModule: true,
    default: () => ({openConciergeAnywhere: mockOpenConciergeAnywhere, isInSidePanel: mockIsInSidePanel}),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({accountID: 1, timezone: {selected: 'Europe/Warsaw'}, login: 'user@domain.com', email: 'user@domain.com', displayName: 'User', avatar: undefined}),
}));

jest.mock('@hooks/useDelegateAccountID', () => ({
    __esModule: true,
    default: () => '99',
}));

jest.mock('@userActions/Report', () => ({
    addComment: jest.fn(),
    addAttachmentWithComment: jest.fn(),
}));

jest.mock('@userActions/Task', () => ({
    createTaskFromMarkdown: jest.fn(() => false),
}));

const mockAddComment = jest.mocked(addComment);
const mockAddAttachmentWithComment = jest.mocked(addAttachmentWithComment);
const mockCreateTaskFromMarkdown = jest.mocked(createTaskFromMarkdown);

const CONCIERGE_REPORT = {reportID: CONCIERGE_REPORT_ID, reportName: 'Concierge'} as Report;
const ADMINS_ROOM_REPORT = {reportID: ADMINS_ROOM_REPORT_ID, reportName: '#admins'} as Report;

async function seedReports() {
    await Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, CONCIERGE_REPORT_ID);
    await Promise.all([CONCIERGE_REPORT, ADMINS_ROOM_REPORT].map((report) => Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report)));
}

function renderAskConcierge(options?: {forceConcierge?: boolean}) {
    return renderHook(() => useAskConcierge(options));
}

describe('useAskConcierge', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockSidePanelReportID = undefined;
        mockIsInSidePanel = false;
        jest.clearAllMocks();
        await Onyx.clear();
    });

    describe('target report resolution', () => {
        it('targets the report the side panel maps to when Concierge is not forced', async () => {
            // Given web, where the side panel maps the Home page to the #admins room for a workspace admin
            mockIsInSidePanel = true;
            mockSidePanelReportID = ADMINS_ROOM_REPORT_ID;
            await seedReports();

            // When the hook resolves its target
            const {result} = renderAskConcierge();

            // Then it targets that report, not Concierge
            expect(result.current.conciergeTargetReportID).toBe(ADMINS_ROOM_REPORT_ID);
        });

        it('targets Concierge when forced, even though the side panel maps elsewhere', async () => {
            // Given web, where the side panel maps the Home page to the #admins room for a workspace admin
            mockIsInSidePanel = true;
            mockSidePanelReportID = ADMINS_ROOM_REPORT_ID;
            await seedReports();

            // When the hook is asked to force Concierge
            const {result} = renderAskConcierge({forceConcierge: true});

            // Then it targets the Concierge report
            expect(result.current.conciergeTargetReportID).toBe(CONCIERGE_REPORT_ID);
        });

        it('targets Concierge on native, where there is no side panel', async () => {
            // Given native, which has no side panel to route through
            await seedReports();

            // When the hook resolves its target
            const {result} = renderAskConcierge();

            // Then it targets the Concierge report
            expect(result.current.conciergeTargetReportID).toBe(CONCIERGE_REPORT_ID);
        });
    });

    describe('askConcierge', () => {
        it('opens Concierge and sends the trimmed message to the resolved report', async () => {
            // Given a loaded Concierge report
            await seedReports();
            const {result} = renderAskConcierge({forceConcierge: true});
            expect(result.current.shouldShowAskConcierge).toBe(true);

            // When a padded message is sent
            result.current.askConcierge('  Where is my expense?  ');

            // Then Concierge is opened and the trimmed text is added as a comment
            expect(mockOpenConciergeAnywhere).toHaveBeenCalledWith({forceConcierge: true});
            expect(mockAddComment).toHaveBeenCalledWith(
                expect.objectContaining({
                    report: CONCIERGE_REPORT,
                    notifyReportID: CONCIERGE_REPORT_ID,
                    text: 'Where is my expense?',
                    currentUserAccountID: ACCOUNT_ID,
                    timezoneParam: {selected: TIMEZONE},
                    shouldPlaySound: true,
                    isInSidePanel: false,
                    delegateAccountID: DELEGATE_ACCOUNT_ID,
                    conciergeReportID: CONCIERGE_REPORT_ID,
                }),
            );
        });

        it('creates a task instead of a comment when the message uses the `[] task` shorthand', async () => {
            // Given a loaded Concierge report and text that the markdown task detection claims
            await seedReports();
            mockCreateTaskFromMarkdown.mockReturnValueOnce(true);
            const {result} = renderAskConcierge({forceConcierge: true});
            expect(result.current.shouldShowAskConcierge).toBe(true);

            // When the shorthand is sent
            result.current.askConcierge('  [] Buy milk  ');

            // Then Concierge is still opened, the detection gets the trimmed text and the target report,
            // and the text is not also posted as a plain comment
            expect(mockOpenConciergeAnywhere).toHaveBeenCalledWith({forceConcierge: true});
            expect(mockCreateTaskFromMarkdown).toHaveBeenCalledWith(expect.objectContaining({text: '[] Buy milk', parentReport: CONCIERGE_REPORT}));
            expect(mockAddComment).not.toHaveBeenCalled();
        });

        it('falls back to a comment when the text is not the task shorthand', async () => {
            // Given a loaded Concierge report and text the markdown task detection does not claim
            await seedReports();
            const {result} = renderAskConcierge({forceConcierge: true});
            expect(result.current.shouldShowAskConcierge).toBe(true);

            // When a plain message is sent
            result.current.askConcierge('Where is my expense?');

            // Then it is sent as a comment
            expect(mockCreateTaskFromMarkdown).toHaveBeenCalled();
            expect(mockAddComment).toHaveBeenCalledWith(expect.objectContaining({text: 'Where is my expense?'}));
        });

        it('does nothing for a whitespace-only message', async () => {
            // Given a loaded Concierge report
            await seedReports();
            const {result} = renderAskConcierge({forceConcierge: true});
            expect(result.current.shouldShowAskConcierge).toBe(true);

            // When a whitespace-only message is sent
            result.current.askConcierge('   ');

            // Then nothing is sent
            expect(mockOpenConciergeAnywhere).not.toHaveBeenCalled();
            expect(mockAddComment).not.toHaveBeenCalled();
        });
    });

    describe('askConciergeWithAttachment', () => {
        const FILES: FileObject[] = [{name: 'receipt.jpg', type: 'image/jpeg', uri: 'file://receipt.jpg'}];

        it('opens Concierge and sends the attachments with the trimmed text', async () => {
            // Given a loaded Concierge report
            await seedReports();
            const {result} = renderAskConcierge({forceConcierge: true});
            expect(result.current.shouldShowAskConcierge).toBe(true);

            // When attachments are sent with a padded caption
            result.current.askConciergeWithAttachment(FILES, '  Here it is  ');

            // Then Concierge is opened and the attachments are added with the trimmed text
            expect(mockOpenConciergeAnywhere).toHaveBeenCalledWith({forceConcierge: true});
            expect(mockAddAttachmentWithComment).toHaveBeenCalledWith(
                expect.objectContaining({
                    report: CONCIERGE_REPORT,
                    notifyReportID: CONCIERGE_REPORT_ID,
                    attachments: FILES,
                    text: 'Here it is',
                    currentUserAccountID: ACCOUNT_ID,
                    timezone: {selected: TIMEZONE},
                    shouldPlaySound: true,
                    isInSidePanel: false,
                    delegateAccountID: DELEGATE_ACCOUNT_ID,
                    conciergeReportID: CONCIERGE_REPORT_ID,
                }),
            );
        });

        it('sends attachments with no text', async () => {
            // Given a loaded Concierge report
            await seedReports();
            const {result} = renderAskConcierge({forceConcierge: true});
            expect(result.current.shouldShowAskConcierge).toBe(true);

            // When attachments are sent without a caption
            result.current.askConciergeWithAttachment(FILES, '');

            // Then the attachments are still sent
            expect(mockAddAttachmentWithComment).toHaveBeenCalledWith(expect.objectContaining({attachments: FILES, text: ''}));
        });

        it('sends to the report the side panel maps to when Concierge is not forced', async () => {
            // Given web, where the side panel maps the Home page to the #admins room for a workspace admin
            mockIsInSidePanel = true;
            mockSidePanelReportID = ADMINS_ROOM_REPORT_ID;
            await seedReports();
            const {result} = renderAskConcierge();
            expect(result.current.shouldShowAskConcierge).toBe(true);

            // When attachments are sent
            result.current.askConciergeWithAttachment(FILES, 'Here it is');

            // Then they go to that report, not Concierge
            expect(mockOpenConciergeAnywhere).toHaveBeenCalledWith({forceConcierge: false});
            expect(mockAddAttachmentWithComment).toHaveBeenCalledWith(
                expect.objectContaining({report: ADMINS_ROOM_REPORT, notifyReportID: ADMINS_ROOM_REPORT_ID, isInSidePanel: true, conciergeReportID: CONCIERGE_REPORT_ID}),
            );
        });
    });
});
