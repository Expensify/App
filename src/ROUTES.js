/**
 * This is a file containing constants for all of the routes we want to be able to go to
 */
export default {
    HOME: '/home',
    REPORT: '/r/:reportID',
    getReportRoute: reportID => `/r/${reportID}`,
    ROOT: '/',
    SIGNIN: '/signin',
    SIGNIN_WITH_EXITTO: '/signIn/exitTo/:exitTo*',
    getSigninWithExitToRoute: exitTo => `/signin/exitTo${exitTo}`,
};
