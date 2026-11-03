export default () => {
    const {setTimeout} = global;
    if ('mock' in setTimeout && setTimeout.mock) {
        return true;
    }
    return 'clock' in setTimeout && !!setTimeout.clock;
};
