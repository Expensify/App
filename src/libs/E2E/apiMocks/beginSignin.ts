import Response from '../../../types/onyx/Response';
import {SigninParams} from '../types';

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
        {
            onyxMethod: 'set',
            key: 'betas',
            value: ['passwordless'],
        },
    ],
    jsonCode: 200,
    requestID: '783e54ef4b38cff5-SJC',
});

export default beginSignin;
