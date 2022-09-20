import {PusherMock} from 'pusher-js-mock';

class PusherMockWithDisconnect extends PusherMock {
    disconnect() {
        return jest.fn();
    }
}

export default PusherMockWithDisconnect;
