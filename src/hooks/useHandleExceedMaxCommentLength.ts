import _ from 'lodash';
import {useCallback, useMemo, useState} from 'react';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';

const useHandleExceedMaxCommentLength = () => {
    const [hasExceededMaxCommentLength, setHasExceededMaxCommentLength] = useState(false);

    const handleValueChange = useCallback(
        (value: string) => {
            if (ReportUtils.getCommentLength(value) <= CONST.MAX_COMMENT_LENGTH) {
                if (hasExceededMaxCommentLength) {
                    setHasExceededMaxCommentLength(false);
                }
                return;
            }
            setHasExceededMaxCommentLength(true);
        },
        [hasExceededMaxCommentLength],
    );

    const validateCommentMaxLength = useMemo(() => _.debounce(handleValueChange, 1500), [handleValueChange]);

    return {hasExceededMaxCommentLength, validateCommentMaxLength};
};

export default useHandleExceedMaxCommentLength;
