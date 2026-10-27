type EchoRequest = {
    n: number;
};

type EchoResponse = {
    n: number;
};

declare const self: Worker;

self.onmessage = (event: MessageEvent<EchoRequest>) => {
    if (event.data.n === 3) {
        throw new Error('boom');
    }
    const response: EchoResponse = {n: event.data.n * 2};
    postMessage(response);
};
