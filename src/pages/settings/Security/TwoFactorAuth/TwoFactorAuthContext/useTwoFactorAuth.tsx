import {useContext} from 'react';
import TwoFactorAuthContext from './index';

export default function useTwoFactorAuthContext() {
    return useContext(TwoFactorAuthContext);
}
