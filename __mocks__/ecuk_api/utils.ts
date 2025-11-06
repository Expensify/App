import * as ed from '@noble/ed25519';
import {sha256, sha512} from '@noble/hashes/sha2';
import {utf8ToBytes} from '@noble/hashes/utils';
import {Buffer} from 'buffer';
import 'react-native-get-random-values';
import {__doNotUseCreateBinaryData} from '@libs/MultifactorAuthentication/Biometrics/ED25519';
import type {MFAChallenge, SignedChallenge} from '@libs/MultifactorAuthentication/Biometrics/ED25519.types';
import Logger from './Logger';

ed.hashes.sha512 = sha512;
ed.hashes.sha512Async = (m: Uint8Array) => Promise.resolve(sha512(m));

type Challenge = {
    nonce: string;
    expires: number;
};

const FALLBACK_EMAIL = 'user@example.com';
const PHONE_NUMBER = '+48512332053';
const MOCKED_AUTHENTICATOR_CODE = 777799;
const FALLBACK_ACCOUNT_ID = 18023156;

const STORAGE: {
    publicKeys: Record<string, string[]>;
    validateCodes: Record<string, number[]>;
    OTPs: Record<string, number[]>;
    challenges: Record<string, MFAChallenge>;
} = {
    publicKeys: {},
    validateCodes: {},
    OTPs: {},
    challenges: {},
};

function generateSixDigitNumber() {
    return Math.floor(Math.random() * 900000) + 100000;
}

function base64URLToBase64(base64URLString: string) {
    let base64String = base64URLString.replace(/-/g, '+').replace(/_/g, '/');
    while (base64String.length % 4) {
        base64String += '=';
    }
    return base64String;
}

function base64URLToUint8Array(base64URL: string) {
    const base64 = base64URLToBase64(base64URL);
    const hex = Buffer.from(base64, 'base64').toString('utf-8');
    return ed.etc.hexToBytes(hex);
}

const getOriginalChallengeJWT = (signedChallenge: SignedChallenge, key: string) => {
    const challenges = Object.values(STORAGE.challenges);

    const binaryData = __doNotUseCreateBinaryData('expensify.com');
    const signature = base64URLToUint8Array(signedChallenge.response.signature);

    const challengeJWT = challenges.find((challenge) => {
        Logger.m('Verifying signature', signedChallenge.response.signature, 'for nonce', challenge.challenge, 'with key', key);

        const message = ed.etc.concatBytes(binaryData, sha256(utf8ToBytes(JSON.stringify(challenge))));
        const keyInBytes = ed.etc.hexToBytes(key);

        let verifyResult;
        try {
            verifyResult = ed.verify(signature, message, keyInBytes);
        } catch (e) {
            Logger.e(e);
        }
        Logger.m('Verification for signature', signature, 'result:', verifyResult ? 'success' : 'failed');
        return verifyResult;
    });
    if (!challengeJWT) {
        return null;
    }

    return challengeJWT;
};

const isChallengeValid = function (signedChallenge: SignedChallenge, publicKey: string) {
    try {
        const challengeJWT = getOriginalChallengeJWT(signedChallenge, publicKey);

        if (!challengeJWT) {
            return false;
        }

        const challengeString = challengeJWT.challenge;

        const {challenge, timeout} = STORAGE.challenges[challengeString] ?? {};

        if (!challenge || !timeout) {
            return false;
        }

        delete STORAGE.challenges[challengeString];

        Logger.m(`Challenge ${challengeString} success, removed from storage`);

        return true;
    } catch (e) {
        return false;
    }
};

export {isChallengeValid, generateSixDigitNumber, STORAGE, FALLBACK_EMAIL, PHONE_NUMBER, Logger, ed, MOCKED_AUTHENTICATOR_CODE, FALLBACK_ACCOUNT_ID};

export type {Challenge};
