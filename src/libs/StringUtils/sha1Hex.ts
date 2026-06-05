/**
 * Returns the lowercase hex SHA-1 digest of the input string.
 * Matches PHP's sha1() output so cache keys stay consistent across client and server.
 */
function sha1Hex(input: string): string {
    const message = unescape(encodeURIComponent(input));
    const messageLength = message.length;
    const words: number[] = [];

    for (let index = 0; index < messageLength; index++) {
        words[index >> 2] |= message.charCodeAt(index) << (24 - (index % 4) * 8);
    }

    words[messageLength >> 2] |= 0x80 << (24 - (messageLength % 4) * 8);
    words[(((messageLength + 8) >> 6) + 1) * 16 - 1] = messageLength * 8;

    let a = 0x67452301;
    let b = 0xefcdab89;
    let c = 0x98badcfe;
    let d = 0x10325476;
    let e = 0xc3d2e1f0;

    for (let blockStart = 0; blockStart < words.length; blockStart += 16) {
        const block = words.slice(blockStart, blockStart + 16);
        const originalA = a;
        const originalB = b;
        const originalC = c;
        const originalD = d;
        const originalE = e;

        for (let round = 0; round < 80; round++) {
            let wordIndex = round;
            if (round >= 16) {
                const rotatedWord = block[wordIndex - 3] ^ block[wordIndex - 8] ^ block[wordIndex - 14] ^ block[wordIndex - 16];
                block[wordIndex] = (rotatedWord << 1) | (rotatedWord >>> 31);
            }

            const word = block[wordIndex];
            let functionResult = 0;
            let constant = 0;

            if (round < 20) {
                functionResult = (b & c) | (~b & d);
                constant = 0x5a827999;
            } else if (round < 40) {
                functionResult = b ^ c ^ d;
                constant = 0x6ed9eba1;
            } else if (round < 60) {
                functionResult = (b & c) | (b & d) | (c & d);
                constant = 0x8f1bbcdc;
            } else {
                functionResult = b ^ c ^ d;
                constant = 0xca62c1d6;
            }

            const temp = (((a << 5) | (a >>> 27)) + functionResult + e + constant + word) | 0;
            e = d;
            d = c;
            c = (b << 30) | (b >>> 2);
            b = a;
            a = temp;
        }

        a = (a + originalA) | 0;
        b = (b + originalB) | 0;
        c = (c + originalC) | 0;
        d = (d + originalD) | 0;
        e = (e + originalE) | 0;
    }

    return [a, b, c, d, e].map((value) => (value >>> 0).toString(16).padStart(8, '0')).join('');
}

export default sha1Hex;
