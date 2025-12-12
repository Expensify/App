import {Buffer} from 'buffer';
import 'react-native-get-random-values';
import {concatBytes, createBinaryData, hexToBytes, sha256, utf8ToBytes, verify} from '@libs/MultifactorAuthentication/Biometrics/ED25519';
import type {SignedChallenge} from '@libs/MultifactorAuthentication/Biometrics/ED25519/types';
import {READ_COMMANDS, STORAGE} from './config';
import Logger from './Logger';
import type {Base64URL, ReadCommandType, WriteCommandType} from './types';

const isReadCommandType = (route: ReadCommandType | WriteCommandType): route is ReadCommandType => route === READ_COMMANDS.REQUEST_BIOMETRIC_CHALLENGE;

function generateSixDigitNumber() {
    return Math.floor(Math.random() * 900000) + 100000;
}

/** RN polyfill for base64url encoding */
const base64URL = <T>(value: string): Base64URL<T> => {
    return Buffer.from(value).toString('base64').replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
};

const base64URLToString = <T>(value: Base64URL<T>): string => {
    const base64String = base64URLToBase64(value);
    return Buffer.from(base64String, 'base64').toString();
};

function base64URLToBase64(base64URLString: string) {
    let base64String = base64URLString.replaceAll('-', '+').replaceAll('_', '/');
    while (base64String.length % 4) {
        base64String += '=';
    }
    return base64String;
}

function base64URLToUint8Array(base64URLValue: string) {
    const base64 = base64URLToBase64(base64URLValue);
    const hex = Buffer.from(base64, 'base64').toString('utf-8');
    return hexToBytes(hex);
}

const getOriginalChallengeJWT = (signedChallenge: SignedChallenge, key: string) => {
    const challenges = Object.values(STORAGE.challenges);

    const binaryData = createBinaryData('expensify.com');
    const signature = base64URLToUint8Array(signedChallenge.response.signature);

    const challengeJWT = challenges.find((challenge) => {
        Logger.m('Verifying signature', signedChallenge.response.signature, 'for nonce', challenge.challenge, 'with key', key);

        const message = concatBytes(binaryData, sha256(utf8ToBytes(JSON.stringify(challenge))));
        const keyInBytes = hexToBytes(key);

        let verifyResult;
        try {
            verifyResult = verify(signature, message, keyInBytes);
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

export {isChallengeValid, generateSixDigitNumber, isReadCommandType, base64URL, base64URLToString};
