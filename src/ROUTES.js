/**
 * This is a file containing constants for all of the routes we want to be able to go to
 */
export default {
    HOME: '/home',
    REPORT: '/report/:reportID',
    getReportRoute: reportID => `/report/${reportID}`,
    ROOT: '/',
    SIGNIN: '/signin',
    SIGNIN_WITH_EXITTO: '/signIn/exitTo/:exitTo*',
    getSigninWithExitToRoute: exitTo => `/signin/exitTo${exitTo}`,
};
