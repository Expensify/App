export default {
    hide: jest.fn().mockResolvedValueOnce(),
    show: jest.fn().mockResolvedValueOnce(),
    getVisibilityStatus: jest.fn().mockResolvedValue('hidden'),
};
