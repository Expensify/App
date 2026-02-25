import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import fileDownload from '@libs/fileDownload';
import useDownloadAttachment from '@pages/media/AttachmentModalScreen/routes/hooks/useDownloadAttachment';
import ONYXKEYS from '@src/ONYXKEYS';

jest.mock('@libs/fileDownload');

const mockFileDownload = fileDownload as jest.MockedFunction<typeof fileDownload>;

const ENCRYPTED_TOKEN = 'testEncryptedToken123';
const FILE_URL = 'https://example.com/file.jpg';

describe('useDownloadAttachment', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.SESSION]: {encryptedAuthToken: ENCRYPTED_TOKEN},
            },
        });
    });

    beforeEach(() => {
        mockFileDownload.mockClear();
    });

    afterEach(() => Onyx.clear());

    it('should add encryptedAuthToken to URL when isAuthTokenRequired is true', async () => {
        const {result} = renderHook(() => useDownloadAttachment({isAuthTokenRequired: true}), {wrapper: OnyxListItemProvider});

        result.current({source: FILE_URL, file: {name: 'file.jpg'}});

        expect(mockFileDownload).toHaveBeenCalledWith(
            expect.anything(),
            `${FILE_URL}?encryptedAuthToken=${ENCRYPTED_TOKEN}`,
            'file.jpg',
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            true,
        );
    });

    it('should NOT add encryptedAuthToken to URL when isAuthTokenRequired is false', async () => {
        const {result} = renderHook(() => useDownloadAttachment({isAuthTokenRequired: false}), {wrapper: OnyxListItemProvider});

        result.current({source: FILE_URL, file: {name: 'file.jpg'}});

        expect(mockFileDownload).toHaveBeenCalledWith(expect.anything(), FILE_URL, 'file.jpg', undefined, undefined, undefined, undefined, undefined, true);
    });
});
