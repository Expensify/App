import ROUTES from '../../ROUTES';

export default {
    prefixes: ['expensifycash://', 'https://expensify.cash/'],
    config: {
        screens: {
            [ROUTES.HOME]: '/home',
            [ROUTES.SETTINGS]: '/settings',
            '/settings/test': '/settings/test',
            '/settings/test2': '/settings/test2',
            [ROUTES.REPORT]: '/r/:reportID',
        },
    },
};
