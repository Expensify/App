import Header from '@components/Header';
import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import Button from '@components/Button';
import Text from '@components/Text';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Lottie from '@components/Lottie';
import LottieAnimations from '@components/LottieAnimations';
import * as AppUpdate from '@libs/actions/AppUpdate';

function UpdateRequiredView() {
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();
    return (
        <View style={[styles.appBG, styles.h100]}>
            <View style={[styles.pt10, styles.ph5]}>
                <Header
                    title="Update required"
                />
            </View>
            <View style={[styles.flex1, styles.h100, {alignItems: 'center', justifyContent: 'center', paddingBottom: 160}]}>
                <Lottie
                    source={LottieAnimations.Upgrade}
                    style={isSmallScreenWidth ? styles.w100 : {width: 390, height: 240}}
                    webStyle={isSmallScreenWidth ? styles.w100 : {width: 390, height: 240}}
                    autoPlay
                    loop
                />
                <View style={[styles.ph5, styles.alignItemsCenter, styles.mt5]}>
                    <View style={[{maxWidth: 310}]}>
                        <View style={[styles.mb3]}>
                            <Text style={[styles.newKansasLarge, styles.textAlignCenter]}>Please install the latest version of New Expensify</Text>
                        </View>
                        <View style={styles.mb5}>
                            <Text style={[styles.textAlignCenter, styles.textSupporting]}>To get the latest changes, please download and install the latest version.</Text>
                        </View>
                    </View>
                </View>
                <Button
                    success
                    large
                    onPress={() => AppUpdate.updateApp()}
                    text="Update"
                    style={[{width: 310}]}
                />
            </View>
        </View>
    );
}

UpdateRequiredView.displayName = 'UpdateRequiredView';
export default UpdateRequiredView;
