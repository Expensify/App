import useLocalize from '@hooks/useLocalize';

import {getErrorMessage} from '@libs/ErrorUtils';
import Log from '@libs/Log';

import type {Dispatch, SetStateAction} from 'react';

import {useEffect} from 'react';

import getFileSize from './getFileSize';
import getShareFileSizeError from './getShareFileSizeError';

type SetState = Dispatch<SetStateAction<string | undefined>>;

/** Validate the shared file against API min/max size limits. Pass `enabled: false` to skip (e.g., when an earlier error already took precedence). */
function useShareFileSizeValidation(content: string | undefined, setErrorTitle: SetState, setErrorMessage: SetState, enabled = true) {
    const {translate} = useLocalize();

    useEffect(() => {
        if (!content || !enabled) {
            return;
        }
        let ignore = false;
        getFileSize(content)
            .then((size) => {
                if (ignore) {
                    return;
                }
                const sizeError = getShareFileSizeError(size, translate);
                if (!sizeError) {
                    return;
                }
                setErrorTitle(sizeError.title);
                setErrorMessage(sizeError.message);
            })
            .catch((error: unknown) => {
                Log.warn('[useShareFileSizeValidation] Failed to get the shared file size', {error: getErrorMessage(error)});
            });
        return () => {
            ignore = true;
        };
    }, [content, enabled, setErrorTitle, setErrorMessage, translate]);
}

export default useShareFileSizeValidation;
