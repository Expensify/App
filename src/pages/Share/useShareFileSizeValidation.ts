import {useEffect} from 'react';
import type {Dispatch, SetStateAction} from 'react';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';
import getFileSize from './getFileSize';

type SetState = Dispatch<SetStateAction<string | undefined>>;

/** Validate the shared file against API min/max size limits. Pass `enabled: false` to skip (e.g., when an earlier error already took precedence). */
function useShareFileSizeValidation(content: string | undefined, setErrorTitle: SetState, setErrorMessage: SetState, enabled = true) {
    const {translate} = useLocalize();

    useEffect(() => {
        if (!content || !enabled) {
            return;
        }
        let ignore = false;
        getFileSize(content).then((size) => {
            if (ignore) {
                return;
            }
            if (size > CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
                setErrorTitle(translate('attachmentPicker.attachmentTooLarge'));
                setErrorMessage(translate('attachmentPicker.sizeExceeded'));
            }

            if (size < CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
                setErrorTitle(translate('attachmentPicker.attachmentTooSmall'));
                setErrorMessage(translate('attachmentPicker.sizeNotMet'));
            }
        });
        return () => {
            ignore = true;
        };
    }, [content, enabled, setErrorTitle, setErrorMessage, translate]);
}

export default useShareFileSizeValidation;
