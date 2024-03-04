import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import type {CentralPaneNavigatorParamList} from '@navigation/types';
import type SCREENS from '@src/SCREENS';

type MyTripsPageProps = StackScreenProps<CentralPaneNavigatorParamList, typeof SCREENS.TRAVEL.MY_TRIPS>;

function MyTripsPage({route}: MyTripsPageProps) {
    return (
        <View>
            <Text>MyTripsPage</Text>
        </View>
    );
}

MyTripsPage.displayName = 'MyTripsPage';

export default MyTripsPage;
