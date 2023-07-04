import {useContext} from 'react';
import {NetworkContext} from '../components/OnyxProvider';

export default function useNetwork() {
    return useContext(NetworkContext);
}