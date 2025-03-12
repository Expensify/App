import * as stub from 'emails/stubs/react-native-safe-area-context';

const SafeAreaProvider = stub.SafeAreaProvider;
const SafeAreaConsumer = stub.SafeAreaConsumer;
const SafeAreaInsetsContext = stub.SafeAreaInsetsContext;
const withSafeAreaInsets = stub.withSafeAreaInsets;
const SafeAreaView = stub.SafeAreaView;
const useSafeAreaFrame: jest.Mock<ReturnType<typeof LibUseSafeAreaFrame>> = jest.fn(stub.useSafeAreaFrame);
const useSafeAreaInsets: jest.Mock<EdgeInsets> = jest.fn(stub.useSafeAreaInsets);

export {SafeAreaProvider, SafeAreaConsumer, SafeAreaInsetsContext, withSafeAreaInsets, SafeAreaView, useSafeAreaFrame, useSafeAreaInsets};
