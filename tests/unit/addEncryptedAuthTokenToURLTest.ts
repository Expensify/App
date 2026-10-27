import CONFIG from '@src/CONFIG';
import addEncryptedAuthTokenToURL from '@src/libs/addEncryptedAuthTokenToURL';

const FILE_URL = `${CONFIG.EXPENSIFY.EXPENSIFY_URL}chat-attachments/123/file.jpg`;
const ATTACKER_FILE_URL = 'https://attacker.example/file.jpg';
const ENCRYPTED_TOKEN = 'testEncryptedToken123';

describe('addEncryptedAuthTokenToURL', () => {
    it('should add encryptedAuthToken with ? when URL has no parameters', () => {
        // Given an Expensify file URL with no query parameters
        // When adding the token
        const result = addEncryptedAuthTokenToURL(FILE_URL, ENCRYPTED_TOKEN);

        // Then the token starts the query string
        expect(result).toBe(`${FILE_URL}?encryptedAuthToken=${ENCRYPTED_TOKEN}`);
    });

    it('should add encryptedAuthToken with & when URL has existing parameters', () => {
        // Given an Expensify file URL that the caller says already has query parameters
        // When adding the token
        const result = addEncryptedAuthTokenToURL(FILE_URL, ENCRYPTED_TOKEN, true);

        // Then the token joins the existing query string
        expect(result).toBe(`${FILE_URL}&encryptedAuthToken=${ENCRYPTED_TOKEN}`);
    });

    it('should encode the token so it stays a single query parameter', () => {
        // Given a token with characters that have a meaning inside a query string
        const token = 'a+b/c=d&e';

        // When adding the token to an Expensify file URL
        const result = addEncryptedAuthTokenToURL(FILE_URL, token);

        // Then the token is encoded, so the server reads it back exactly
        expect(result).toBe(`${FILE_URL}?encryptedAuthToken=a%2Bb%2Fc%3Dd%26e`);
    });

    it.each([false, true])('should return a URL outside Expensify unchanged when hasOtherParameters is %s', (hasOtherParameters) => {
        // Given a file URL on a host that is not an Expensify server
        // When adding the token
        const result = addEncryptedAuthTokenToURL(ATTACKER_FILE_URL, ENCRYPTED_TOKEN, hasOtherParameters);

        // Then the URL comes back unchanged, so the token never reaches that host
        expect(result).toBe(ATTACKER_FILE_URL);
    });

    it('should return a protocol relative URL unchanged', () => {
        // Given a protocol relative URL, which loads from whatever host follows the two slashes
        const url = '//attacker.example/file.jpg';

        // When adding the token
        const result = addEncryptedAuthTokenToURL(url, ENCRYPTED_TOKEN);

        // Then the URL comes back unchanged
        expect(result).toBe(url);
    });
});
