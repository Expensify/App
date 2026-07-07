import {render, screen} from '@testing-library/react-native';

import Avatar from '@components/Avatar';
import AvatarUser from '@components/Avatar/AvatarUser';
import AvatarWorkspace from '@components/Avatar/AvatarWorkspace';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesContextProvider';

import {USER_AVATARS} from '@libs/Avatars/UserAvatarCatalog';
import {getDefaultWorkspaceAvatarTestID} from '@libs/ReportUtils';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const UPLOADED_AVATAR_URL = 'https://example.com/uploaded-avatar.jpg';
const DEFAULT_AVATAR_URL = USER_AVATARS.entries['default-avatar_1'].url;
const LETTER_AVATAR_INITIALS = 'JD';
const LETTER_AVATAR_URL = `${CONST.CLOUDFRONT_URL}${CONST.GENERATED_LETTER_AVATAR_PATH}v1/blue100/${LETTER_AVATAR_INITIALS}.png`;
const SMALL_LETTER_AVATAR_URL = `${CONST.CLOUDFRONT_URL}${CONST.GENERATED_LETTER_AVATAR_PATH}v1/blue100/${LETTER_AVATAR_INITIALS}_128.png`;
const FALLBACK_ICON_TEST_ID = 'SvgFallbackAvatar Icon';
const CUSTOM_FALLBACK_ICON_TEST_ID = 'CustomFallback Icon';
const AVATAR_IMAGE_TEST_ID = 'AvatarImage';
const WORKSPACE_NAME = "Cathy's Croissants";

function CustomFallbackIcon() {
    return mockRenderView({testID: 'CustomFallbackIconSvg'});
}

// Captures the mocked <Image>'s onError callback so tests can simulate a failed image load.
const mockImageErrorHandlerRef: {current?: () => void} = {current: undefined};

// Renders a bare React Native <View> as a stand-in for a mocked component. Prefixed with
// `mock` so the hoisted jest.mock factories below are allowed to reference it.
function mockRenderView({testID, accessibilityLabel}: {testID?: string; accessibilityLabel?: string}) {
    return (
        <View
            testID={testID}
            accessibilityLabel={accessibilityLabel}
        />
    );
}

jest.mock('@hooks/useLazyAsset', () => {
    function FallbackAvatar() {
        return mockRenderView({testID: 'MockFallbackAvatar'});
    }

    return {
        useMemoizedLazyExpensifyIcons: () => ({
            ConciergeAvatar: FallbackAvatar,
            NotificationsAvatar: FallbackAvatar,
            FallbackAvatar,
        }),
    };
});

jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));

jest.mock('@components/Image', () => {
    function MockImage({source, onError}: {source?: {uri?: string}; onError?: () => void}) {
        mockImageErrorHandlerRef.current = onError;
        return mockRenderView({testID: 'AvatarImage', accessibilityLabel: source?.uri});
    }

    return {__esModule: true, default: MockImage};
});

function ThemeProviderWithLight({children}: {children: React.ReactNode}) {
    return <ThemeProvider theme="light">{children}</ThemeProvider>;
}

const hiddenElementOptions = {includeHiddenElements: true};

function getHiddenTestId(testID: string) {
    return screen.getByTestId(testID, hiddenElementOptions);
}

function queryHiddenTestId(testID: string) {
    return screen.queryByTestId(testID, hiddenElementOptions);
}

function renderAvatar(props: React.ComponentProps<typeof Avatar>) {
    return render(
        <ComposeProviders components={[ThemeProviderWithLight, ThemeStylesProvider, OnyxListItemProvider, LocaleContextProvider]}>
            <Avatar {...props} />
        </ComposeProviders>,
    );
}

describe('Avatar', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockImageErrorHandlerRef.current = undefined;
    });

    describe('user avatar', () => {
        it('renders the Image branch for an uploaded URL source', async () => {
            renderAvatar({
                type: CONST.ICON_TYPE_AVATAR,
                source: UPLOADED_AVATAR_URL,
                avatarID: 1,
            });

            await waitForBatchedUpdates();

            expect(screen.getByTestId('Avatar')).toBeTruthy();
            expect(screen.getByTestId(AVATAR_IMAGE_TEST_ID)).toBeTruthy();
            expect(screen.getByTestId(AVATAR_IMAGE_TEST_ID).props.accessibilityLabel).toBe(UPLOADED_AVATAR_URL);
            expect(queryHiddenTestId(FALLBACK_ICON_TEST_ID)).toBeNull();
        });

        it('renders the Icon branch for a default catalog avatar URL', async () => {
            renderAvatar({
                type: CONST.ICON_TYPE_AVATAR,
                source: DEFAULT_AVATAR_URL,
                avatarID: 1,
            });

            await waitForBatchedUpdates();

            expect(screen.queryByTestId(AVATAR_IMAGE_TEST_ID)).toBeNull();
            expect(getHiddenTestId(FALLBACK_ICON_TEST_ID)).toBeTruthy();
        });

        it('renders the fallback Icon when no source is provided', async () => {
            renderAvatar({
                type: CONST.ICON_TYPE_AVATAR,
                avatarID: 1,
            });

            await waitForBatchedUpdates();

            expect(screen.queryByTestId(AVATAR_IMAGE_TEST_ID)).toBeNull();
            expect(getHiddenTestId(FALLBACK_ICON_TEST_ID)).toBeTruthy();
        });

        it('switches from the Image branch to the fallback Icon when the image fails to load', async () => {
            renderAvatar({
                type: CONST.ICON_TYPE_AVATAR,
                source: UPLOADED_AVATAR_URL,
                avatarID: 1,
            });

            await waitForBatchedUpdates();

            expect(screen.getByTestId(AVATAR_IMAGE_TEST_ID)).toBeTruthy();
            expect(queryHiddenTestId(FALLBACK_ICON_TEST_ID)).toBeNull();

            mockImageErrorHandlerRef.current?.();

            await waitForBatchedUpdates();

            expect(screen.queryByTestId(AVATAR_IMAGE_TEST_ID)).toBeNull();
            expect(getHiddenTestId(FALLBACK_ICON_TEST_ID)).toBeTruthy();
        });

        it('renders the custom fallback Icon when no source is provided', async () => {
            renderAvatar({
                type: CONST.ICON_TYPE_AVATAR,
                avatarID: 1,
                fallbackIcon: CustomFallbackIcon,
                fallbackIconTestID: CUSTOM_FALLBACK_ICON_TEST_ID,
            });

            await waitForBatchedUpdates();

            expect(screen.queryByTestId(AVATAR_IMAGE_TEST_ID)).toBeNull();
            expect(getHiddenTestId(CUSTOM_FALLBACK_ICON_TEST_ID)).toBeTruthy();
            expect(queryHiddenTestId(FALLBACK_ICON_TEST_ID)).toBeNull();
        });

        it('switches from the Image branch to the custom fallback Icon when the image fails to load', async () => {
            renderAvatar({
                type: CONST.ICON_TYPE_AVATAR,
                source: UPLOADED_AVATAR_URL,
                avatarID: 1,
                fallbackIcon: CustomFallbackIcon,
                fallbackIconTestID: CUSTOM_FALLBACK_ICON_TEST_ID,
            });

            await waitForBatchedUpdates();

            expect(screen.getByTestId(AVATAR_IMAGE_TEST_ID)).toBeTruthy();
            expect(queryHiddenTestId(CUSTOM_FALLBACK_ICON_TEST_ID)).toBeNull();
            expect(queryHiddenTestId(FALLBACK_ICON_TEST_ID)).toBeNull();

            mockImageErrorHandlerRef.current?.();

            await waitForBatchedUpdates();

            expect(screen.queryByTestId(AVATAR_IMAGE_TEST_ID)).toBeNull();
            expect(getHiddenTestId(CUSTOM_FALLBACK_ICON_TEST_ID)).toBeTruthy();
            expect(queryHiddenTestId(FALLBACK_ICON_TEST_ID)).toBeNull();
        });

        it('renders locally drawn initials for a generated letter-avatar URL instead of fetching the image', async () => {
            renderAvatar({
                type: CONST.ICON_TYPE_AVATAR,
                source: LETTER_AVATAR_URL,
                avatarID: 1,
            });

            await waitForBatchedUpdates();

            expect(screen.getByText(LETTER_AVATAR_INITIALS, hiddenElementOptions)).toBeTruthy();
            expect(screen.queryByTestId(AVATAR_IMAGE_TEST_ID)).toBeNull();
            expect(queryHiddenTestId(FALLBACK_ICON_TEST_ID)).toBeNull();
        });

        it('renders locally drawn initials for the small-size (_128) letter-avatar URL variant', async () => {
            renderAvatar({
                type: CONST.ICON_TYPE_AVATAR,
                source: SMALL_LETTER_AVATAR_URL,
                avatarID: 1,
            });

            await waitForBatchedUpdates();

            expect(screen.getByText(LETTER_AVATAR_INITIALS, hiddenElementOptions)).toBeTruthy();
            expect(screen.queryByTestId(AVATAR_IMAGE_TEST_ID)).toBeNull();
        });
    });

    describe('workspace avatar', () => {
        it('renders the Image branch for a letter-avatar URL because initials are user-avatar-only', async () => {
            renderAvatar({
                type: CONST.ICON_TYPE_WORKSPACE,
                source: LETTER_AVATAR_URL,
                name: WORKSPACE_NAME,
                avatarID: 'policy_123',
            });

            await waitForBatchedUpdates();

            expect(screen.getByTestId(AVATAR_IMAGE_TEST_ID)).toBeTruthy();
            expect(screen.queryByText(LETTER_AVATAR_INITIALS, hiddenElementOptions)).toBeNull();
        });

        it('renders the Image branch for an uploaded workspace logo URL', async () => {
            renderAvatar({
                type: CONST.ICON_TYPE_WORKSPACE,
                source: UPLOADED_AVATAR_URL,
                name: WORKSPACE_NAME,
                avatarID: 'policy_123',
            });

            await waitForBatchedUpdates();

            expect(screen.getByTestId(AVATAR_IMAGE_TEST_ID)).toBeTruthy();
            expect(screen.getByTestId(AVATAR_IMAGE_TEST_ID).props.accessibilityLabel).toBe(UPLOADED_AVATAR_URL);
            expect(queryHiddenTestId(getDefaultWorkspaceAvatarTestID(WORKSPACE_NAME))).toBeNull();
        });

        it('renders the default workspace Icon when no source is provided', async () => {
            const workspaceFallbackTestID = getDefaultWorkspaceAvatarTestID(WORKSPACE_NAME);

            renderAvatar({
                type: CONST.ICON_TYPE_WORKSPACE,
                name: WORKSPACE_NAME,
                avatarID: 'policy_123',
            });

            await waitForBatchedUpdates();

            expect(screen.queryByTestId(AVATAR_IMAGE_TEST_ID)).toBeNull();
            expect(getHiddenTestId(workspaceFallbackTestID)).toBeTruthy();
        });

        it('switches from the Image branch to the default workspace Icon when the uploaded logo fails to load', async () => {
            const workspaceFallbackTestID = getDefaultWorkspaceAvatarTestID(WORKSPACE_NAME);

            renderAvatar({
                type: CONST.ICON_TYPE_WORKSPACE,
                source: UPLOADED_AVATAR_URL,
                name: WORKSPACE_NAME,
                avatarID: 'policy_123',
            });

            await waitForBatchedUpdates();

            expect(screen.getByTestId(AVATAR_IMAGE_TEST_ID)).toBeTruthy();
            expect(queryHiddenTestId(workspaceFallbackTestID)).toBeNull();

            mockImageErrorHandlerRef.current?.();

            await waitForBatchedUpdates();

            expect(screen.queryByTestId(AVATAR_IMAGE_TEST_ID)).toBeNull();
            expect(getHiddenTestId(workspaceFallbackTestID)).toBeTruthy();
        });
    });

    describe('AvatarUser and AvatarWorkspace', () => {
        it('AvatarUser renders the same as the back-compat default for user avatars', async () => {
            render(
                <ComposeProviders components={[ThemeProviderWithLight, ThemeStylesProvider, OnyxListItemProvider, LocaleContextProvider]}>
                    <AvatarUser
                        source={UPLOADED_AVATAR_URL}
                        avatarID={1}
                    />
                </ComposeProviders>,
            );

            await waitForBatchedUpdates();

            expect(screen.getByTestId('Avatar')).toBeTruthy();
            expect(screen.getByTestId(AVATAR_IMAGE_TEST_ID)).toBeTruthy();
        });

        it('AvatarWorkspace renders the same as the back-compat default for workspace avatars', async () => {
            const workspaceFallbackTestID = getDefaultWorkspaceAvatarTestID(WORKSPACE_NAME);

            render(
                <ComposeProviders components={[ThemeProviderWithLight, ThemeStylesProvider, OnyxListItemProvider, LocaleContextProvider]}>
                    <AvatarWorkspace
                        name={WORKSPACE_NAME}
                        avatarID="policy_123"
                    />
                </ComposeProviders>,
            );

            await waitForBatchedUpdates();

            expect(screen.queryByTestId(AVATAR_IMAGE_TEST_ID)).toBeNull();
            expect(getHiddenTestId(workspaceFallbackTestID)).toBeTruthy();
        });
    });
});
