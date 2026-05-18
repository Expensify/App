import addEncryptedAuthTokenToURL from '@src/libs/addEncryptedAuthTokenToURL';

const FILE_URL = 'https://example.com/file.jpg';
const ENCRYPTED_TOKEN = 'testEncryptedToken123';
describe('addEncryptedAuthTokenToURL', () => {
    it('should add encryptedAuthToken with ? when URL has no parameters', () => {
        const result = addEncryptedAuthTokenToURL(FILE_URL, ENCRYPTED_TOKEN);
        expect(result).toBe(`${FILE_URL}?encryptedAuthToken=${ENCRYPTED_TOKEN}`);
    });

    it('should add encryptedAuthToken with & when URL has existing parameters', () => {
        const result = addEncryptedAuthTokenToURL(FILE_URL, ENCRYPTED_TOKEN, true);
        expect(result).toBe(`${FILE_URL}&encryptedAuthToken=${ENCRYPTED_TOKEN}`);
    });
});
