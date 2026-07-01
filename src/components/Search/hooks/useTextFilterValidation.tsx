import {useEffect} from 'react';
import type {SearchTextFilterKeys} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import {isValidInputLength} from '@libs/ValidationUtils';
import CONST from '@src/CONST';

const FILTER_MAX_LENGTH: Partial<Record<SearchTextFilterKeys, number>> = {
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION]: CONST.DESCRIPTION_LIMIT,
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT]: CONST.MERCHANT_NAME_MAX_BYTES,
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE]: CONST.TASK_TITLE_CHARACTER_LIMIT,
};

function useTextFilterValidation(filterKey: SearchTextFilterKeys, value: string | undefined, onError?: (error: string | undefined) => void) {
    const {translate} = useLocalize();
    const maxLength = FILTER_MAX_LENGTH[filterKey] ?? CONST.MAX_COMMENT_LENGTH;
    const {isValid, byteLength} = isValidInputLength(value?.trim() ?? '', maxLength);
    const error = !isValid ? translate('common.error.characterLimitExceedCounter', byteLength, maxLength) : undefined;

    useEffect(() => {
        onError?.(error);
    }, [error, onError]);

    return error;
}

export default useTextFilterValidation;
