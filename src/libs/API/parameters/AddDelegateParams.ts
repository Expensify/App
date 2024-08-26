import type {DelegateRole} from '@src/types/onyx/Account';

type AddDelegateParams = {
    emailAddress: string;
    role: DelegateRole;
};

export default AddDelegateParams;
