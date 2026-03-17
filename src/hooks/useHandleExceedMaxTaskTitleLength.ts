import {useCallback, useState} from 'react';
import CONST from '@src/CONST';

const useHandleExceedMaxTaskTitleLength = () => {
    const [hasExceededMaxTaskTitleLength, setHasExceededMaxTitleLength] = useState(false);

    const validateTaskTitleMaxLength = useCallback((title: string) => {
        const exceeded = title ? title.length > CONST.TITLE_CHARACTER_LIMIT : false;
        setHasExceededMaxTitleLength(exceeded);
        return !exceeded;
    }, []);

    return {hasExceededMaxTaskTitleLength, validateTaskTitleMaxLength, setHasExceededMaxTitleLength};
};

export default useHandleExceedMaxTaskTitleLength;
