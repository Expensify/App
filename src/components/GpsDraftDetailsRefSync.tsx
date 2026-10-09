import useOnyx from '@hooks/useOnyx';

import ONYXKEYS from '@src/ONYXKEYS';
import type GpsDraftDetails from '@src/types/onyx/GpsDraftDetails';

import type {RefObject} from 'react';

import {useEffect} from 'react';

type GpsDraftDetailsRefSyncProps = {
    gpsDraftDetailsRef: RefObject<GpsDraftDetails | undefined>;
};

/**
 * Keeps the latest GPS draft details in a ref without re-rendering the parent.
 * Mount only while copilot leave + active GPS trip (e.g. require-2FA overlay).
 */
function GpsDraftDetailsRefSync({gpsDraftDetailsRef}: GpsDraftDetailsRefSyncProps) {
    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS);

    useEffect(() => {
        // eslint-disable-next-line no-param-reassign -- ref sync intentionally mutates .current for the parent overlay
        gpsDraftDetailsRef.current = gpsDraftDetails;
    }, [gpsDraftDetails, gpsDraftDetailsRef]);

    return null;
}

export default GpsDraftDetailsRefSync;
