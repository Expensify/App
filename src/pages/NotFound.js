import React from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import styles from '../styles/styles';
import logo from '../../assets/images/expensify-logo_reversed.png';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import Text from '../components/Text';

const NotFound = ({translations: {translate}}) => (
    <>
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
                    <Text style={styles.notFoundTextBody}>{translate('notFound.chatYouLookingForCannotBeFound')}</Text>
                </View>
                <TouchableOpacity
                    onPress={() => Navigation.navigate(ROUTES.HOME)}
                >
                    <Text style={styles.notFoundButtonText}>{translate('notFound.getMeOutOfHere')}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    </>
);

NotFound.propTypes = {...withLocalizePropTypes};

export default withLocalize(NotFound);
