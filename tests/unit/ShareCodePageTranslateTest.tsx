import {render} from '@testing-library/react-native';

import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import QRShareWithDownload from '@components/QRShare/QRShareWithDownload';

import {findLocalAvatarForURL} from '@libs/Avatars/AvatarLookup';
import type * as AvatarLookup from '@libs/Avatars/AvatarLookup';
import {getDisplayNameForParticipant} from '@libs/ReportUtils';

import ShareCodePage from '@pages/ShareCodePage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {SvgProps} from 'react-native-svg';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const mockTranslate = jest.fn((path: string) => path);
const mockFormatPhoneNumber = jest.fn((value: string) => value);

jest.mock('@hooks/useLocalize', () => () => ({translate: mockTranslate, formatPhoneNumber: mockFormatPhoneNumber}));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => new Proxy({}, {get: (_, name) => String(name)}),
}));

jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/QRShare/QRShareWithDownload', () => jest.fn(() => null));
jest.mock('@components/ContextMenuItem', () => jest.fn(() => null));
jest.mock('@components/MenuItem', () => jest.fn(() => null));

jest.mock('@libs/Avatars/AvatarLookup', () => ({
    ...jest.requireActual<typeof AvatarLookup>('@libs/Avatars/AvatarLookup'),
    findLocalAvatarForURL: jest.fn(),
}));

jest.mock('@libs/ReportUtils', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/ReportUtils');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        __esModule: true,
        getDisplayNameForParticipant: jest.fn(() => 'SPY_NAME'),
    };
});

const mockGetDisplayNameForParticipant = jest.mocked(getDisplayNameForParticipant);
const mockFindLocalAvatarForURL = jest.mocked(findLocalAvatarForURL);
const mockQRShareWithDownload = jest.mocked(QRShareWithDownload);

const PARTICIPANT_A = 717001;
const PARTICIPANT_B = 717002;

describe('ShareCodePage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    it('resolves money request participant names through the translate function from useLocalize', async () => {
        // A money request (IOU) report renders its subtitle from participant display names.
        const iouReport: Report = {
            reportID: '717100',
            type: CONST.REPORT.TYPE.IOU,
            ownerAccountID: PARTICIPANT_A,
            managerID: PARTICIPANT_B,
            participants: {
                [PARTICIPANT_A]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                [PARTICIPANT_B]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`, iouReport);
        await waitForBatchedUpdates();

        render(
            <OnyxListItemProvider>
                <ShareCodePage report={iouReport} />
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdates();

        // Each participant's name resolves via getDisplayNameForParticipant, which must receive the translate from useLocalize.
        expect(mockGetDisplayNameForParticipant).toHaveBeenCalledWith(expect.objectContaining({translate: mockTranslate}));
    });

    describe('profile QR code avatar logo', () => {
        it('wraps catalog-backed avatars in an SVG logo that only forwards an explicitly set fill', async () => {
            const localAvatar: React.FC<SvgProps> = jest.fn(() => null);
            const localAvatarMock = jest.mocked(localAvatar);
            mockFindLocalAvatarForURL.mockReturnValue(localAvatar);

            render(
                <OnyxListItemProvider>
                    <ShareCodePage />
                </OnyxListItemProvider>,
            );
            await waitForBatchedUpdates();

            const qrProps = mockQRShareWithDownload.mock.calls.at(-1)?.[0];
            // A locally bundled avatar renders as an SVG logo instead of a URL-based logo.
            expect(qrProps?.logo).toBeUndefined();
            const SvgLogo = qrProps?.svgLogo;
            if (!SvgLogo) {
                throw new Error('Expected QRShareWithDownload to receive an svgLogo');
            }

            // Without a fill prop, the wrapper must not spread fill onto the avatar — an undefined fill
            // would strip root attributes like fill="none" and paint stroke-only paths black.
            render(
                <SvgLogo
                    width={24}
                    height={24}
                />,
            );
            expect(localAvatarMock).toHaveBeenCalled();
            expect(localAvatarMock.mock.calls.at(-1)?.[0]).not.toHaveProperty('fill');
            expect(localAvatarMock.mock.calls.at(-1)?.[0]).toMatchObject({width: 24, height: 24});

            // An explicitly set fill is forwarded unchanged.
            render(
                <SvgLogo
                    fill="#00FF00"
                    width={24}
                    height={24}
                />,
            );
            expect(localAvatarMock.mock.calls.at(-1)?.[0]).toMatchObject({fill: '#00FF00', width: 24, height: 24});
        });

        it('falls back to the avatar URL logo when no local catalog avatar matches', async () => {
            mockFindLocalAvatarForURL.mockReturnValue(undefined);

            // A user-uploaded avatar has no bundled local SVG, so the QR logo must come from its URL.
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: PARTICIPANT_A, email: 'user@example.com'});
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [PARTICIPANT_A]: {accountID: PARTICIPANT_A, avatar: 'https://example.com/images/avatar_custom.png'},
            });
            await waitForBatchedUpdates();

            render(
                <OnyxListItemProvider>
                    <CurrentUserPersonalDetailsProvider>
                        <ShareCodePage />
                    </CurrentUserPersonalDetailsProvider>
                </OnyxListItemProvider>,
            );
            await waitForBatchedUpdates();

            const qrProps = mockQRShareWithDownload.mock.calls.at(-1)?.[0];
            expect(qrProps?.svgLogo).toBeUndefined();
            expect(qrProps?.logo).toBeDefined();
        });
    });
});
