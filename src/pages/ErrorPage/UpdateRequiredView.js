import Header from '@components/Header';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import Button from '@components/Button';
import Text from '@components/Text';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Lottie from '@components/Lottie';
import LottieAnimations from '@components/LottieAnimations';

function UpdateRequiredView() {
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();

    // We need to know the platform of the user to determine what to show them
    // On web or mWeb, the user can simply refresh the page
    // On mobile, they will need to go to the app store
    // On desktop we can use the updater
    const updateApp = useCallback(() => {

    }, []);

    return (
        <View style={[styles.appBG, styles.h100]}>
            <View style={[styles.pt10, styles.ph5, !isSmallScreenWidth ? {} : {marginBottom: 120}]}>
                <Header
                    title="Update required"
                />
            </View>
            <View style={[styles.h100]}>
                <View style={[styles.flex1, !isSmallScreenWidth ? {alignItems: 'center', justifyContent: 'center', paddingBottom: 200} : {}]}>
                    <Lottie
                        source={LottieAnimations.Upgrade}
                        style={isSmallScreenWidth ? styles.w100 : {width: 450}}
                        webStyle={isSmallScreenWidth ? styles.w100 : {width: 450}}
                        autoPlay
                        loop
                    />
                    <View style={[styles.ph5, styles.alignItemsCenter, styles.mt5]}>
                        <View style={[{maxWidth: 300}]}>
                            <View style={[styles.mb3]}>
                                <Text style={[styles.newKansasLarge, styles.textAlignCenter]}>Please install the latest version of New Expensify</Text>
                            </View>
                            <View style={styles.mb5}>
                                <Text style={[styles.textAlignCenter]}>To get the latest changes, please download and install the latest version.</Text>
                            </View>
                        </View>
                    </View>
                    <Button
                        success
                        large
                        onPress={updateApp}
                        text="Update"
                        style={[!isSmallScreenWidth ? {width: 450} : styles.ph10]}
                    />
                </View>
            </View>
        </View>
    );
}

UpdateRequiredView.displayName = 'UpdateRequiredView';
export default UpdateRequiredView;
