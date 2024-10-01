import type {ReportExportType} from '@components/ButtonWithDropdownMenu/types';

/** Record of last export methods, indexed by policy id */
type LastExportMethod = Record<string, ReportExportType>;

export default LastExportMethod;
