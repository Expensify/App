export default ({email}) => ({
    onyxData: [
        {
            onyxMethod: 'merge',
            key: 'credentials',
            value: {
                login: email,
            },
        },
        {
            onyxMethod: 'merge',
            key: 'account',
            value: {
                validated: true,
            },
        },
        {
            onyxMethod: 'set',
            key: 'betas',
            value: [
                'passwordless',
            ],
        },
    ],
    jsonCode: 200,
    requestID: '783e54ef4b38cff5-SJC',
}
);
