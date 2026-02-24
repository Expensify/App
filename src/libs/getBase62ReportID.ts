/**
 * Take an integer reportID and convert it to a string representing a Base-62 report ID.
 *
 * This is in it's own module to prevent a dependency cycle between libs/ReportUtils.ts and libs/ReportActionUtils.ts
 *
 * @return string The reportID in base 62-format, always 12 characters beginning with `R`.
 */
export default function getBase62ReportID(reportID: number): string {
    const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    let remainder = reportID;
    while (remainder > 0) {
        const currentVal = remainder % 62;
        result = alphabet[currentVal] + result;
        remainder = Math.floor(remainder / 62);
    }

    return `R${result.padStart(11, '0')}`;
}
