import React, {useEffect, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import Button from '@components/Button';
import HeaderGap from '@components/HeaderGap';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';

type TestDriveBannerProps = {
    /** Callback to finish the test drive */
    onPress: () => void;
};

function TestDriveBanner({onPress}: TestDriveBannerProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();
    const [refreshKey, setRefreshKey] = useState(0);

    // Forcing a key change here forces React to fully re-mount this component
    // This helps reset the underlying drag region boundaries so that
    // interactive elements (like buttons) become clickable again after certain UI changes.
    // Without this, the OS-level drag region overlap clickable elements,
    // making them unresponsive until the container is refreshed.
    // For more context: https://github.com/Expensify/App/issues/68139
    useEffect(() => {
        const isDesktop = getPlatform() === CONST.PLATFORM.DESKTOP;

        if (!isDesktop) {
            return;
        }

        InteractionManager.runAfterInteractions(() => {
            setRefreshKey((prev) => prev + 1);
        });
    }, []);

    return (
        <View
            style={[styles.highlightBG]}
            dataSet={{dragArea: false}}
            key={refreshKey}
        >
            <HeaderGap styles={styles.testDriveBannerGap} />
            <View style={[styles.gap2, styles.alignItemsCenter, styles.flexRow, styles.justifyContentCenter, styles.h10]}>
                <Text>
                    {shouldUseNarrowLayout
                        ? translate('testDrive.banner.currentlyTestDrivingExpensify')
                        : `${translate('testDrive.banner.currentlyTestDrivingExpensify')}. ${translate('testDrive.banner.readyForTheRealThing')}`}
                </Text>
                <Button
                    text={translate('testDrive.banner.getStarted')}
                    small
                    success
                    onPress={onPress}
                />
            </View>
        </View>
    );
}

TestDriveBanner.displayName = 'TestDriveBanner';

export default TestDriveBanner;
