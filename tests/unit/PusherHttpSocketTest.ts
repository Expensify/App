import Pusher from 'pusher-js/with-encryption';

const STREAM_URL = 'https://sockjs-mt1.pusher.com/pusher/app/key';

class FakeXHR {
    static instances: FakeXHR[] = [];

    // pusher-js picks the XHR transport only when `withCredentials` is defined
    withCredentials = false;

    readyState = 0;

    status = 0;

    responseText = '';

    onprogress = () => {};

    onreadystatechange = () => {};

    onload = () => {};

    onerror = () => {};

    ontimeout = () => {};

    constructor() {
        FakeXHR.instances.push(this);
    }

    open() {}

    setRequestHeader() {}

    send() {}

    abort() {}

    receive(text: string) {
        this.readyState = 3;
        this.status = 200;
        this.responseText += text;
        this.onprogress();
    }

    finish() {
        this.readyState = 4;
        this.onreadystatechange();
    }
}

function openStream() {
    const socket = Pusher.Runtime.HTTPFactory.createStreamingSocket(STREAM_URL);
    const onopen = jest.fn();
    const onmessage = jest.fn();
    const onclose = jest.fn();
    socket.onopen = onopen;
    socket.onmessage = onmessage;
    socket.onclose = onclose;

    // The last XHR is the stream. pusher-js creates an earlier one only to check XHR support.
    const xhr = FakeXHR.instances.at(-1);
    return {xhr, onopen, onmessage, onclose};
}

describe('pusher-js HTTP streaming socket', () => {
    beforeEach(() => {
        FakeXHR.instances = [];
        jest.spyOn(Pusher.Runtime, 'getXHRAPI').mockReturnValue(FakeXHR);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should skip a line that is not valid JSON and still handle the frames after it', () => {
        // Given an open HTTP stream, because pusher-js falls back to it when WebSockets fail
        const {xhr, onopen, onmessage, onclose} = openStream();

        // When one progress event carries a script line that Forcepoint DLP injected before the open and array frames,
        // because the line starts with "c" and pusher-js parsed it as a close frame and threw
        expect(() => xhr?.receive('class FPClassifier {\no\na["hello"]\n')).not.toThrow();

        // Then the socket opens and delivers the message from that same progress event
        expect(onopen).toHaveBeenCalledTimes(1);
        expect(onmessage).toHaveBeenCalledTimes(1);
        expect(onmessage).toHaveBeenCalledWith({data: 'hello'});
        expect(onclose).not.toHaveBeenCalled();

        // When the response ends
        xhr?.finish();

        // Then the socket closes, because the skipped line did not break the stream's end handling
        expect(onclose).toHaveBeenCalledTimes(1);
    });

    it('should skip a close frame whose payload is not an array', () => {
        // Given an open HTTP stream
        const {xhr, onopen, onclose} = openStream();
        xhr?.receive('o\n');
        expect(onopen).toHaveBeenCalledTimes(1);

        // When a line starts with "c" and holds valid JSON that is not an array, because a real close frame
        // always carries [code, reason]
        xhr?.receive('c{"code":1}\n');

        // Then the socket stays open
        expect(onclose).not.toHaveBeenCalled();
    });

    it('should skip an array frame whose payload is not an array', () => {
        // Given an open HTTP stream
        const {xhr, onopen, onmessage, onclose} = openStream();
        xhr?.receive('o\n');
        expect(onopen).toHaveBeenCalledTimes(1);

        // When a line starts with "a" and holds valid JSON that is not an array, because pusher-js reads
        // payload.length on it and would throw out of the XHR progress handler
        expect(() => xhr?.receive('anull\n')).not.toThrow();

        // Then no message is emitted and the socket stays open
        expect(onmessage).not.toHaveBeenCalled();
        expect(onclose).not.toHaveBeenCalled();
    });
});
