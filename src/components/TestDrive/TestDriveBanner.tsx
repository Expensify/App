import Button from '@components/ButtonComposed';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

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
            <View style={[styles.gap2, styles.alignItemsCenter, styles.flexRow, styles.justifyContentCenter, styles.h10]}>
                <Text>
                    {shouldUseNarrowLayout
                        ? translate('testDrive.banner.currentlyTestDrivingExpensify')
                        : `${translate('testDrive.banner.currentlyTestDrivingExpensify')}. ${translate('testDrive.banner.readyForTheRealThing')}`}
                </Text>
                <Button
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    size={CONST.BUTTON_SIZE.SMALL}
                    onPress={onPress}
                >
                    <Button.Text>{translate('testDrive.banner.getStarted')}</Button.Text>
                </Button>
            </View>
        </View>
    );
}

export default TestDriveBanner;
