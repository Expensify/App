import {render} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import ImageRenderer from '@components/HTMLEngineProvider/HTMLRenderers/ImageRenderer';
import Image from '@components/Image';
import BaseImageNative from '@components/Image/BaseImage.native';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {ShowContextMenuActionsContext, ShowContextMenuStateContext} from '@components/ShowContextMenuContext';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesContextProvider';
import ThumbnailImage from '@components/ThumbnailImage';

import CONST from '@src/CONST';

import type {ImageProps as ExpoImageProps} from 'expo-image';

import React from 'react';

// Jest resolves the bare module name to the .native file, so the web file is loaded by its full name
const BaseImageWeb = jest.requireActual<{default: typeof BaseImageNative}>('@components/Image/BaseImage.tsx').default;

const mockExpoImage = jest.fn<null, [props: ExpoImageProps]>(() => null);

jest.mock('expo-image', () => ({
    get Image() {
        return mockExpoImage;
    },
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    navigate: jest.fn(),
}));

// A freshly sent attachment renders the same picture from three URIs in a row
const PICKER_URI = 'file:///data/user/0/com.expensify.chat/files/picked.jpg';
const CACHE_URI = 'file:///data/user/0/com.expensify.chat/cache/attachments/1234.jpg';
const REMOTE_URI = 'https://www.expensify.com/chat-attachments/1234/picked.jpg.1024.jpg';
const ATTACHMENT_ID = '1234';
// A markdown image points anywhere; it never carries the attachment source attribute
const MARKDOWN_URI = 'https://example.com/photo.jpg';

function ThemeProviderWithLight({children}: {children: React.ReactNode}) {
    return <ThemeProvider theme="light">{children}</ThemeProvider>;
}

function renderWithProviders(element: React.ReactElement) {
    return render(<ComposeProviders components={[ThemeProviderWithLight, ThemeStylesProvider, OnyxListItemProvider, LocaleContextProvider]}>{element}</ComposeProviders>);
}

function sourceUri(props: ExpoImageProps): string | undefined {
    const {source} = props;
    if (typeof source === 'object' && source !== null && !Array.isArray(source) && 'uri' in source) {
        return source.uri;
    }
    return undefined;
}

function expoImageProps(): ExpoImageProps[] {
    return mockExpoImage.mock.calls.map(([props]) => props);
}

function lastExpoImageProps(): ExpoImageProps {
    const props = expoImageProps().at(-1);
    if (!props) {
        throw new Error('expo-image was not rendered');
    }
    return props;
}

describe('Image recyclingKey', () => {
    beforeEach(() => {
        mockExpoImage.mockClear();
    });

    describe('BaseImage on native', () => {
        it('keys the view on the source URI when no recyclingKey is given', () => {
            render(<BaseImageNative source={{uri: PICKER_URI}} />);

            expect(lastExpoImageProps().recyclingKey).toBe(PICKER_URI);
        });

        it('keeps the given recyclingKey while the same picture moves from the picker path to the cache copy to the remote URL', () => {
            const {rerender} = render(
                <BaseImageNative
                    source={{uri: PICKER_URI}}
                    recyclingKey={ATTACHMENT_ID}
                />,
            );
            rerender(
                <BaseImageNative
                    source={{uri: CACHE_URI}}
                    recyclingKey={ATTACHMENT_ID}
                />,
            );
            rerender(
                <BaseImageNative
                    source={{uri: REMOTE_URI}}
                    recyclingKey={ATTACHMENT_ID}
                />,
            );

            const rendered = expoImageProps();
            expect(rendered.map(sourceUri)).toEqual([PICKER_URI, CACHE_URI, REMOTE_URI]);
            expect(new Set(rendered.map((props) => props.recyclingKey))).toEqual(new Set([ATTACHMENT_ID]));
        });

        it('falls back to the source URI when recyclingKey is passed as undefined', () => {
            render(
                <BaseImageNative
                    source={{uri: PICKER_URI}}
                    recyclingKey={undefined}
                />,
            );

            expect(lastExpoImageProps().recyclingKey).toBe(PICKER_URI);
        });
    });

    describe('BaseImage on web', () => {
        it('ignores recyclingKey and keeps the key derived from the source', () => {
            render(
                <BaseImageWeb
                    source={{uri: REMOTE_URI}}
                    recyclingKey={ATTACHMENT_ID}
                />,
            );

            expect(lastExpoImageProps().recyclingKey).toBe(REMOTE_URI);
        });
    });

    describe('Image', () => {
        it('re-renders the view when only recyclingKey changes and the source object is reused', () => {
            const source = {uri: PICKER_URI};
            const {rerender} = renderWithProviders(
                // eslint-disable-next-line react-native-a11y/has-valid-accessibility-ignores-invert-colors -- Custom Image wrapper does not support this prop.
                <Image
                    source={source}
                    recyclingKey="first"
                />,
            );
            rerender(
                <ComposeProviders components={[ThemeProviderWithLight, ThemeStylesProvider, OnyxListItemProvider, LocaleContextProvider]}>
                    {/* eslint-disable-next-line react-native-a11y/has-valid-accessibility-ignores-invert-colors -- Custom Image wrapper does not support this prop. */}
                    <Image
                        source={source}
                        recyclingKey="second"
                    />
                </ComposeProviders>,
            );

            expect(lastExpoImageProps().recyclingKey).toBe('second');
        });
    });

    describe('ThumbnailImage', () => {
        it('passes recyclingKey down to the image view', () => {
            renderWithProviders(
                <ThumbnailImage
                    previewSourceURL={PICKER_URI}
                    isAuthTokenRequired
                    recyclingKey={ATTACHMENT_ID}
                />,
            );

            expect(lastExpoImageProps().recyclingKey).toBe(ATTACHMENT_ID);
            expect(sourceUri(lastExpoImageProps())).toBe(PICKER_URI);
        });
    });

    describe('ImageRenderer', () => {
        const contextMenuState = {
            anchor: null,
            report: undefined,
            action: undefined,
            transactionThreadReport: undefined,
            isDisabled: true,
        };
        const contextMenuActions = {
            checkIfContextMenuActive: () => {},
            onShowContextMenu: (callback: () => void) => callback(),
        };

        function renderImage(attributes: Record<string, string>) {
            return renderWithProviders(
                <ShowContextMenuStateContext.Provider value={contextMenuState}>
                    <ShowContextMenuActionsContext.Provider value={contextMenuActions}>
                        {/* @ts-expect-error - only the attributes are needed for this test */}
                        <ImageRenderer tnode={{attributes}} />
                    </ShowContextMenuActionsContext.Provider>
                </ShowContextMenuStateContext.Provider>,
            );
        }

        it('keys an attachment thumbnail on its attachment ID', () => {
            renderImage({
                src: PICKER_URI,
                [CONST.ATTACHMENT_SOURCE_ATTRIBUTE]: PICKER_URI,
                [CONST.ATTACHMENT_ID_ATTRIBUTE]: ATTACHMENT_ID,
            });

            expect(lastExpoImageProps().recyclingKey).toBe(ATTACHMENT_ID);
        });

        it('keeps the URI key for an image with no attachment ID', () => {
            renderImage({src: MARKDOWN_URI});

            expect(lastExpoImageProps().recyclingKey).toBe(MARKDOWN_URI);
        });

        it('keeps the URI key for a markdown image that only carries a positional attachment ID', () => {
            // getHtmlWithAttachmentID gives every image without an ID a `<reportActionID>_<n>` one, and an edit can put a
            // different picture at the same position, so that ID is not a picture identity
            renderImage({
                src: MARKDOWN_URI,
                [CONST.ATTACHMENT_ID_ATTRIBUTE]: '4321_1',
            });

            expect(lastExpoImageProps().recyclingKey).toBe(MARKDOWN_URI);
        });
    });
});
