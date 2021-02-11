export default {
    prefixes: ['expensifycash://', 'https://expensify.cash/', 'http://localhost:8080/'],
    config: {
        screens: {
            Home: {
                path: '',
                screens: {
                    Sidebar: '',

                    // Report route
                    Report: 'r/:reportID',
                },
            },

            // Public Routes
            SignIn: 'signin',

            // Modal Screens
            Settings: {
                path: 'settings',
                initialRouteName: 'Root',
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
