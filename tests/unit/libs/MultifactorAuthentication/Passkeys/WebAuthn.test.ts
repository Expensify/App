import {extractAAGUID} from '@libs/MultifactorAuthentication/Passkeys/WebAuthn';

describe('MultifactorAuthentication Passkeys WebAuthn', () => {
    describe('extractAAGUID', () => {
        it('should return empty string when authenticatorData is too short', () => {
            // Given authenticatorData shorter than 53 bytes (rpIdHash[32] + flags[1] + signCount[4] + AAGUID[16])
            const shortData = new Uint8Array(37).buffer;

            // When extracting the AAGUID
            const result = extractAAGUID(shortData);

            // Then it should return undefined
            expect(result).toBeUndefined();
        });

        it('should extract all-zeros AAGUID from authenticatorData with zeroed AAGUID bytes', () => {
            // Given authenticatorData with all-zero AAGUID at bytes 37-52
            const authData = new Uint8Array(53);

            // When extracting the AAGUID
            const result = extractAAGUID(authData.buffer);

            // Then it should return the all-zeros UUID
            expect(result).toBe('00000000-0000-0000-0000-000000000000');
        });

        it('should extract Apple Passwords AAGUID correctly', () => {
            // Given authenticatorData with Apple Passwords AAGUID (fbfc3007-154e-4ecc-8c0b-6e020557d7bd) at bytes 37-52
            const authData = new Uint8Array(53);
            const appleAAGUIDBytes = [0xfb, 0xfc, 0x30, 0x07, 0x15, 0x4e, 0x4e, 0xcc, 0x8c, 0x0b, 0x6e, 0x02, 0x05, 0x57, 0xd7, 0xbd];
            authData.set(appleAAGUIDBytes, 37);

            // When extracting the AAGUID
            const result = extractAAGUID(authData.buffer);

            // Then it should return the correctly formatted Apple Passwords UUID
            expect(result).toBe('fbfc3007-154e-4ecc-8c0b-6e020557d7bd');
        });

        it('should extract Google Password Manager AAGUID correctly', () => {
            // Given authenticatorData with Google Password Manager AAGUID (ea9b8d66-4d01-1d21-3ce4-b6b48cb575d4)
            const authData = new Uint8Array(53);
            const googleAAGUIDBytes = [0xea, 0x9b, 0x8d, 0x66, 0x4d, 0x01, 0x1d, 0x21, 0x3c, 0xe4, 0xb6, 0xb4, 0x8c, 0xb5, 0x75, 0xd4];
            authData.set(googleAAGUIDBytes, 37);

            // When extracting the AAGUID
            const result = extractAAGUID(authData.buffer);

            // Then it should return the correctly formatted Google Password Manager UUID
            expect(result).toBe('ea9b8d66-4d01-1d21-3ce4-b6b48cb575d4');
        });

        it('should work with authenticatorData longer than 53 bytes', () => {
            // Given authenticatorData that is much longer than the minimum (e.g., includes attested credential data)
            const authData = new Uint8Array(200);
            const aaguidBytes = [0xfb, 0xfc, 0x30, 0x07, 0x15, 0x4e, 0x4e, 0xcc, 0x8c, 0x0b, 0x6e, 0x02, 0x05, 0x57, 0xd7, 0xbd];
            authData.set(aaguidBytes, 37);

            // When extracting the AAGUID
            const result = extractAAGUID(authData.buffer);

            // Then it should still correctly extract the AAGUID
            expect(result).toBe('fbfc3007-154e-4ecc-8c0b-6e020557d7bd');
        });

        it('should return empty string for exactly 52 bytes (one byte short)', () => {
            // Given authenticatorData that is exactly one byte too short for AAGUID extraction
            const authData = new Uint8Array(52).buffer;

            // When extracting the AAGUID
            const result = extractAAGUID(authData);

            // Then it should return undefined
            expect(result).toBeUndefined();
        });

        it('should handle exactly 53 bytes (minimum valid length)', () => {
            // Given authenticatorData that is exactly 53 bytes (the minimum to contain a full AAGUID)
            const authData = new Uint8Array(53);
            authData.set([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f, 0x10], 37);

            // When extracting the AAGUID
            const result = extractAAGUID(authData.buffer);

            // Then it should return the correctly formatted UUID
            expect(result).toBe('01020304-0506-0708-090a-0b0c0d0e0f10');
        });
    });
});
