import type {SnapshotFrom} from 'xstate';
import CONST from '@src/CONST';
import type MFAMachine from './mfaMachine';
import type {MfaContext, MfaModalState} from './types';

const MFA_STATE = CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE;

type MfaSnapshot = SnapshotFrom<typeof MFAMachine>;

/** The machine-derived state consumers read: the wired context subset plus the modal lifecycle state. */
type MfaState = MfaContext & {modalState: MfaModalState};

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
 *
 * Transitional: this wrapper lets existing consumers keep reading `state.X` while the machine is built
 * out. Once the chart is complete, consumers will read the machine directly via `useSelector` from
 * `@xstate/react` (a dedicated later PR), which retires this function and the `MfaState` bridge shape.
 */
function snapshotToState(snapshot: MfaSnapshot): MfaState {
    return {...snapshot.context, modalState: getModalState(snapshot)};
}

export default snapshotToState;
export type {MfaState};
