import ROUTES from '../../ROUTES';

export default {
    prefixes: ['expensifycash://', 'https://expensify.cash/'],
    config: {
        screens: {
            [ROUTES.ROOT]: '/root',
            [ROUTES.SETTINGS]: '/settings',
            [ROUTES.REPORT]: '/r/:reportID',
        },
    },
};
