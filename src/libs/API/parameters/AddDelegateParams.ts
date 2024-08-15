import type {DelegateRole} from '@src/types/onyx/Account';

type AddDelegateParams = {
    email: string;
    role: DelegateRole;
};

export default AddDelegateParams;
