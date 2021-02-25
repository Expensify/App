export default {
    prefixes: ['expensify-cash://', 'https://expensify.cash', 'http://localhost'],
    config: {
        screens: {
            Home: {
                initialRouteName: 'Loading',
                screens: {
                    // Loading route
                    Loading: '',

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
                },
            },
            NewGroup: {
                path: 'new/group',
                initialRouteName: 'Root',
                screens: {
                    Root: {
                        path: '',
                    },
                },
            },
            NewChat: {
                path: 'new/chat',
                initialRouteName: 'Root',
                screens: {
                    Root: {
                        path: '',
                    },
                },
            },
            Search: {
                path: 'search',
                initialRouteName: 'Root',
                screens: {
                    Root: {
                        path: '',
                    },
                },
            },
        },
    },
};
