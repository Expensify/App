import Encryptify from 'react-native-encryptify';
import performance from 'react-native-performance';

// 255 characters string for testing the encryption lib
const ENCRYPTION_DATA =
    'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis,';
const ENCRYPTION_IV = 'Lorem ipsum dolor sit amet';

const testEncryptionFlow = (shouldLog = true): string => {
    performance.mark('KEMGenKeys');
    const kemKeys = Encryptify.KEMGenKeys();
    performance.measure('KEMGenKeys', 'KEMGenKeys');

    performance.mark('KEMEncrypt');
    const {sharedSecret, cipherText} = Encryptify.KEMEncrypt(kemKeys.public);
    performance.measure('KEMEncrypt', 'KEMEncrypt');

    performance.mark('AESEncrypt');
    const encryptedData = Encryptify.AESEncrypt(ENCRYPTION_IV, sharedSecret, ENCRYPTION_DATA);
    performance.measure('AESEncrypt', 'AESEncrypt');

    // After encryption on the sender side, the message is sent to the receiver:
    // Only the encryptedData an the cipherText must be sent to the receiver
    // The receiver can then decrypt the cipherText with his private keys

    performance.mark('KEMDecrypt');
    const decryptedSharedSecret = Encryptify.KEMDecrypt(kemKeys.private, cipherText);
    performance.measure('KEMDecrypt', 'KEMDecrypt');

    performance.mark('AESDecrypt');
    const decryptedData = Encryptify.AESDecrypt(ENCRYPTION_IV, decryptedSharedSecret, encryptedData);
    performance.measure('AESDecrypt', 'AESDecrypt');

    performance.clearMarks();
    performance.clearMeasures();

    if (shouldLog) {
        console.log({kemKeys});

        const logString = `"${ENCRYPTION_DATA}"
got encrypted to:
${encryptedData}
and decrypted back to:
${decryptedData}

Success: ${ENCRYPTION_DATA === decryptedData}

Performance:

`;

        // eslint-disable-next-line no-console
        console.log(logString);
        // eslint-disable-next-line no-console
        console.log(performance.getEntriesByType('measure'));
    }

    return sharedSecret;
};

const testAesUnderLoad = (sharedSecret: string, iterations: number, shouldLog = true) => {
    const shiftString = (str: string, numOfChars: number) => str.substring(numOfChars) + str.substring(0, numOfChars);

    for (let i = 0; i < iterations; i++) {
        // eslint-disable-next-line no-bitwise
        const inputData = shiftString(ENCRYPTION_DATA, i);

        performance.mark('AESEncrypt under load');
        const encryptedDataIter = Encryptify.AESEncrypt(ENCRYPTION_IV, sharedSecret, inputData);
        performance.measure(`Iteration ${i}`, 'AESEncrypt under load');

        performance.mark('AESDecrypt under load');
        Encryptify.AESDecrypt(ENCRYPTION_IV, sharedSecret, encryptedDataIter);
        performance.measure(`Iteration ${i}`, 'AESDecrypt under load');
    }

    const getAverageTime = (name: string) => performance.getEntriesByName(name).reduce((total, entry) => total + entry.duration, 0) / iterations;
    const averageTimeToEncrypt = getAverageTime('AESEncrypt under load');
    const averageTimeToDecrypt = getAverageTime('AESDecrypt under load');

    if (shouldLog) {
        // eslint-disable-next-line no-console
        console.log('Under Load: (encrypting/decrypting 100 times)');
        // eslint-disable-next-line no-console
        console.log(performance.getEntriesByName('AESEncrypt under load'));
        // eslint-disable-next-line no-console
        console.log(`Average time to encrypt: ${averageTimeToEncrypt}ms`);
        // eslint-disable-next-line no-console
        console.log(performance.getEntriesByName('AESDecrypt under load'));
        // eslint-disable-next-line no-console
        console.log(`Average time to decrypt: ${averageTimeToDecrypt}ms`);
    }
};

export {testEncryptionFlow, testAesUnderLoad};
