import CONST from '../../CONST';

/**
 * fetch Browser Name and version from UA string
 *
 * @return {String} e.g. Chrome 80
 */
function getBrowserVersion() {
    const {userAgent} = window.navigator;
    let match = userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    let temp;

    if (/trident/i.test(match[1])) {
        temp = /\brv[ :]+(\d+)/g.exec(userAgent) || [];

        return `IE ${temp[1] || ''}`;
    }

    if (match[1] === 'Chrome') {
        temp = userAgent.match(/\b(OPR|Edge)\/(\d+)/);

        if (temp !== null) {
            return temp.slice(1).join(' ').replace('OPR', 'Opera');
        }

        temp = userAgent.match(/\b(Edg)\/(\d+)/);

        if (temp !== null) {
            return temp.slice(1).join(' ').replace('Edg', 'Edge');
        }
    }

    match = match[2] ? [match[1], match[2]] : [navigator.appName, navigator.appVersion, '-?'];
    temp = userAgent.match(/version\/(\d+)/i);

    if (temp !== null) {
        match.splice(1, 1, temp[1]);
    }

    return match.join(' ');
}

/**
 * Get the Browser name
 * @returns {String}
 */
export default () => {
    const browserAndVersion = getBrowserVersion();
    const [browser] = browserAndVersion.split(' ');
    return browser ? browser.toLowerCase() : CONST.BROWSER.OTHER;
};
