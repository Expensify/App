import type {SnapshotFrom} from 'xstate';
import type {MultifactorAuthenticationState} from '@components/MultifactorAuthentication/Context/state';
import type mfaMachine from './mfaMachine';
import type {MfaModalPhase} from './types';

type MfaSnapshot = SnapshotFrom<typeof mfaMachine>;

/** The machine-derived state consumers read: the legacy shape plus the modal lifecycle phase. */
type MfaState = MultifactorAuthenticationState & {modalPhase: MfaModalPhase};

function getModalPhase(snapshot: MfaSnapshot): MfaModalPhase {
    if (snapshot.matches('open')) {
        return 'open';
    }
    return snapshot.matches('closing') ? 'closing' : 'closed';
}

/**
 * Maps the machine snapshot to the state shape consumers read. The modal lifecycle is derived from
 * the chart, not stored: `modalPhase` mirrors the top-level state and drives the navigator's mount,
 * teardown animation, and unmount; `isModalOpen` is the legacy boolean view of it.
 */
function snapshotToState(snapshot: MfaSnapshot): MfaState {
    const modalPhase = getModalPhase(snapshot);
    return {...snapshot.context, modalPhase, isModalOpen: modalPhase === 'open'};
}

export default snapshotToState;
export type {MfaState};
