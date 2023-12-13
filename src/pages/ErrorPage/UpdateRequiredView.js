import Header from '@components/Header';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import useThemeStyles from '@styles/useThemeStyles';
import Button from '@components/Button';
import Text from '@components/Text';

function UpdateRequiredView() {
    const styles = useThemeStyles();

    // We need to know the platform of the user to determine what to show them
    // On web or mWeb, the user can simply refresh the page
    // On mobile, they will need to go to the app store
    // On desktop we can use the updater
    const updateApp = useCallback(() => {

    }, []);
    return (
        <>
            <Header
                title="Update required"
            />
            <View style={styles.mb5}>
                <Text>To get the latest changes, please download and install the latest version.</Text>
            </View>
            <View style={[styles.flexRow]}>
                <View style={[styles.flex1, styles.flexRow]}>
                    <Button
                        success
                        medium
                        onPress={updateApp}
                        text="Update"
                        style={styles.mr3}
                    />
                </View>
            </View>
        </>
    )
}

UpdateRequiredView.displayName = 'UpdateRequiredView';
export default UpdateRequiredView;
