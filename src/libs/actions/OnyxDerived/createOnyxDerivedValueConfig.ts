import type {NonEmptyTuple, ValueOf} from 'type-fest';
import type {OnyxKey} from '@src/ONYXKEYS';
import type ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxDerivedValueConfig} from './types';

/**
 * Helper function to create a derived value config. This function is just here to help TypeScript infer Deps, so instead of writing this:
 *
 * const conciergeChatReportIDConfig: OnyxDerivedValueConfig<[typeof ONYXKEYS.COLLECTION.REPORT, typeof ONYXKEYS.CONCIERGE_REPORT_ID]> = {
 *     dependencies: [ONYXKEYS.COLLECTION.REPORT, ONYXKEYS.CONCIERGE_REPORT_ID],
 *     ...
 * };
 *
 * We can just write this:
 *
 * const conciergeChatReportIDConfig = createOnyxDerivedValueConfig({
 *     dependencies: [ONYXKEYS.COLLECTION.REPORT, ONYXKEYS.CONCIERGE_REPORT_ID]
 * })
 */
export default function createOnyxDerivedValueConfig<Key extends ValueOf<typeof ONYXKEYS.DERIVED>, Deps extends NonEmptyTuple<Exclude<OnyxKey, Key>>>(
    config: OnyxDerivedValueConfig<Key, Deps>,
): OnyxDerivedValueConfig<Key, Deps> {
    return config;
}
