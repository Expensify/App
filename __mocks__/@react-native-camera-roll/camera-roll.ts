import type {CameraRoll} from '@react-native-camera-roll/camera-roll';

type CameraRollMock = {
    CameraRoll: {
        save: typeof CameraRoll.save;
    };
};

const cameraRollMock: CameraRollMock = {
    CameraRoll: {
        save: jest.fn(),
    },
};

export default cameraRollMock;
