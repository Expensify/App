import openURLInNewTab from '../openURLInNewTab';
import getAttachmentName from './getAttachmentName';

/**
 * Downloading attachment in web, desktop
 * @param {String} url
 */
export default function fileDownload(url) {
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
                getAttachmentName(url), // generating the file name
            );

            // Append to html link element page
            document.body.appendChild(link);

            // Start download
            link.click();

            // Clean up and remove the link
            URL.revokeObjectURL(link.href);
            link.parentNode.removeChild(link);
        }).catch(() => {
            // file could not be downloaded, open sourceURL in new tab
            openURLInNewTab(url);
        });
}
