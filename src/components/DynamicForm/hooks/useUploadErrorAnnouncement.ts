import FormContext from '@components/Form/FormContext';

import useAccessibilityAnnouncement from '@hooks/useAccessibilityAnnouncement';

import {useContext} from 'react';

/** The error an upload field shows: the upload error, else the validation error. UploadFile shows it through a live region, which VoiceOver ignores, so it is announced as it appears and again on each submit. */
function useUploadErrorAnnouncement(uploadError: string, errorText: string): string {
    const shownError = uploadError || errorText;
    const {getErrorAnnouncementKey} = useContext(FormContext);
    useAccessibilityAnnouncement(shownError, !!shownError, {shouldAnnounceOnNative: true, announcementKey: getErrorAnnouncementKey()});
    return shownError;
}

export default useUploadErrorAnnouncement;
