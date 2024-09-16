import type {DelegateRole} from '@src/types/onyx/Account';

type UpdateDelegateRoleParams = {
    delegate: string;
    role: DelegateRole;
    validateCode: string;
};

export default UpdateDelegateRoleParams;
