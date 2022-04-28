import * as Pusher from '../../src/libs/Pusher/pusher';
import CONFIG from '../../src/CONFIG';

describe('Pusher', () => {
    test('Should join parts with dashes', () => {
        const name = Pusher.getChannelName('start', 'middle', 10, 'end');
        expect(name).toEqual('start-middle-10-end');
    });

    test('Should append PUSHER SUFFIX', () => {
        CONFIG.PUSHER.SUFFIX = 'bb8';
        const name = Pusher.getChannelName('my-channel');
        expect(name).toEqual('my-channel-bb8');
    });
});
