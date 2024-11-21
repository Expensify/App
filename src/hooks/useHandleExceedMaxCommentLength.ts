import debounce from 'lodash/debounce';
import {useCallback, useMemo, useState} from 'react';
import * as ReportUtils from '@libs/ReportUtils';
import type {ParsingDetails} from '@libs/ReportUtils';
import CONST from '@src/CONST';

const useHandleExceedMaxCommentLength = (enableTaskTitleValidation : boolean = false) => {
    const [hasExceededMaxCommentLength, setHasExceededMaxCommentLength] = useState(false);
    const [isTaskTitle, setIsTaskTitle] = useState(false);
    const [maxCommentLength, setMaxCommentLength] = useState(isTaskTitle ? CONST.TITLE_CHARACTER_LIMIT : CONST.MAX_COMMENT_LENGTH);

    const handleValueChange = useCallback(
        (value: string, parsingDetails?: ParsingDetails) => {
            if (enableTaskTitleValidation) {
                const match = value.match(CONST.REGEX.TASK_TITLE_WITH_OPTONAL_SHORT_MENTION);
                if (match) {
                    const title = match[3] ? match[3].trim().replace(/\n/g, ' ') : undefined;
                    setHasExceededMaxCommentLength(title ? title.length > CONST.TITLE_CHARACTER_LIMIT : false);
                    setMaxCommentLength(CONST.TITLE_CHARACTER_LIMIT);
                    setIsTaskTitle(true);
                    return;
                }
            }
            
            if (ReportUtils.getCommentLength(value, parsingDetails) <= CONST.MAX_COMMENT_LENGTH) {
                if (hasExceededMaxCommentLength) {
                    setHasExceededMaxCommentLength(false);
                }
                setMaxCommentLength(CONST.MAX_COMMENT_LENGTH);
                setIsTaskTitle(false);
                return;
            }
            setHasExceededMaxCommentLength(true);
            setMaxCommentLength(CONST.MAX_COMMENT_LENGTH);
            setIsTaskTitle(false);
        },
        [hasExceededMaxCommentLength, enableTaskTitleValidation],
    );

    // Use a shorter debounce time for task title validation to provide quicker feedback due to simpler logic
    const validateCommentMaxLength = useMemo(() => debounce(handleValueChange, isTaskTitle ? 100 : 1500, { leading: true }), [handleValueChange]);

    return {hasExceededMaxCommentLength, validateCommentMaxLength, maxCommentLength};
};

export default useHandleExceedMaxCommentLength;