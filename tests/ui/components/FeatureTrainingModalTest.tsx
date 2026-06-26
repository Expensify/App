import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {render, screen} from '@testing-library/react-native';
import type {ViewProps} from 'react-native';
import type ReactNative from 'react-native';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import FeatureTrainingModal from '@components/FeatureTrainingModal';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import FullScreenContextProvider from '@components/VideoPlayerContexts/FullScreenContextProvider';
import {PlaybackContextProvider} from '@components/VideoPlayerContexts/PlaybackContext';
import {VideoPopoverMenuContextProvider} from '@components/VideoPlayerContexts/VideoPopoverMenuContext';
import {VolumeContextProvider} from '@components/VideoPlayerContexts/VolumeContext';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

const CONFIRM_TEXT = 'Start';

jest.mock('@libs/Navigation/Navigation', () => ({
    isTopmostRouteModalScreen: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    getActiveRouteWithoutParams: jest.fn(() => '/'),
    getActiveRoute: jest.fn(() => '/'),
}));

jest.mock('@components/ImageSVG', () => {
    const {View} = require<typeof ReactNative>('react-native');

    return (props: ViewProps) => <View {...props} />;
});

const Stack = createStackNavigator();

function withNavigation(ui: React.ReactElement): React.ReactElement {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name={SCREENS.FEATURE_TRAINING_ROOT}>{() => ui}</Stack.Screen>
            </Stack.Navigator>
        </NavigationContainer>
    );
}

describe('FeatureTrainingModal', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });
    describe('renderIllustration', () => {
        it('renders video', () => {
            render(
                withNavigation(
                    <ComposeProviders components={[OnyxListItemProvider, PlaybackContextProvider, FullScreenContextProvider, VolumeContextProvider, VideoPopoverMenuContextProvider]}>
                        <FeatureTrainingModal
                            confirmText={CONFIRM_TEXT}
                            videoURL={CONST.FEATURE_TRAINING['track-expenses'].VIDEO_URL}
                        />
                    </ComposeProviders>,
                ),
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

            render(withNavigation(<Component />));
            expect(screen.getByTestId(CONST.IMAGE_SVG_TEST_ID)).toBeOnTheScreen();
        });
        it('renders animation', () => {
            render(withNavigation(<FeatureTrainingModal confirmText={CONFIRM_TEXT} />));

            expect(screen.getByTestId(CONST.LOTTIE_VIEW_TEST_ID)).toBeOnTheScreen();
        });
    });
});
