import {useMemo} from 'react';
import * as ReportUtils from '@libs/ReportUtils';
import useActiveWorkspace from './useActiveWorkspace';
import usePermissions from './usePermissions';

/**
 * Get the last accessed reportID.
 */
export default function useLastAccessedReportID(shouldOpenOnAdminRoom: boolean): string | undefined {
    const {canUseDefaultRooms} = usePermissions();
    const {activeWorkspaceID} = useActiveWorkspace();

    return useMemo(
        () => ReportUtils.findLastAccessedReport(!canUseDefaultRooms, shouldOpenOnAdminRoom, activeWorkspaceID)?.reportID,
        [activeWorkspaceID, canUseDefaultRooms, shouldOpenOnAdminRoom],
    );
}
