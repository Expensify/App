import {createStackNavigator} from '@react-navigation/stack';
import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as ModalStackNavigators from '@libs/Navigation/AppNavigator/ModalStackNavigators';
import RHPScreenOptions from '@libs/Navigation/AppNavigator/RHPScreenOptions';
import useThemeStyles from '@styles/useThemeStyles';
import Overlay from './Overlay';

const Stack = createStackNavigator();

const propTypes = {
    /* Navigation functions provided by React Navigation */
    navigation: PropTypes.shape({
        goBack: PropTypes.func.isRequired,
    }).isRequired,
};

function LeftModalNavigator(props) {
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();

    return (
        <NoDropZone>
            {!isSmallScreenWidth && <Overlay onPress={props.navigation.goBack} />}
            <View style={styles.LHPNavigatorContainer(isSmallScreenWidth)}>
                <Stack.Navigator screenOptions={RHPScreenOptions}>
                    <Stack.Screen
                        name="Search"
                        component={ModalStackNavigators.SearchModalStackNavigator}
                    />
                </Stack.Navigator>
            </View>
        </NoDropZone>
    );
}

LeftModalNavigator.propTypes = propTypes;
LeftModalNavigator.displayName = 'RightModalNavigator';

export default LeftModalNavigator;
