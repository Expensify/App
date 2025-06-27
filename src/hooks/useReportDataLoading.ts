import {WRITE_COMMANDS} from '@libs/API/types';
import useCommandsLoading from './useCommandsLoading';

// Commands that should trigger report data loading states
const REPORT_DATA_COMMANDS = new Set([WRITE_COMMANDS.OPEN_APP, WRITE_COMMANDS.RECONNECT_APP, WRITE_COMMANDS.OPEN_REPORT]);

/**
 * Hook that determines if report data is currently being loaded
 *
 * Monitors persisted requests queue for OpenApp, ReconnectApp, and OpenReport commands
 * that trigger report data fetching from the server. This hook ignores offline state
 * and is primarily used for full-screen loading indicators.
 *
 * @returns boolean indicating if report data is currently loading
 */
export default function useReportDataLoading(): boolean {
    return useCommandsLoading(REPORT_DATA_COMMANDS);
}
