import type Clipboard from '@libs/Clipboard';
import type * as ClipboardTextWebModule from '@libs/Clipboard/getClipboardText/index';
import type {CanSetHtml} from '@libs/Clipboard/types';

import type * as ContextMenuActionsModule from '@pages/inbox/report/ContextMenu/ContextMenuActions';

import CONST from '@src/CONST';
import type {TranslationParameters, TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import {formatPhoneNumber} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('expo-web-browser', () => ({
    openAuthSessionAsync: jest.fn(),
}));

jest.mock('@components/Reactions/MiniQuickEmojiReactions', () => 'MiniQuickEmojiReactions');
jest.mock('@components/Reactions/QuickEmojiReactions', () => 'QuickEmojiReactions');

// Copy message HTML is asserted as the web plain-text flavor. Native Markdown is covered by getClipboardTextTest.
jest.mock('@libs/Clipboard/getClipboardText', () => jest.requireActual<typeof ClipboardTextWebModule>('@libs/Clipboard/getClipboardText/index.ts'));

const mockCanSetHtml = jest.fn<ReturnType<Extract<CanSetHtml, () => boolean>>, Parameters<typeof Clipboard.canSetHtml>>();
const mockSetString = jest.fn<ReturnType<typeof Clipboard.setString>, Parameters<typeof Clipboard.setString>>();
const mockSetHtml = jest.fn<ReturnType<typeof Clipboard.setHtml>, Parameters<typeof Clipboard.setHtml>>();

jest.mock('@libs/Clipboard', () => ({
    __esModule: true,
    default: {
        canSetHtml: mockCanSetHtml,
        setString: mockSetString,
        setHtml: mockSetHtml,
    },
}));

const {default: ContextMenuActions} = jest.requireActual<typeof ContextMenuActionsModule>('@pages/inbox/report/ContextMenu/ContextMenuActions');

const copyMessageAction = ContextMenuActions.find((action) => 'sentryLabel' in action && action.sentryLabel === CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_MESSAGE);
if (!copyMessageAction || !('onPress' in copyMessageAction)) {
    throw new Error('Copy message context menu action was not found');
}
type CopyMessagePayload = Parameters<typeof copyMessageAction.onPress>[1];

const MENTIONED_REPORT_ID = '1';
const REPORT_ID_TO_NAME = {[MENTIONED_REPORT_ID]: '#general'};
const MENTIONED_ACCOUNT_ID = '2';
const ACCOUNT_ID_TO_NAME = {[MENTIONED_ACCOUNT_ID]: 'user2@expensify.com'};

const createPayload = (selection: string): CopyMessagePayload =>
    createMock<CopyMessagePayload>({
        reportAction: {
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            message: [{html: selection}],
        },
        selection,
        reportIDToName: REPORT_ID_TO_NAME,
        accountIDToName: ACCOUNT_ID_TO_NAME,
        report: {},
        originalReport: {},
        getLocalDateFromDatetime: jest.fn(),
        policyTags: {},
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Translation parameters are required by the production callback signature; this stub intentionally returns only the key.
        translate: <TPath extends TranslationPaths>(path: TPath, ...parameters: TranslationParameters<TPath>): string => path,
        formatPhoneNumber,
        currentUserPersonalDetails: {
            accountID: 1,
            login: 'user@expensify.com',
            email: 'user@expensify.com',
        },
    });

const createReportActionPayload = (reportAction: CopyMessagePayload['reportAction']): CopyMessagePayload =>
    createMock<CopyMessagePayload>({
        reportAction,
        selection: '',
        reportIDToName: REPORT_ID_TO_NAME,
        report: {},
        originalReport: {},
        getLocalDateFromDatetime: jest.fn(),
        policyTags: {},
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Translation parameters are required by the production callback signature; this stub intentionally returns only the key.
        translate: <TPath extends TranslationPaths>(path: TPath, ...parameters: TranslationParameters<TPath>): string => path,
        currentUserPersonalDetails: {
            accountID: 1,
            login: 'user@expensify.com',
            email: 'user@expensify.com',
        },
    });

describe('ContextMenuActions copy message', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('uses plain text clipboard path when html clipboard is unavailable', () => {
        const selection = '<a href="https://expensify.com">Expensify</a>';
        mockCanSetHtml.mockReturnValue(false);

        if (!copyMessageAction?.onPress) {
            throw new Error('Copy message context menu action was not found');
        }

        copyMessageAction.onPress(false, createPayload(selection));

        expect(mockSetString).toHaveBeenCalledWith('Expensify');
        expect(mockSetHtml).not.toHaveBeenCalled();
    });

    it('uses html clipboard path when html clipboard is available', () => {
        const selection = '<a href="https://expensify.com">Expensify</a>';
        mockCanSetHtml.mockReturnValue(true);

        if (!copyMessageAction?.onPress) {
            throw new Error('Copy message context menu action was not found');
        }

        copyMessageAction.onPress(false, createPayload(selection));

        expect(mockSetHtml).toHaveBeenCalledWith(selection, 'Expensify');
        expect(mockSetString).not.toHaveBeenCalled();
    });

    it.each([
        [
            CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_AGENT_RULE,
            {ruleTitle: 'Receipts required', prompt: 'Flag any expense over $25 that is missing a receipt'},
            'workspaceActions.agentRule.added',
        ],
        [
            CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AGENT_RULE,
            {ruleTitle: 'Receipts required', prompt: 'Reject any expense that includes alcohol'},
            'workspaceActions.agentRule.updated',
        ],
        [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_AGENT_RULE, {ruleTitle: 'Receipts required'}, 'workspaceActions.agentRule.deleted'],
    ])('copies the localized message for a %s action', (actionName, originalMessage, expectedTranslationKey) => {
        mockCanSetHtml.mockReturnValue(false);

        if (!copyMessageAction?.onPress) {
            throw new Error('Copy message context menu action was not found');
        }

        copyMessageAction.onPress(
            false,
            createReportActionPayload(
                createMock<CopyMessagePayload['reportAction']>({
                    actionName,
                    message: [{html: ''}],
                    originalMessage,
                }),
            ),
        );

        expect(mockSetString).toHaveBeenCalledWith(expectedTranslationKey);
        expect(mockSetHtml).not.toHaveBeenCalled();
    });

    it('copies the localized message for a category update action', () => {
        mockCanSetHtml.mockReturnValue(false);

        if (!copyMessageAction?.onPress) {
            throw new Error('Copy message context menu action was not found');
        }

        copyMessageAction.onPress(
            false,
            createReportActionPayload(
                createMock<CopyMessagePayload['reportAction']>({
                    actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORY,
                    message: [{html: ''}],
                    originalMessage: {categoryName: 'Advertising', updatedField: 'areAttendeesRequired', oldValue: '', newValue: true},
                }),
            ),
        );

        expect(mockSetString).toHaveBeenCalledWith('workspaceActions.updateAreAttendeesRequired');
    });

    it('copies the localized message for an agent prompt update action', () => {
        if (!copyMessageAction?.onPress) {
            throw new Error('Copy message context menu action was not found');
        }

        copyMessageAction.onPress(
            false,
            createReportActionPayload(
                createMock<CopyMessagePayload['reportAction']>({
                    actionName: CONST.REPORT.ACTIONS.TYPE.AGENT_PROMPT_UPDATED,
                    message: [
                        {
                            type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                            style: 'normal',
                            text: "owner@expensify.com updated this agent's instructions.",
                        },
                    ],
                    originalMessage: {
                        previousPrompt: 'Review every expense',
                        newPrompt: 'Review expenses over $100',
                        updatedByAccountID: 1,
                        updatedBy: 'owner@expensify.com',
                    },
                }),
            ),
        );

        expect(mockSetString).toHaveBeenCalledWith('agentPromptUpdated');
    });

    it('copies the report action text when an agent prompt update has no original message', () => {
        const actionText = "owner@expensify.com updated this agent's instructions.";

        copyMessageAction.onPress(
            false,
            createReportActionPayload(
                createMock<CopyMessagePayload['reportAction']>({
                    actionName: CONST.REPORT.ACTIONS.TYPE.AGENT_PROMPT_UPDATED,
                    message: [
                        {
                            type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                            style: 'normal',
                            text: actionText,
                        },
                    ],
                }),
            ),
        );

        expect(mockSetString).toHaveBeenCalledWith(actionText);
    });

    it('copies the localized message for a member work arrangement update action', () => {
        mockCanSetHtml.mockReturnValue(false);

        if (!copyMessageAction?.onPress) {
            throw new Error('Copy message context menu action was not found');
        }

        copyMessageAction.onPress(
            false,
            createReportActionPayload(
                createMock<CopyMessagePayload['reportAction']>({
                    actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MEMBER_WORK_ARRANGEMENT,
                    message: [{text: 'updated work arrangement', html: 'updated work arrangement'}],
                    originalMessage: {name: 'Member One', newValue: true, oldValue: false},
                }),
            ),
        );

        expect(mockSetString).toHaveBeenCalledWith('workspaceActions.updatedMemberWorkArrangement');
        expect(mockSetHtml).not.toHaveBeenCalled();
    });

    it('copies the localized message for a default work arrangement update action', () => {
        // Given a default work arrangement change log, whose stored text is Auth's English message
        mockCanSetHtml.mockReturnValue(false);

        if (!copyMessageAction?.onPress) {
            throw new Error('Copy message context menu action was not found');
        }

        // When its message is copied
        copyMessageAction.onPress(
            false,
            createReportActionPayload(
                createMock<CopyMessagePayload['reportAction']>({
                    actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_POLICY_WORK_ARRANGEMENT,
                    message: [{text: 'stored message', html: 'stored message'}],
                    originalMessage: {newValue: true, oldValue: false},
                }),
            ),
        );

        // Then the translated change log text is copied instead of the stored text
        expect(mockSetString).toHaveBeenCalledWith('workspaceActions.workArrangement.changed');
        expect(mockSetHtml).not.toHaveBeenCalled();
    });

    it.each([
        [
            CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_OFFICE_LOCATION,
            {officeID: 'OFFICE1', name: 'Headquarters', address: {addressStreet: '88 Kearny St', city: 'San Francisco', state: 'CA', zipCode: '94108', country: 'US'}},
            'workspaceActions.officeLocation.added',
        ],
        [
            CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_OFFICE_LOCATION,
            {officeID: 'OFFICE1', name: 'HQ', updatedField: CONST.POLICY.OFFICE_LOCATION_FIELD.NAME, newValue: 'HQ', oldValue: 'Headquarters'},
            'workspaceActions.officeLocation.renamed',
        ],
        [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_OFFICE_LOCATION, {officeID: 'OFFICE1', name: 'Headquarters'}, 'workspaceActions.officeLocation.removed'],
        [
            CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EMPLOYEE_OFFICE_LOCATION,
            {accountID: 1, email: 'member@test.com', name: 'Member One', officeID: 'OFFICE2', officeName: 'New Jersey Office', oldOfficeID: '', oldOfficeName: ''},
            'workspaceActions.officeLocation.changedMemberOfficeLocation',
        ],
    ] as const)('copies the localized message for a %s action', (actionName, originalMessage, translationKey) => {
        // Given an office location change log, whose stored text is Auth's English message
        mockCanSetHtml.mockReturnValue(false);

        if (!copyMessageAction?.onPress) {
            throw new Error('Copy message context menu action was not found');
        }

        // When its message is copied
        copyMessageAction.onPress(
            false,
            createReportActionPayload(
                createMock<CopyMessagePayload['reportAction']>({
                    actionName,
                    message: [{text: 'stored message', html: 'stored message'}],
                    originalMessage,
                }),
            ),
        );

        // Then the translated change log text is copied instead of the stored text
        expect(mockSetString).toHaveBeenCalledWith(translationKey);
        expect(mockSetHtml).not.toHaveBeenCalled();
    });

    it('writes both flavors for an HTML-sourced system message when HTML is supported', () => {
        // Given the clipboard supports HTML and this action is already an HTML source
        mockCanSetHtml.mockReturnValue(true);

        if (!copyMessageAction?.onPress) {
            throw new Error('Copy message context menu action was not found');
        }

        // When the message is copied
        copyMessageAction.onPress(
            false,
            createReportActionPayload(
                createMock<CopyMessagePayload['reportAction']>({
                    actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MEMBER_WORK_ARRANGEMENT,
                    message: [{text: 'updated work arrangement', html: 'updated work arrangement'}],
                    originalMessage: {name: 'Member One', newValue: true, oldValue: false},
                }),
            ),
        );

        // Then both flavors are written, so a rich paste can keep the source and a plain paste still has text
        expect(mockSetHtml).toHaveBeenCalledWith('workspaceActions.updatedMemberWorkArrangement', 'workspaceActions.updatedMemberWorkArrangement');
        expect(mockSetString).not.toHaveBeenCalled();
    });

    it('writes both clipboard flavors for a modified expense that contains HTML', () => {
        // Given a modified-expense message whose visible text is HTML with a link
        const html = '<strong>added a receipt</strong> from <a href="https://expensify.com">Expensify</a>';
        const payload = createReportActionPayload(
            createMock<CopyMessagePayload['reportAction']>({
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                message: {receiptAdded: true},
            }),
        );
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Translation parameters are required by the production callback signature; this stub returns markup for one key.
        const translateReceipt = <TPath extends TranslationPaths>(path: TPath, ...parameters: TranslationParameters<TPath>): string => (String(path) === 'iou.addedReceipt' ? html : path);
        payload.translate = translateReceipt;
        mockCanSetHtml.mockReturnValue(true);

        // When the message is copied
        copyMessageAction.onPress(false, payload);

        // Then a rich paste keeps the link and plain text does not keep Markdown syntax
        expect(mockSetHtml).toHaveBeenCalledWith(html, 'added a receipt from Expensify');
        expect(mockSetString).not.toHaveBeenCalled();
    });

    it('copies a workspace name that contains markup characters literally', () => {
        // Given a renamed workspace whose old name contains characters that look like markup
        const payload = createReportActionPayload(
            createMock<CopyMessagePayload['reportAction']>({
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_NAME,
                message: {oldName: '<Team>', newName: 'Ops & Co'},
            }),
        );
        const translateRenamedWorkspace = <TPath extends TranslationPaths>(path: TPath, ...parameters: TranslationParameters<TPath>): string => {
            if (String(path) !== 'workspaceActions.renamedWorkspaceNameAction') {
                return path;
            }
            const [oldName, newName] = parameters.map((value) => String(value));
            return `renamed ${oldName} to ${newName}`;
        };
        payload.translate = translateRenamedWorkspace;
        mockCanSetHtml.mockReturnValue(true);

        // When the message is copied
        copyMessageAction.onPress(false, payload);

        // Then the name is copied literally, because parsing it as HTML would drop the bracketed word
        expect(mockSetString).toHaveBeenCalledWith('renamed <Team> to Ops & Co');
        expect(mockSetHtml).not.toHaveBeenCalled();
    });

    it('copies a comment the same way a painted selection of that comment is copied', () => {
        // Given the same comment copied from a painted selection and from Copy message
        const html = '<div>first message</div><div><strong>second</strong> <a href="https://expensify.com">Expensify</a></div>';
        const plainText = 'first message\nsecond Expensify';
        mockCanSetHtml.mockReturnValue(true);

        // When both copy paths run
        copyMessageAction.onPress(false, createPayload(html));
        expect(mockSetHtml).toHaveBeenCalledWith(html, plainText);

        mockSetHtml.mockClear();
        copyMessageAction.onPress(
            false,
            createReportActionPayload(
                createMock<CopyMessagePayload['reportAction']>({
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                    message: [{html}],
                }),
            ),
        );

        // Then both paths write the same flavors, so the paste does not depend on which copy path was used
        expect(mockSetHtml).toHaveBeenCalledWith(html, plainText);
        expect(mockSetString).not.toHaveBeenCalled();
    });

    describe('queued payment in a thread', () => {
        beforeAll(() => {
            Onyx.init({keys: ONYXKEYS});
            return waitForBatchedUpdates();
        });

        afterAll(() => Onyx.clear());

        it('copies the message for the parent invoice, like the shown text', async () => {
            // Given a queued payment shown at the top of a thread whose parent is an invoice
            const invoiceReportID = 'queuedInvoice';
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${invoiceReportID}`, {reportID: invoiceReportID, type: CONST.REPORT.TYPE.INVOICE, ownerAccountID: 2});
            await waitForBatchedUpdates();
            const threadReport = createMock<Report>({reportID: 'queuedThread', type: CONST.REPORT.TYPE.CHAT, parentReportID: invoiceReportID, parentReportActionID: '3'});
            const payload = createReportActionPayload(
                createMock<CopyMessagePayload['reportAction']>({
                    actionName: CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_QUEUED,
                    // eslint-disable-next-line @typescript-eslint/no-deprecated -- Auth sends paymentType on originalMessage, which getOriginalMessage reads.
                    originalMessage: {paymentType: CONST.IOU.PAYMENT_TYPE.VBBA},
                }),
            );

            if (!copyMessageAction?.onPress) {
                throw new Error('Copy message context menu action was not found');
            }

            // When its message is copied
            copyMessageAction.onPress(false, {...payload, report: threadReport, formatPhoneNumber});

            // Then it asks the invoice sender for a bank account, because ReimbursementQueuedContent shows the parent invoice's message
            expect(mockSetString).toHaveBeenCalledWith('iou.waitingOnVendorBankAccount');
        });
    });

    it.each([
        [false, 'workspaceActions.setCategoryVisibility'],
        [true, 'workspaceActions.setCategoryVisibility\nworkspaceActions.categoryVisibilityCategoriesList'],
    ])('copies the category visibility message the row shows when isThreadReportParentAction is %s', (isThreadReportParentAction, expectedText) => {
        // Given a category visibility change with too many categories to list inline
        const reportAction = createMock<CopyMessagePayload['reportAction']>({
            actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.SET_CATEGORY_VISIBILITY,
            // eslint-disable-next-line @typescript-eslint/no-deprecated -- the fixture needs the change log data that getOriginalMessage reads to build the message
            originalMessage: {
                categoryNames: Array.from({length: CONST.POLICY.CATEGORY_VISIBILITY.MAX_LISTED_ITEMS}, (_, index) => `Category ${index + 1}`),
                accountIDs: [],
                hadRestriction: false,
                reason: CONST.POLICY.CATEGORY_VISIBILITY.REASON.SET_BY_ADMIN,
            },
        });

        if (!copyMessageAction?.onPress) {
            throw new Error('Copy message context menu action was not found');
        }

        // When the message is copied from #admins or from the top of its thread
        copyMessageAction.onPress(false, {...createReportActionPayload(reportAction), isThreadReportParentAction});

        // Then the copied text matches the row: #admins only counts the categories, while the top of the thread also lists them in full
        expect(mockSetString).toHaveBeenCalledWith(expectedText);
    });
});
