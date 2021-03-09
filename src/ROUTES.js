/**
 * This is a file containing constants for all of the routes we want to be able to go to
 */
export default {
    HOME: '/',
    SETTINGS: '/settings',
    NEW_GROUP: '/new/group',
    NEW_CHAT: '/new/chat',
    REPORT: '/r',
    getReportRoute: reportID => `/r/${reportID}`,
    SEARCH: '/search',
    SET_PASSWORD: '/setpassword/:validateCode',
    SIGNIN: '/signin',
    NOT_FOUND: '/404',
    PROFILE: '/profile/:login',
    getProfileRoute: login => `/profile/${login}`,
};
