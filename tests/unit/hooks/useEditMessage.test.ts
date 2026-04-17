import {act, renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import {editReportComment} from '@libs/actions/Report';
import {showDeleteModal} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import useEditMessage from '@pages/inbox/report/ReportActionCompose/useEditMessage';
import ONYXKEYS from '@src/ONYXKEYS';
import * as LHNTestUtils from '../../utils/LHNTestUtils';

jest.mock('@libs/actions/Report', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/actions/Report');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        editReportComment: jest.fn(),
        clearReportActionDrafts: jest.fn(),
    };
});

jest.mock('@pages/inbox/report/ReportActionEditMessageContext', () => ({
    useReportActionActiveEditActions: () => ({
        submitEdit: jest.fn(),
        stopEditing: jest.fn(),
    }),
}));

jest.mock('@pages/inbox/report/ContextMenu/ReportActionContextMenu', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@pages/inbox/report/ContextMenu/ReportActionContextMenu');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        showDeleteModal: jest.fn(),
        isActiveReportAction: jest.fn(() => false),
    };
});

jest.mock('@hooks/useAncestors', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => [],
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => ({email: 'user@test.com'}),
}));

jest.mock('@hooks/useReportIsArchived', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => false,
}));

jest.mock('@hooks/useReportScrollManager', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => ({scrollToIndex: jest.fn()}),
}));

jest.mock('@libs/ReportUtils', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/ReportUtils');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        getOriginalReportID: () => undefined,
    };
});

const mockEditReportComment = jest.mocked(editReportComment);
const mockShowDeleteModal = jest.mocked(showDeleteModal);

type HookProps = Parameters<typeof useEditMessage>[0];

type DebouncedValidator = HookProps['debouncedCommentMaxLengthValidation'];

function makeDebouncedValidator({flushResult}: {flushResult: boolean}): DebouncedValidator {
    return {
        flush: jest.fn(() => flushResult),
        cancel: jest.fn(),
    } as unknown as DebouncedValidator;
}

describe('useEditMessage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    function renderUseEditMessage(overrides?: Partial<HookProps>) {
        const report = LHNTestUtils.getFakeReport();
        const reportAction = LHNTestUtils.getFakeReportAction();

        const props: HookProps = {
            reportID: report.reportID,
            originalReportID: report.reportID,
            reportAction,
            debouncedCommentMaxLengthValidation: makeDebouncedValidator({flushResult: true}),
            composerRef: {current: {blur: jest.fn()} as never},
            ...overrides,
        };
        const hook = renderHook(() => useEditMessage(props));
        return {hook, props};
    }

    it('should not publish when validation flush fails', async () => {
        const {hook} = renderUseEditMessage({
            debouncedCommentMaxLengthValidation: makeDebouncedValidator({flushResult: false}),
        });

        act(() => {
            hook.result.current.publishDraft('Hello');
        });

        expect(mockEditReportComment).toHaveBeenCalledTimes(0);
        expect(mockShowDeleteModal).toHaveBeenCalledTimes(0);
    });

    it('should open delete modal when publishing an empty (trimmed) message', async () => {
        const {hook, props} = renderUseEditMessage();

        act(() => {
            hook.result.current.publishDraft('   ');
        });

        expect(mockEditReportComment).toHaveBeenCalledTimes(0);
        expect(mockShowDeleteModal).toHaveBeenCalledTimes(1);

        const args = mockShowDeleteModal.mock.calls.at(0);
        expect(args?.[1]?.reportActionID).toBe(props.reportAction?.reportActionID);
    });
});
