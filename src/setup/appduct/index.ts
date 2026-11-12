import type * as Appduct from '@appduct/react-native';

if (__DEV__) {
    const {registerTool} = require<typeof Appduct>('@appduct/react-native/auto');
    import('./tools').then(({default: tools}) => {
        for (const tool of tools) {
            registerTool(tool);
        }
    });
}
