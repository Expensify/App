/* eslint-disable no-console */

/* eslint-disable @lwc/lwc/no-async-await */
import Encryptify from 'react-native-encryptify';
import performance, {PerformanceMeasure} from 'react-native-performance';

// 255 characters string for testing the encryption lib
const ENCRYPTION_DATA =
    'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis,';
const ENCRYPTION_IV = 'Lorem ipsum dolor sit amet';
const PERFORMANCE_METRICS_DECIMAL_PLACES = 4;

const testEncryptionFlow = async (shouldLog = true): Promise<string> => {
    performance.mark('KEMGenKeys');
    const kemKeys = await Encryptify.KemGenKeys();
    performance.measure('KEMGenKeys', 'KEMGenKeys');

    performance.mark('KEMEncrypt');
    const {sharedSecret, cipherText} = await Encryptify.KemEncrypt(kemKeys.public);
    performance.measure('KEMEncrypt', 'KEMEncrypt');

    performance.mark('AESEncrypt');
    const encryptedData = await Encryptify.AesEncrypt(ENCRYPTION_IV, sharedSecret, ENCRYPTION_DATA);
    performance.measure('AESEncrypt', 'AESEncrypt');

    // After encryption on the sender side, the message is sent to the receiver:
    // Only the encryptedData an the cipherText must be sent to the receiver
    // The receiver can then decrypt the cipherText with his private keys

    performance.mark('KEMDecrypt');
    const decryptedSharedSecret = await Encryptify.KemDecrypt(kemKeys.private, cipherText);
    performance.measure('KEMDecrypt', 'KEMDecrypt');

    performance.mark('AESDecrypt');
    const decryptedData = await Encryptify.AesDecrypt(ENCRYPTION_IV, decryptedSharedSecret, encryptedData);
    performance.measure('AESDecrypt', 'AESDecrypt');

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

        const performanceLines = performance
            .getEntriesByType('measure')
            .map((entry) => `${entry.name}: ${entry.duration.toFixed(PERFORMANCE_METRICS_DECIMAL_PLACES)}ms`)
            .join('\n');

        console.log(logString);
        console.log(performanceLines);
    }

    performance.clearMarks();
    performance.clearMeasures();

    return sharedSecret;
};

const testAesUnderLoad = async (sharedSecret: string, iterations: number, shouldLog = true) => {
    const shiftString = (str: string, numOfChars: number) => str.substring(numOfChars) + str.substring(0, numOfChars);

    const promises = [];

    async function runAesEncryptionFlow(i: number) {
        const inputData = shiftString(ENCRYPTION_DATA, i);

        performance.mark('AESEncrypt under load');
        const encryptedDataIter = await Encryptify.AesEncrypt(ENCRYPTION_IV, sharedSecret, inputData);
        performance.measure(`Encryption Iteration ${i}`, 'AESEncrypt under load');

        performance.mark('AESDecrypt under load');
        await Encryptify.AesDecrypt(ENCRYPTION_IV, sharedSecret, encryptedDataIter);
        performance.measure(`Decryption teration ${i}`, 'AESDecrypt under load');
    }

    for (let i = 0; i < iterations; i++) {
        promises.push(runAesEncryptionFlow(i));
    }

    await Promise.all(promises);

    const allMeasures = performance.getEntriesByType('measure');
    const encryptionMeasures = allMeasures.filter((measure) => measure.name.includes('Encryption'));
    const decryptionMeasures = allMeasures.filter((measure) => measure.name.includes('Decryption'));

    const getMeanTime = (measures: PerformanceMeasure[]) => measures.reduce((total, entry) => total + entry.duration, 0) / iterations;
    const getMinTime = (measures: PerformanceMeasure[]) => Math.min(...measures.map((entry) => entry.duration));
    const getMaxTime = (measures: PerformanceMeasure[]) => Math.max(...measures.map((entry) => entry.duration));

    if (shouldLog) {
        const printData = (measures: PerformanceMeasure[]) =>
            `Mean: ${getMeanTime(measures).toFixed(PERFORMANCE_METRICS_DECIMAL_PLACES)}ms, Min: ${getMinTime(measures).toFixed(PERFORMANCE_METRICS_DECIMAL_PLACES)}ms, Max: ${getMaxTime(
                measures,
            ).toFixed(PERFORMANCE_METRICS_DECIMAL_PLACES)}ms`;

        console.log(`Under Load: (encrypting/decrypting ${iterations} times simoultenously)`);
        console.log(`Encryption | ${printData(encryptionMeasures)}`);
        console.log(`Decryption | ${printData(decryptionMeasures)}`);
    }

    performance.clearMarks();
    performance.clearMeasures();
};

export {testEncryptionFlow, testAesUnderLoad, PERFORMANCE_METRICS_DECIMAL_PLACES};
