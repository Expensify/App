type EchoRequest = {
    n: number;
};

type EchoResponse = {
    n: number;
};

declare const self: Worker;

self.onmessage = (event: MessageEvent<EchoRequest>) => {
    const response: EchoResponse = {n: event.data.n * 2};
    postMessage(response);
};
