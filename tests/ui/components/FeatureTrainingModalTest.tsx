import {render, screen} from '@testing-library/react-native';
import type {ViewProps} from 'react-native';
import type ReactNative from 'react-native';
import ReceiptDoc from '@assets/images/receipt-doc.png';
import FeatureTrainingModal from '@components/FeatureTrainingModal';
import * as Illustrations from '@components/Icon/Illustrations';
import {FullScreenContextProvider} from '@components/VideoPlayerContexts/FullScreenContext';
import {PlaybackContextProvider} from '@components/VideoPlayerContexts/PlaybackContext';
import {VideoPopoverMenuContextProvider} from '@components/VideoPlayerContexts/VideoPopoverMenuContext';
import {VolumeContextProvider} from '@components/VideoPlayerContexts/VolumeContext';
import CONST from '@src/CONST';

const CONFIRM_TEXT = 'Start';

jest.mock('@libs/Navigation/Navigation', () => ({
    isTopmostRouteModalScreen: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    getActiveRouteWithoutParams: jest.fn(() => '/'),
    getActiveRoute: jest.fn(() => '/'),
}));

jest.mock('@libs/Fullstory');
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('expo-av', () => {
    const {View} = require<typeof ReactNative>('react-native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...jest.requireActual('expo-av'),
        // eslint-disable-next-line react/jsx-props-no-spreading
        Video: (props: ViewProps) => <View {...props} />,
    };
});

jest.mock('@components/ImageSVG', () => {
    const {View} = require<typeof ReactNative>('react-native');
    // eslint-disable-next-line react/jsx-props-no-spreading
    return (props: ViewProps) => <View {...props} />;
});

jest.unmock('react-native-reanimated');

describe('FeatureTrainingModal', () => {
    describe('renderIllustration', () => {
        it('renders video', () => {
            render(
                <PlaybackContextProvider>
                    <FullScreenContextProvider>
                        <VolumeContextProvider>
                            <VideoPopoverMenuContextProvider>
                                <FeatureTrainingModal
                                    confirmText={CONFIRM_TEXT}
                                    videoURL={CONST.WELCOME_VIDEO_URL}
                                />
                            </VideoPopoverMenuContextProvider>
                        </VolumeContextProvider>
                    </FullScreenContextProvider>
                </PlaybackContextProvider>,
            );

            expect(screen.getByTestId(CONST.VIDEO_PLAYER_TEST_ID)).toBeOnTheScreen();
        });
        it('renders svg image', () => {
            render(
                <FeatureTrainingModal
                    confirmText={CONFIRM_TEXT}
                    image={Illustrations.HoldExpense}
                />,
            );

            expect(screen.getByTestId(CONST.IMAGE_SVG_TEST_ID)).toBeOnTheScreen();
        });
        it('renders non-svg image', () => {
            render(
                <FeatureTrainingModal
                    confirmText={CONFIRM_TEXT}
                    image={ReceiptDoc}
                    shouldRenderSVG={false}
                />,
            );

            expect(screen.getByTestId(CONST.IMAGE_TEST_ID)).toBeOnTheScreen();
        });
        it('renders animation', () => {
            render(<FeatureTrainingModal confirmText={CONFIRM_TEXT} />);

            expect(screen.getByTestId(CONST.LOTTIE_VIEW_TEST_ID)).toBeOnTheScreen();
        });
    });
});
