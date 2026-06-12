import {useState} from 'react';

type WalletDataState = 'idle' | 'loading' | 'fresh';

function computeNextState(current: WalletDataState, isOffline: boolean, isLoading: boolean | undefined): WalletDataState {
    if (isOffline) {
        return current;
    }
    if (current === 'idle' && isLoading) {
        return 'loading';
    }
    if (current === 'loading' && !isLoading) {
        return 'fresh';
    }
    return current;
}

function useHasFreshWalletData(isOffline: boolean, isLoading: boolean | undefined): boolean {
    const [state, setState] = useState<WalletDataState>('idle');
    const next = computeNextState(state, isOffline, isLoading);
    if (next !== state) {
        setState(next);
    }
    return next === 'fresh';
}

export default useHasFreshWalletData;
