/**
 * A simple GUID generator taken from https://stackoverflow.com/a/32760401/9114791
 * @returns {String}
 */
export default function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}
