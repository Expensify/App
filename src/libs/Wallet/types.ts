/** Transient authorization for one native wallet provisioning attempt. */
import type {SignedChallenge} from '@libs/MultifactorAuthentication/shared/challengeTypes';
import type {AuthTypeInfo} from '@libs/MultifactorAuthentication/shared/types';

type WalletAuthentication = {
    signedChallenge: SignedChallenge;
    authenticationMethod: AuthTypeInfo['marqetaValue'];
};

type AddCardToWalletOptions = {
    authentication?: WalletAuthentication;
    signal?: AbortSignal;
};

export type {AddCardToWalletOptions, WalletAuthentication};
