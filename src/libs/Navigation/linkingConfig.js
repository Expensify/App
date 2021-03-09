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
            SetPassword: 'setpassword/:validateCode',

            // Modal Screens
            Settings: {
                path: 'settings',
                initialRouteName: 'Settings_Root',
                screens: {
                    Settings_Root: {
                        path: '',
                    },
                },
            },
            NewGroup: {
                path: 'new/group',
                initialRouteName: 'NewGroup_Root',
                screens: {
                    NewGroup_Root: {
                        path: '',
                    },
                },
            },
            NewChat: {
                path: 'new/chat',
                initialRouteName: 'NewChat_Root',
                screens: {
                    NewChat_Root: {
                        path: '',
                    },
                },
            },
            Search: {
                path: 'search',
                initialRouteName: 'Search_Root',
                screens: {
                    Search_Root: {
                        path: '',
                    },
                },
            },
            Profile: {
                initialRouteName: 'Profile_Root',
                screens: {
                    Profile_Root: 'profile/:login',
                },
            },
        },
    },
};
