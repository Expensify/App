import {SigninParams} from '@libs/E2E/types';
import Response from '@src/types/onyx/Response';

const beginSignin = ({email}: SigninParams): Response => ({
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
    ],
    jsonCode: 200,
    requestID: '783e54ef4b38cff5-SJC',
});

export default beginSignin;
