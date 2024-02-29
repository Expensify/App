type SetTimeout = typeof global.setTimeout & jest.Mock & typeof jasmine;

export default () => Boolean((global.setTimeout as SetTimeout).mock || (global.setTimeout as SetTimeout).clock);
