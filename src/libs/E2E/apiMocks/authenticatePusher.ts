import Response from '@src/types/onyx/Response';

const authenticatePusher = (): Response => ({
    auth: 'auth',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    shared_secret: 'secret',
    jsonCode: 200,
    requestID: '783ef7fc3991969a-SJC',
});

export default authenticatePusher;
