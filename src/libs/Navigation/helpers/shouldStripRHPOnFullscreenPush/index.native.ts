// On native, react-native-screens freezes inactive screens via React Suspense,
// which disconnects useOnGetState listeners and silently loses the RHP's internal state.
export default true;
