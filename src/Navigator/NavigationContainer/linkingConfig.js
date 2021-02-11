export default {
    prefixes: ['expensifycash://', 'https://expensify.cash/'],
    config: {
        screens: {
            Home: {
                path: '',
                initialRouteName: 'Sidebar',
                screens: {
                    Sidebar: '',
                    Report: 'r/:reportID',
                },
            },

            // Public Routes
            SignIn: 'signin',

            // Modal Screens
            Settings: {
                path: 'settings',
                initialRouteName: 'Root',
                exact: true,
                screens: {
                    Root: {
                        path: '',
                    },
                    Test: {
                        path: 'test',
                    },
                    Test2: {
                        path: 'test2',
                    },
                },
            },
        },
    },
};
