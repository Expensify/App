import ImageSVG from '@components/ImageSVG';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import useLocalize from '@src/hooks/useLocalize';

import {View} from 'react-native';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';

import type {CompassProps} from './MapViewTypes';

function Compass({interactive, shouldDisplayCompass, cameraRef, mapHeading}: CompassProps) {
    const styles = useThemeStyles();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Compass']);
    const {translate} = useLocalize();

    // Rotate the compass needle opposite to the map's bearing so it keeps pointing to true north.
    const compassAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{rotate: `${-mapHeading.get()}deg`}],
    }));

    const resetMapToNorth = () => {
        cameraRef.current?.setCamera({
            heading: 0,
            animationDuration: CONST.MAPBOX.ANIMATION_DURATION_ON_CENTER_ME,
        });
    };

    if (!interactive || !shouldDisplayCompass) {
        return null;
    }

    return (
        <View style={[styles.pAbsolute, styles.p5, styles.t0, styles.l0, styles.zIndex1]}>
            <PressableWithoutFeedback
                onPress={resetMapToNorth}
                accessibilityLabel={translate('common.resetMapToNorth')}
                role={CONST.ROLE.BUTTON}
                sentryLabel={CONST.SENTRY_LABEL.MAP_VIEW.COMPASS}
            >
                <Animated.View style={compassAnimatedStyle}>
                    <ImageSVG
                        src={expensifyIcons.Compass}
                        width={CONST.MAP_VIEW_COMPASS_SIZE.width}
                        height={CONST.MAP_VIEW_COMPASS_SIZE.height}
                    />
                </Animated.View>
            </PressableWithoutFeedback>
        </View>
    );
}

export default Compass;
