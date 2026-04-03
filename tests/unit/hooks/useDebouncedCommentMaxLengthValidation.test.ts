import {act, renderHook, waitFor} from '@testing-library/react-native';
import {getCommentLength} from '@libs/ReportUtils';
import useDebouncedCommentMaxLengthValidation from '@pages/inbox/report/ReportActionCompose/useDebouncedCommentMaxLengthValidation';
import CONST from '@src/CONST';

jest.mock('@libs/ReportUtils', () => {
    return {
        getCommentLength: jest.fn(),
    };
});

const mockGetCommentLength = jest.mocked(getCommentLength);

describe('useDebouncedCommentMaxLengthValidation', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should apply task-title validation when not editing and input matches task pattern', () => {
        const {result} = renderHook(() => useDebouncedCommentMaxLengthValidation({reportID: '1', isEditing: false}));

        const title = 'x'.repeat(CONST.TITLE_CHARACTER_LIMIT + 1);

        act(() => {
            result.current.debouncedCommentMaxLengthValidation(`[] ${title}`);
        });

        expect(result.current.isTaskTitle).toBe(true);
        expect(result.current.exceededMaxLength).toBe(CONST.TITLE_CHARACTER_LIMIT);
        expect(result.current.isExceedingMaxLength).toBe(true);
        expect(mockGetCommentLength).not.toHaveBeenCalled();
    });

    it('should apply comment-length validation when editing', async () => {
        mockGetCommentLength.mockReturnValue(CONST.MAX_COMMENT_LENGTH + 1);

        const {result} = renderHook(() => useDebouncedCommentMaxLengthValidation({reportID: '1', isEditing: true}));

        act(() => {
            result.current.debouncedCommentMaxLengthValidation('x'.repeat(CONST.MAX_COMMENT_LENGTH + 1));
            result.current.debouncedCommentMaxLengthValidation.flush();
        });

        await waitFor(() => {
            expect(result.current.isTaskTitle).toBe(false);
            expect(result.current.exceededMaxLength).toBe(CONST.MAX_COMMENT_LENGTH);
            expect(result.current.isExceedingMaxLength).toBe(true);
        });
    });
});
