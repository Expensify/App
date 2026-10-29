declare const self: Worker;

self.onmessage = () => {
    process.exit(1);
};
