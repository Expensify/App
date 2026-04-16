import {useEffect} from 'react';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';
import getFileSize from './getFileSize';

type SetShareError = (title: string, message: string) => void;

/** Validate the shared file against API min/max size limits. Pass `enabled: false` to skip (e.g., when an earlier error already took precedence). */
function useShareFileSizeValidation(content: string | undefined, setError: SetShareError, enabled = true) {
    const {translate} = useLocalize();

    useEffect(() => {
        if (!content || !enabled) {
            return;
        }
        getFileSize(content).then((size) => {
            if (size > CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
                setError(translate('attachmentPicker.attachmentTooLarge'), translate('attachmentPicker.sizeExceeded'));
            }

            if (size < CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
                setError(translate('attachmentPicker.attachmentTooSmall'), translate('attachmentPicker.sizeNotMet'));
            }
        });
    }, [content, enabled, setError, translate]);
}

export default useShareFileSizeValidation;
