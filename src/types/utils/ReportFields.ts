import type Report from '@src/types/onyx/Report';

/**
 * Fields picked from `Report` with the keys made required while the values stay optional.
 * Use it for projections of a report that only carry the fields a code path reads: an object that is missing a key is a
 * type error, so adding a field read to that code path forces every producer of the projection to supply it.
 */
type ReportFields<K extends keyof Report> = {[P in K]-?: Report[P] | undefined};

export default ReportFields;
