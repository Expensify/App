import type {SnapshotFrom} from 'xstate';
import type {MultifactorAuthenticationState} from '@components/MultifactorAuthentication/Context/state';
import CONST from '@src/CONST';
import type mfaMachine from './mfaMachine';
import type {MfaModalPhase} from './types';

const MFA_STATE = CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE;
const MFA_MODAL_PHASE = CONST.MULTIFACTOR_AUTHENTICATION.MODAL_PHASE;

type MfaSnapshot = SnapshotFrom<typeof mfaMachine>;

/** The machine-derived state consumers read: the legacy shape plus the modal lifecycle phase. */
type MfaState = MultifactorAuthenticationState & {modalPhase: MfaModalPhase};

function getModalPhase(snapshot: MfaSnapshot): MfaModalPhase {
    if (snapshot.matches(MFA_STATE.OPEN)) {
        return MFA_MODAL_PHASE.OPEN;
    }
    return snapshot.matches(MFA_STATE.CLOSING) ? MFA_MODAL_PHASE.CLOSING : MFA_MODAL_PHASE.CLOSED;
}

/**
 * Maps the machine snapshot to the state shape consumers read. The modal lifecycle is derived from
 * the chart, not stored: `modalPhase` mirrors the top-level state and drives the navigator's mount,
 * teardown animation, and unmount.
 */
function snapshotToState(snapshot: MfaSnapshot): MfaState {
    return {...snapshot.context, modalPhase: getModalPhase(snapshot)};
}

export default snapshotToState;
export type {MfaState};
