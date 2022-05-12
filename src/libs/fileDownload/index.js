import {Linking} from 'react-native';
import * as FileUtils from './FileUtils';

/**
 * Downloading attachment in web, desktop
 * @param {String} url
 * @param {String} fileName
 * @returns {Promise}
 */
export default function fileDownload(url, fileName) {
    return new Promise((resolve) => {
        fetch(url)
            .then(response => response.blob())
            .then((blob) => {
                // Create blob link to download
                const href = URL.createObjectURL(
                    new Blob([blob]),
                );

                // creating anchor tag to initiate download
                const link = document.createElement('a');

                // adding href to anchor
                link.href = href;
                link.style.display = 'none';
                link.setAttribute(
                    'download',
                    fileName || FileUtils.getAttachmentName(url), // generating the file name
                );

                // Append to html link element page
                document.body.appendChild(link);

                // Start download
                link.click();

                // Clean up and remove the link
                URL.revokeObjectURL(link.href);
                link.parentNode.removeChild(link);
                return resolve();
            }).catch(() => {
            // file could not be downloaded, open sourceURL in new tab
                Linking.openURL(url);
                return resolve();
            });
    });
}
