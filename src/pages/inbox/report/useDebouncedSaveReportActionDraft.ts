import useNetwork from '@hooks/useNetwork';

import {saveReportActionDraft} from '@libs/actions/Report';

import type {ReportAction, ReportActions} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {useCallback, useEffect, useRef} from 'react';

import useDebouncedSaveDraft from './useDebouncedSaveDraft';

/**
 * Debounced `saveReportActionDraft`.
 *
 * The write lands up to `CONST.TIMING.DRAFT_SAVE_DEBOUNCE_TIME` after the keystroke that scheduled it, so the
 * offline state is read from a ref when the draft is actually saved. Passing `isOffline` through the debounced
 * call would persist whatever the value was when the save was scheduled, which is wrong once the connection
 * flips during the wait. The wrapper also has to keep a stable identity, because `useDebounce` drops the
 * pending invocation whenever the debounced function changes.
 */
function useDebouncedSaveReportActionDraft() {
    const {isOffline} = useNetwork();
    const isOfflineRef = useRef(isOffline);

    useEffect(() => {
        isOfflineRef.current = isOffline;
    }, [isOffline]);

    const saveDraftWithLatestOfflineState = useCallback((reportID: string | undefined, reportAction: ReportAction | null, reportActions: OnyxEntry<ReportActions>, draftMessage: string) => {
        saveReportActionDraft(reportID, reportAction, reportActions, draftMessage, isOfflineRef.current);
    }, []);

    return useDebouncedSaveDraft(saveDraftWithLatestOfflineState);
}

export default useDebouncedSaveReportActionDraft;
