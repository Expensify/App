export default function mockFSLibrary() {
    jest.mock('@fullstory/react-native', () => {
        class Fullstory {
            consent = jest.fn();

            anonymize = jest.fn();

            identify = jest.fn();
        }

        return {
            FSPage() {
                this.start = jest.fn();
            },
            default: Fullstory,
        };
    });
}
