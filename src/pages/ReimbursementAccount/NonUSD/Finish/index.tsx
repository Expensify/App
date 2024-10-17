import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';

function Finish() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const handleBackButtonPress = () => {
        Navigation.goBack();
    };

    return (
        <ScreenWrapper
            testID={Finish.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('finishStep.connect')}
                onBackButtonPress={handleBackButtonPress}
            />
            <ScrollView style={[styles.flex1]} />
        </ScreenWrapper>
    );
}

Finish.displayName = 'Finish';

export default Finish;
