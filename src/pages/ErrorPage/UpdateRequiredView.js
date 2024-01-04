import Header from '@components/Header';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import Button from '@components/Button';
import Text from '@components/Text';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import useWindowDimensions from '@hooks/useWindowDimensions';

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
        <View style={styles.flex1}>
            <View style={[styles.appBG]}>
                {isSmallScreenWidth && (
                    <View style={[styles.pt10, styles.ph5, {marginBottom: 100}]}>
                        <Header
                            title="Update required"
                        />
                    </View>
                )}
                <View style={[styles.flex1]}>
                    <Icon
                        src={Expensicons.EmptyStateUpdateRocket}
                        width="100%"
                        height="100%"
                        fill="transparent"
                        additionalStyles={[styles.mb10]}
                    />
                    <View style={[styles.ph5, styles.alignItemsCenter]}>
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
                        style={[styles.ph10]}
                    />
                </View>
            </View>
        </View>
    );
}

UpdateRequiredView.displayName = 'UpdateRequiredView';
export default UpdateRequiredView;
