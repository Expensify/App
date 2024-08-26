import type {DelegateRole} from '@src/types/onyx/Account';

type AddDelegateParams = {
    delegate: string;
    role: DelegateRole;
};

export default AddDelegateParams;
