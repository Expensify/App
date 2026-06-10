import type {SnapshotFrom} from 'xstate';
import type {MultifactorAuthenticationState} from '@components/MultifactorAuthentication/Context/state';
import type {mfaMachine} from './mfaMachine';

type MfaSnapshot = SnapshotFrom<typeof mfaMachine>;

/**
 * Maps the machine snapshot to the legacy state shape consumers read. `isModalOpen` is derived from
 * the chart, not stored: any `open` child state means the overlay is up; it goes false on entering
 * `closing`, which is what starts the navigator's close animation.
 */
function snapshotToState(snapshot: MfaSnapshot): MultifactorAuthenticationState {
    return {...snapshot.context, isModalOpen: snapshot.matches('open')};
}

export default snapshotToState;
export type {MfaSnapshot};
