/**
 * This is a file containing constants for all of the routes we want to be able to go to
 */
export default {
    HOME: '/home',
    SETTINGS: '/settings',
    NEW_GROUP: '/new/group',
    NEW_CHAT: '/new/chat',
    IOU_REQUEST: '/iou/request',
    IOU_BILL: '/iou/split',
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
