import {renderHook} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import fileDownload from '@libs/fileDownload';

import useDownloadAttachment from '@pages/media/AttachmentModalScreen/routes/hooks/useDownloadAttachment';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

jest.mock('@libs/fileDownload');

const mockFileDownload = jest.mocked(fileDownload);

const ENCRYPTED_TOKEN = 'testEncryptedToken123';
const FILE_URL = `${CONFIG.EXPENSIFY.EXPENSIFY_URL}chat-attachments/123/file.jpg`;
const ATTACKER_FILE_URL = 'https://attacker.example/file.pdf';

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

    it('should NOT add encryptedAuthToken to a search attachment URL outside Expensify, even when isAuthTokenRequired is true', async () => {
        // Given a search attachment whose route params ask for the token but whose source is on another host
        const {result} = renderHook(
            () =>
                useDownloadAttachment({
                    isAuthTokenRequired: true,
                    type: CONST.ATTACHMENT_TYPE.SEARCH,
                }),
            {wrapper: OnyxListItemProvider},
        );

        // When downloading the attachment
        result.current({source: ATTACKER_FILE_URL, file: {name: 'file.pdf'}});

        // Then the download opens the URL unchanged, so the token never reaches that host
        expect(mockFileDownload).toHaveBeenCalledWith(expect.anything(), ATTACKER_FILE_URL, 'file.pdf', undefined, undefined, undefined, undefined, undefined, true);
    });
});
