import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderGap from '@components/HeaderGap';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

type TestDriveBannerProps = {
    /** Callback to finish the test drive */
    onPress: () => void;
};

function TestDriveBanner({onPress}: TestDriveBannerProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();

    return (
        <View style={styles.highlightBG}>
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
