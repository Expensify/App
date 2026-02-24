type SetTimeout = typeof global.setTimeout & jest.Mock & typeof jasmine;

export default () => !!((global.setTimeout as SetTimeout).mock || (global.setTimeout as SetTimeout).clock);
