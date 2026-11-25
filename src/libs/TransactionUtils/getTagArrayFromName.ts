/**
 * Return a colon-delimited tag string as an array, considering escaped colons and double backslashes.
 */
function getTagArrayFromName(tagName: string): string[] {
    // WAIT!!!!!!!!!!!!!!!!!!
    // You need to keep this in sync with TransactionUtils.php

    // We need to be able to preserve double backslashes in the original string
    // and not have it interfere with splitting on a colon (:).
    // So, let's replace it with something absurd to begin with, do our split, and
    // then replace the double backslashes in the end.
    const tagWithoutDoubleSlashes = tagName.replaceAll('\\\\', '☠');
    const tagWithoutEscapedColons = tagWithoutDoubleSlashes.replaceAll('\\:', '☢');

    // Do our split
    const matches = tagWithoutEscapedColons.split(':');
    const newMatches: string[] = [];

    for (const item of matches) {
        const tagWithEscapedColons = item.replaceAll('☢', '\\:');
        const tagWithDoubleSlashes = tagWithEscapedColons.replaceAll('☠', '\\\\');
        newMatches.push(tagWithDoubleSlashes);
    }

    return newMatches;
}

export default getTagArrayFromName;
