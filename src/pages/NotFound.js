import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import styles from '../styles/styles';
import logo from '../../assets/images/expensify-logo_reversed.png';
import ROUTES from '../ROUTES';
import CustomStatusBar from '../components/CustomStatusBar';
import Navigator from '../Navigator';

const NotFound = () => (
    <>
        <CustomStatusBar />
        <SafeAreaView
            style={styles.notFoundSafeArea}
        >
            <View style={styles.notFoundView}>
                <Image
                    resizeMode="contain"
                    style={styles.notFoundLogo}
                    source={logo}
                />
                <View style={styles.notFoundContent}>
                    <Text style={styles.notFoundTextHeader}>404</Text>
                    <Text style={styles.notFoundTextBody}>The chat you are looking for cannot be found.</Text>
                </View>
                <TouchableOpacity
                    onPress={() => Navigator.navigate(ROUTES.HOME)}
                >
                    <Text style={styles.notFoundButtonText}>Get me out of here</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    </>
);

export default NotFound;
