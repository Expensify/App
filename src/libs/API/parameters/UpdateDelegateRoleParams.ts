import type {DelegateRole} from '@src/types/onyx/Account';

type UpdateDelegateRoleParams = {
    delegateEmail: string;
    role: DelegateRole;
    validateCode: string;
};

export default UpdateDelegateRoleParams;
