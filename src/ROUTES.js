/**
 * This is a file containing constants for all of the routes we want to be able to go to
 */
export default {
    HOME: '/home',
    SETTINGS: '/settings',
    NEW_GROUP: '/new/group',
    REPORT: '/r',
    getReportRoute: reportID => `/r/${reportID}`,
    ROOT: '/',
    SET_PASSWORD: '/setpassword/:validateCode',
    NOT_FOUND: '/404',
};
