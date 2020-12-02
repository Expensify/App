import CONFIG from './CONFIG';
const CLOUDFRONT_URL = 'https://d2k5nsl2zxldvw.cloudfront.net';

const CONST = {
    CLOUDFRONT_URL,
    PDF_VIEWER_URL: `${CONFIG.EXPENSIFY.URL_EXPENSIFY_CASH}/pdf-viewer/web/viewer.html`,
    EXPENSIFY_ICON_URL: `${CLOUDFRONT_URL}/images/favicon-2019.png`,
};

export default CONST;
