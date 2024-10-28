import debounce from 'lodash/debounce';
import {useCallback, useMemo, useState} from 'react';
import * as ReportUtils from '@libs/ReportUtils';
import type {ParsingDetails} from '@libs/ReportUtils';
import CONST from '@src/CONST';

const useHandleExceedMaxCommentLength = () => {
    const [hasExceededMaxCommentLength, setHasExceededMaxCommentLength] = useState(false);

    const handleValueChange = useCallback(
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

    const validateCommentMaxLength = useMemo(() => debounce(handleValueChange, 1500, {leading: true}), [handleValueChange]);

    return {hasExceededMaxCommentLength, validateCommentMaxLength};
};

export default useHandleExceedMaxCommentLength;
