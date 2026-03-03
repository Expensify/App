import type {PushPayload} from '@ua/react-native-airship';
import {iOS} from '@ua/react-native-airship';

const mockShouldShowPushNotification = jest.fn<boolean, [PushPayload]>();
jest.mock('@libs/Notification/PushNotification/shouldShowPushNotification', () => mockShouldShowPushNotification);

const mockGetIsMuted = jest.fn<boolean, []>();
jest.mock('@libs/Sound/BaseSound', () => ({
    getIsMuted: mockGetIsMuted,
}));

const fakePushPayload: PushPayload = {
    alert: 'test notification',
    extras: {payload: '{}'},
    notificationId: 'test-id',
    title: 'Test',
    subtitle: '',
};

type ForegroundCallback = (push: PushPayload) => Promise<iOS.ForegroundPresentationOption[] | null>;

function setupAndGetCallback(method: 'configureForegroundNotifications' | 'disableForegroundNotifications'): ForegroundCallback {
    let callback: ForegroundCallback | undefined;

    jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
        const AirshipModule = require('@ua/react-native-airship') as {default: {push: {iOS: {setForegroundPresentationOptionsCallback: jest.Mock}}}};
        const {setForegroundPresentationOptionsCallback} = AirshipModule.default.push.iOS;
        setForegroundPresentationOptionsCallback.mockClear();

        // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
        const ForegroundNotifications = require('@libs/Notification/PushNotification/ForegroundNotifications/index.ios') as {
            default: {configureForegroundNotifications: () => void; disableForegroundNotifications: () => void};
        };
        ForegroundNotifications.default[method]();

        const lastCall = setForegroundPresentationOptionsCallback.mock.calls.at(-1) as ForegroundCallback[] | undefined;
        callback = lastCall?.[0];
    });

    if (!callback) {
        throw new Error('Failed to capture foreground presentation options callback');
    }
    return callback;
}

describe('ForegroundNotifications iOS', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns empty array when notification should not be shown', async () => {
        mockShouldShowPushNotification.mockReturnValue(false);
        const callback = setupAndGetCallback('configureForegroundNotifications');

        const result = await callback(fakePushPayload);
        expect(result).toEqual([]);
    });

    it('returns null (default presentation with sound) when not muted', async () => {
        mockShouldShowPushNotification.mockReturnValue(true);
        mockGetIsMuted.mockReturnValue(false);
        const callback = setupAndGetCallback('configureForegroundNotifications');

        const result = await callback(fakePushPayload);
        expect(result).toBeNull();
    });

    it('returns List, Banner, Badge without Sound when muted', async () => {
        mockShouldShowPushNotification.mockReturnValue(true);
        mockGetIsMuted.mockReturnValue(true);
        const callback = setupAndGetCallback('configureForegroundNotifications');

        const result = await callback(fakePushPayload);
        expect(result).toEqual([iOS.ForegroundPresentationOption.List, iOS.ForegroundPresentationOption.Banner, iOS.ForegroundPresentationOption.Badge]);
    });

    it('disableForegroundNotifications sets callback that returns empty array', async () => {
        const callback = setupAndGetCallback('disableForegroundNotifications');

        const result = await callback(fakePushPayload);
        expect(result).toEqual([]);
    });
});
