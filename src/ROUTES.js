/**
 * This is a file containing constants for all of the routes we want to be able to go to
 */
export default {
    SIGNIN: '/signin',
    SIGNIN_WITH_EXITTO: exitTo => `/signin/exitTo${exitTo}`,
    HOME: '/',
    REPORT: reportID => `/${reportID}`,
};
