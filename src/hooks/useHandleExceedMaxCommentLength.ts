import {useCallback, useState} from 'react';
import * as ReportUtils from '@libs/ReportUtils';
import type {ParsingDetails} from '@libs/ReportUtils';
import CONST from '@src/CONST';

const useHandleExceedMaxCommentLength = () => {
    const [hasExceededMaxCommentLength, setHasExceededMaxCommentLength] = useState(false);

    const validateCommentMaxLength = useCallback(
        (value: string, parsingDetails?: ParsingDetails) => {
            if (ReportUtils.getCommentLength(value, parsingDetails) <= CONST.MAX_COMMENT_LENGTH) {
                if (hasExceededMaxCommentLength) {
                    setHasExceededMaxCommentLength(false);
                }
                return;
            }
            setHasExceededMaxCommentLength(true);
        },
        [hasExceededMaxCommentLength],
    );

    return {hasExceededMaxCommentLength, validateCommentMaxLength, setHasExceededMaxCommentLength};
};

export default useHandleExceedMaxCommentLength;
