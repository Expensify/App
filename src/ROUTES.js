/**
 * This is a file containing constants for all of the routes we want to be able to go to
 */
export default {
    HOME: '/home',
    SETTINGS: '/settings',
    SUBSETTINGS: '/settings/:route',
    getSettingsRoute: route => `/settings/${route}`,
    NEW_GROUP: '/new/group',
    NEW_CHAT: '/new/chat',
    REPORT: '/r/:reportID',
    getReportRoute: reportID => `/r/${reportID}`,
    ROOT: '/',
    SEARCH: '/search',
    SET_PASSWORD: '/setpassword/:validateCode',
    SIGNIN: '/signin',
    NOT_FOUND: '/404',
    PROFILE: '/profile/:login',
    getProfileRoute: login => `/profile/${login}`,
};
