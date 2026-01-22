import type {Fullstory, FSPageLike as mockFSPageLike} from '@libs/Fullstory/types';

export default function mockFSLibrary() {
    jest.mock('@fullstory/react-native', () => {
        return {
            FSPage: jest.fn(),
            default: jest.fn(),
        };
    });

    jest.mock<Fullstory>('@libs/Fullstory', () => {
        class FSPage implements mockFSPageLike {
            start() {}
        }

        return {
            Page: FSPage,
            getChatFSClass: jest.fn(),
            init: jest.fn(),
            onReady: jest.fn(),
            shouldInitialize: jest.fn().mockReturnValue(false),
            consent: jest.fn(),
            identify: jest.fn(),
            consentAndIdentify: jest.fn(),
            anonymize: jest.fn(),
            getSessionId: jest.fn().mockResolvedValue(undefined),
            getSessionURL: jest.fn().mockResolvedValue(undefined),
        };
    });
}
