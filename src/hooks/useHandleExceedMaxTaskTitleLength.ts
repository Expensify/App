import debounce from 'lodash/debounce';
import {useCallback, useMemo, useState} from 'react';
import CONST from '@src/CONST';

const useHandleExceedMaxTaskTitleLength = () => {
    const [hasExceededMaxTitleLength, setHasExceededMaxTitleLength] = useState(false);

    const handleValueChange = useCallback((value: string) => {
        const match = value.match(CONST.REGEX.TASK_TITLE_WITH_OPTONAL_SHORT_MENTION);
        if (match) {
            const title = match[3] ? match[3].trim().replace(/\n/g, ' ') : undefined;
            const exceeded = title ? title.length > CONST.TITLE_CHARACTER_LIMIT : false;
            setHasExceededMaxTitleLength(exceeded);
            return true;
        }
        setHasExceededMaxTitleLength(false);
        return false;
    }, [hasExceededMaxTitleLength]);

    const validateTitleMaxLength = useMemo(() => debounce(handleValueChange, CONST.TIMING.COMMENT_LENGTH_DEBOUNCE_TIME, {leading: true}), [handleValueChange]);

    return {hasExceededMaxTitleLength, validateTitleMaxLength};
};

export default useHandleExceedMaxTaskTitleLength;
