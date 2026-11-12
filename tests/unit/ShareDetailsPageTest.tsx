import {act, render} from '@testing-library/react-native';

import {addAttachmentWithComment, addComment} from '@libs/actions/Report';
import {readFileAsync} from '@libs/fileDownload/FileUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {ShareNavigatorParamList} from '@libs/Navigation/types';

import ShareButton from '@pages/Share/ShareButton';
import ShareDetailsPage from '@pages/Share/ShareDetailsPage';

import CONST from '@src/CONST';
import mockOnyxKeys from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import type {StackScreenProps} from '@react-navigation/stack';

import React from 'react';

const mockAttachment = {content: 'file:///receipt.jpg', mimeType: CONST.SHARE_FILE_MIMETYPE.JPEG};

jest.mock('@hooks/useOnyx', () => (key: string) => [key === mockOnyxKeys.SHARE_TEMP_FILE ? mockAttachment : undefined]);
jest.mock('@hooks/useReportOrReportDraft', () => () => ({reportID: '123'}));
jest.mock('@hooks/useReportIsArchived', () => () => false);
jest.mock('@hooks/useAncestors', () => () => []);
jest.mock('@hooks/useReportAttributes', () => () => ({}));
jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: () => ({convertToDisplayString: jest.fn()})}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({accountID: 1}));
jest.mock('@hooks/useDelegateAccountID', () => () => undefined);
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: () => ({})}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@components/OnyxListItemProvider', () => ({usePersonalDetails: () => ({})}));
jest.mock('@libs/OptionsListUtils', () => ({getReportDisplayOption: () => ({})}));
jest.mock('@libs/ReceiptUtils', () => ({shouldValidateFile: () => false}));
jest.mock('@libs/actions/Report', () => ({addAttachmentWithComment: jest.fn(), addComment: jest.fn(), openReport: jest.fn()}));
jest.mock('@libs/fileDownload/FileUtils', () => ({getFileName: () => 'receipt.jpg', readFileAsync: jest.fn()}));
jest.mock('@libs/Navigation/Navigation', () => ({revealRouteBeforeDismissingModal: jest.fn()}));
jest.mock('@pages/Share/ShareRootPage', () => ({showErrorAlert: jest.fn()}));
jest.mock('@pages/Share/useShareFileSizeValidation', () => jest.fn());
jest.mock('@pages/Share/ShareButton', () => jest.fn(() => null));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/ScrollView', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/Pressable', () => ({PressableWithoutFeedback: ({children}: {children: React.ReactNode}) => children}));
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/BareUserListItem', () => jest.fn(() => null));
jest.mock('@components/AttachmentPreview', () => jest.fn(() => null));
jest.mock('@components/TextInput', () => jest.fn(() => null));
jest.mock('@components/Text', () => jest.fn(() => null));

const mockShareButton = jest.mocked(ShareButton);
const mockReadFileAsync = jest.mocked(readFileAsync);

function getShareButtonProps() {
    const props = mockShareButton.mock.calls.at(-1)?.[0];
    if (!props) {
        throw new Error('Share button was not rendered');
    }
    return props;
}

function renderShareDetailsPage() {
    const props: StackScreenProps<ShareNavigatorParamList, typeof SCREENS.SHARE.SHARE_DETAILS> = {
        route: {key: 'share-details', name: SCREENS.SHARE.SHARE_DETAILS, params: {reportOrAccountID: '123'}},
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- The page uses the mocked Navigation module, not the navigator prop.
        navigation: {} as StackScreenProps<ShareNavigatorParamList, typeof SCREENS.SHARE.SHARE_DETAILS>['navigation'],
    };
    render(<ShareDetailsPage {...props} />);
}

describe('ShareDetailsPage duplicate prevention', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockAttachment.mimeType = CONST.SHARE_FILE_MIMETYPE.JPEG;
    });

    it('reads and posts only one attachment, including taps before re-render and during dismissal', () => {
        // Given a file share whose read and navigation have not completed
        renderShareDetailsPage();
        const {onPress} = getShareButtonProps();

        // When multiple taps arrive before React can update the loading state
        act(() => {
            onPress();
            onPress();
        });

        // Then only one read starts and the button shows progress
        expect(mockReadFileAsync).toHaveBeenCalledTimes(1);
        expect(getShareButtonProps().isLoading).toBe(true);

        // When the read finishes but the page has not unmounted yet
        const file = new File(['receipt'], 'receipt.jpg', {type: 'image/jpeg'});
        act(() => {
            mockReadFileAsync.mock.calls[0]?.[2](file);
            getShareButtonProps().onPress();
        });

        // Then the completed share stays locked throughout dismissal
        expect(addAttachmentWithComment).toHaveBeenCalledTimes(1);
        expect(mockReadFileAsync).toHaveBeenCalledTimes(1);
        expect(Navigation.revealRouteBeforeDismissingModal).toHaveBeenCalledTimes(1);
    });

    it('allows retry after a file-read failure', () => {
        // Given an in-progress share
        renderShareDetailsPage();
        act(() => getShareButtonProps().onPress());

        // When the file cannot be read
        act(() => mockReadFileAsync.mock.calls[0]?.[3]?.(new Error('File unavailable')));

        // Then loading clears and another tap starts a new read without posting the failed file
        expect(getShareButtonProps().isLoading).toBe(false);
        act(() => getShareButtonProps().onPress());
        expect(mockReadFileAsync).toHaveBeenCalledTimes(2);
        expect(addAttachmentWithComment).not.toHaveBeenCalled();
    });

    it('posts shared text only once', () => {
        // Given shared text rather than an attachment
        Object.assign(mockAttachment, {mimeType: CONST.SHARE_FILE_MIMETYPE.TXT});
        renderShareDetailsPage();
        const {onPress} = getShareButtonProps();

        // When repeated taps arrive before dismissal
        act(() => {
            onPress();
            onPress();
        });

        // Then text and navigation are submitted once without a file read
        expect(addComment).toHaveBeenCalledTimes(1);
        expect(mockReadFileAsync).not.toHaveBeenCalled();
        expect(Navigation.revealRouteBeforeDismissingModal).toHaveBeenCalledTimes(1);
        expect(getShareButtonProps().isLoading).toBe(true);
    });
});
