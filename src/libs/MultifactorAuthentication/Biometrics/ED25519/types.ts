import type {Bytes} from '@noble/ed25519';

type Hex = string;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Base64URL<T> = string;

type ChallengeFlag = number;

type ChallengeJSON = {
    challenge: Base64URL<string>;
};

type BinaryData = {
    RPID: Bytes[];
    FLAGS: Bytes[];
    SIGN_COUNT: Bytes[];
};

type SignedChallenge = {
    rawId: Base64URL<string>;
    type: string;
    response: {
        authenticatorData: Base64URL<BinaryData>;
        clientDataJSON: Base64URL<ChallengeJSON>;
        signature: Base64URL<Hex>;
    };
};

type MultifactorAuthenticationChallengeObject = {
    challenge: string;

    rpId: string;

    allowCredentials: Array<{
        type: string;
        id: string;
    }>;

    userVerification: string;

    timeout: number;
};

export type {MultifactorAuthenticationChallengeObject, Hex, Base64URL, ChallengeJSON, ChallengeFlag, BinaryData, SignedChallenge};
