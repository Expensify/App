/**
 * Downloading attachment in web, desktop
 * @param {String} url
 * @param {String} fileName
 * @returns {Promise}
 */
export default function GenerateStatementPDF(url) {
    return new Promise((resolve) => {
        fetch(url)
            .then(response => response.blob())
            .then((blob) => {
                console.log('blob', blob);
                return resolve();
            }).catch(() => {
                console.log('error');
            });
    });
}
