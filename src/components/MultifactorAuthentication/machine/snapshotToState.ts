import type {SnapshotFrom} from 'xstate';
import type {MultifactorAuthenticationState} from '@components/MultifactorAuthentication/Context/state';
import CONST from '@src/CONST';
import type MFAMachine from './mfaMachine';
import type {MfaModalState} from './types';

const MFA_STATE = CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE;

type MfaSnapshot = SnapshotFrom<typeof MFAMachine>;

/** The machine-derived state consumers read: the legacy shape plus the modal lifecycle state. */
type MfaState = MultifactorAuthenticationState & {modalState: MfaModalState};

function getModalState(snapshot: MfaSnapshot): MfaModalState {
    if (snapshot.matches(MFA_STATE.OPEN)) {
        return MFA_STATE.OPEN;
    }
    return snapshot.matches(MFA_STATE.CLOSING) ? MFA_STATE.CLOSING : MFA_STATE.CLOSED;
}

/**
 * Maps the machine snapshot to the state shape consumers read. The modal lifecycle is derived from
 * the chart, not stored: `modalState` mirrors the top-level state and drives the navigator's mount,
 * teardown animation, and unmount.
 */
function snapshotToState(snapshot: MfaSnapshot): MfaState {
    return {...snapshot.context, modalState: getModalState(snapshot)};
}

export default snapshotToState;
export type {MfaState};
