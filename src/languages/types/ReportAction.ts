import type {ReportActionCore} from '@src/types/onyx/ReportActionCore';

type ReportAction = ReportActionCore;

/** Equivalent to OnyxEntry<T> | OnyxInputValue<T> without the Onyx runtime dependency. */
type OnyxInputOrEntry<TOnyxValue> = TOnyxValue | null | undefined;

export type {OnyxInputOrEntry, ReportAction};
