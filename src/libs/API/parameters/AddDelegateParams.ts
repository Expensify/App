import type {DelegateRole} from '@src/types/onyx/Account';

type AddDelegateParams = {
    delegate: string;
    role: DelegateRole;
    validateCode: string;
};

export default AddDelegateParams;
