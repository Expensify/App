const rspackCommands = require('@callstack/repack/commands/rspack');
// avoid overriding default commands from community-cli-plugin
const commands = rspackCommands.filter((cmd) => cmd.name.startsWith('webpack'));

module.exports = {
    commands,
    assets: ['./assets/fonts/native'],
    dependencies: {
        // We need to unlink the react-native-wallet package from the android build
        // because it's not supported yet and we want to prevent the build from failing
        // due to missing Google TapAndPay SDK
        '@expensify/react-native-wallet': {
            platforms: {
                android: null,
            },
        },
    },
};
