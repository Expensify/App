declare const self: Worker;

self.onmessage = () => {
    throw new Error('boom');
};
