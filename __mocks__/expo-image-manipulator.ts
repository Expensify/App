import type {ImageResult} from 'expo-image-manipulator';

const mockResult: ImageResult = {uri: 'mock://manipulated.jpg', width: 1, height: 1};

const mockRenderer = {
    renderAsync: jest.fn(() => Promise.resolve({saveAsync: jest.fn(() => Promise.resolve(mockResult))})),
};

const ImageManipulator = {
    manipulate: jest.fn(() => ({resize: jest.fn(() => mockRenderer)})),
};

export {ImageManipulator};
