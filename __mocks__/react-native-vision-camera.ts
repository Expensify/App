const useCameraDevice = jest.fn(() => null);
const useCameraFormat = jest.fn(() => null);
const useCameraPermission = jest.fn(() => ({hasPermission: false, requestPermission: jest.fn(() => Promise.resolve(false))}));

const Camera = Object.assign(
    jest.fn(() => null),
    {
        getCameraPermissionStatus: jest.fn(() => 'not-determined'),
        requestCameraPermission: jest.fn(() => Promise.resolve('granted')),
    },
);

export {Camera, useCameraDevice, useCameraFormat, useCameraPermission};
