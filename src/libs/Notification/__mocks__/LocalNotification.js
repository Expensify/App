// Local notifications (a.k.a. browser notifications) do not run in native code. Our jest tests will also run against
// any index.native.js files as they are using a react-native plugin. However, it is useful to mock this behavior so that we
// can test the expected web behavior and see if a browser notification would be shown or not.

export default {
    showCommentNotification: jest.fn(),
};
