/** Returns whether a string begins with an English vowel. */
function startsWithVowel(str: string): boolean {
    return /^[aeiouAEIOU]/.test(str);
}

export default startsWithVowel;
