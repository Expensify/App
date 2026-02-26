import {deepEqual} from 'fast-equals';
import type {MutableRefObject} from 'react';
import {useEffect} from 'react';
import Permissions from '@libs/Permissions';
import {extractLinksFromMessageHtml} from '@libs/ReportActionsUtils';
import {expandURLPreview} from '@userActions/Report';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

function useActionLinkPreview(action: OnyxTypes.ReportAction, reportID: string | undefined, downloadedPreviews: MutableRefObject<string[]>) {
    useEffect(() => {
        if (!Permissions.canUseLinkPreviews()) {
            return;
        }

        const urls = extractLinksFromMessageHtml(action);
        if (deepEqual(downloadedPreviews.current, urls) || action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            return;
        }

        // eslint-disable-next-line no-param-reassign
        downloadedPreviews.current = urls;
        expandURLPreview(reportID, action.reportActionID);
    }, [action, reportID, downloadedPreviews]);
}

export default useActionLinkPreview;
