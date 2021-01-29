/**
 * This is a file containing constants for all of the routes we want to be able to go to
 */
export default {
    HOME: '/home',
    SETTINGS: '/settings',
    NEW_GROUP: '/new/group',
    REPORT: '/r/:reportID',
    getReportRoute: reportID => `/r/${reportID}`,
    ROOT: '/',
    SET_PASSWORD: '/setpassword/:validateCode',
    SIGNIN: '/signin',
    SIGNIN_WITH_EXITTO: '/signIn/exitTo/:exitTo*',
    getSigninWithExitToRoute: exitTo => `/signin/exitTo${exitTo}`,
    NOT_FOUND: '/404',
};
