import E2EClient from '../client';

const test = () => E2EClient.submitTestResults({
    name: 'DummyMetrics',
    duration: '123',
}).then(E2EClient.submitTestDone);

export default test;
