type FSPageInterface = {
    start: jest.Mock<void, []>;
};

export default function mockFSLibrary() {
    jest.mock('@fullstory/react-native', () => {
        class Fullstory {
            consent = jest.fn();

            anonymize = jest.fn();

            identify = jest.fn();
        }

        return {
            FSPage(): FSPageInterface {
                return {
                    start: jest.fn(() => {}),
                };
            },
            default: Fullstory,
        };
    });
}
