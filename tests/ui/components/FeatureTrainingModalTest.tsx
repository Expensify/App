import {render, screen} from '@testing-library/react-native';
import type {ViewProps} from 'react-native';
import type ReactNative from 'react-native';
import Onyx from 'react-native-onyx';
import ReceiptDoc from '@assets/images/receipt-doc.png';
import ComposeProviders from '@components/ComposeProviders';
import FeatureTrainingModal from '@components/FeatureTrainingModal';
import {FullScreenContextProvider} from '@components/VideoPlayerContexts/FullScreenContext';
import {PlaybackContextProvider} from '@components/VideoPlayerContexts/PlaybackContext';
import {VideoPopoverMenuContextProvider} from '@components/VideoPlayerContexts/VideoPopoverMenuContext';
import {VolumeContextProvider} from '@components/VideoPlayerContexts/VolumeContext';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const CONFIRM_TEXT = 'Start';

jest.mock('@libs/Navigation/Navigation', () => ({
    isTopmostRouteModalScreen: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    getActiveRouteWithoutParams: jest.fn(() => '/'),
    getActiveRoute: jest.fn(() => '/'),
}));

jest.mock('@components/ImageSVG', () => {
    const {View} = require<typeof ReactNative>('react-native');
    // eslint-disable-next-line react/jsx-props-no-spreading
    return (props: ViewProps) => <View {...props} />;
});

describe('FeatureTrainingModal', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.NETWORK]: {
                    isOffline: false,
                },
            },
        });
    });
    describe('renderIllustration', () => {
        it('renders video', () => {
            render(
                <ComposeProviders components={[PlaybackContextProvider, FullScreenContextProvider, VolumeContextProvider, VideoPopoverMenuContextProvider]}>
                    <FeatureTrainingModal
                        confirmText={CONFIRM_TEXT}
                        videoURL={CONST.WELCOME_VIDEO_URL}
                    />
                </ComposeProviders>,
            );

            expect(screen.getByTestId(CONST.VIDEO_PLAYER_TEST_ID)).toBeOnTheScreen();
        });
        it('renders svg image', () => {
            function Component() {
                const illustrations = useMemoizedLazyIllustrations(['HoldExpense']);
                return (
                    <FeatureTrainingModal
                        confirmText={CONFIRM_TEXT}
                        image={illustrations.HoldExpense}
                    />
                );
            }

            render(<Component />);
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
