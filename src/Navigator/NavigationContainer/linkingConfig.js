export default {
    prefixes: ['expensifycash://', 'https://expensify.cash/'],
    config: {
        screens: {
            Home: '',
            SignIn: 'signin',
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
            Report: 'r/:reportID',
        },
    },
};
