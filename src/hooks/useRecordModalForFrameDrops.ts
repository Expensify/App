import {endModal, startModal} from '@libs/telemetry/frameDrops/frameDropTimeline';

import {useEffect} from 'react';

/** Records the modal on the frame drop timeline while it is visible, so frames drawn while it is shown count as a separate screen (see buildSegments). */
function useRecordModalForFrameDrops(isVisible: boolean, type: string | undefined) {
    useEffect(() => {
        if (!isVisible) {
            return;
        }
        const frameDropModalID = startModal(type);
        return () => endModal(frameDropModalID);
    }, [isVisible, type]);
}

export default useRecordModalForFrameDrops;
