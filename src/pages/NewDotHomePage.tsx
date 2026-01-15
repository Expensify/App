import React from 'react';
import {View} from 'react-native';
import ScreenWrapper from '@components/ScreenWrapper';
import useThemeStyles from '@hooks/useThemeStyles';

function NewDotHomePage() {
    const styles = useThemeStyles();

    return (
        <ScreenWrapper testID="NewDotHomePage">
            <View style={styles.flex1} />
        </ScreenWrapper>
    );
}

export default NewDotHomePage;
