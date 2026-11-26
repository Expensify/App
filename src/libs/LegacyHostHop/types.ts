import type {Session} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

/** Whether this page should move to the shared host. It reads only the URL, cookies and sessionStorage, so it can run while rendering. */
type ShouldHopToSharedHost = () => boolean;

/** Moves this page to the shared host. Resolves to true once the page is leaving, or to false when it stays and startup should continue. */
type HopToSharedHost = (session: OnyxEntry<Session>) => Promise<boolean>;

export type {HopToSharedHost, ShouldHopToSharedHost};
