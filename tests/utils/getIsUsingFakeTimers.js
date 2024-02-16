export default () => Boolean(global.setTimeout.mock || global.setTimeout.clock);
