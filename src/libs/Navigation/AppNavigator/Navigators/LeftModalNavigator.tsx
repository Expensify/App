import {createStackNavigator, StackScreenProps} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as ModalStackNavigators from '@libs/Navigation/AppNavigator/ModalStackNavigators';
import ModalNavigatorScreenOptions from '@libs/Navigation/AppNavigator/ModalNavigatorScreenOptions';
import {AuthScreensParamList, LeftModalNavigatorParamList} from '@libs/Navigation/types';
import useThemeStyles from '@styles/useThemeStyles';
import NAVIGATORS from '@src/NAVIGATORS';
import Overlay from './Overlay';

type LeftModalNavigatorProps = StackScreenProps<AuthScreensParamList, typeof NAVIGATORS.LEFT_MODAL_NAVIGATOR>;

const Stack = createStackNavigator<LeftModalNavigatorParamList>();

function LeftModalNavigator({navigation}: LeftModalNavigatorProps) {
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();
    const screenOptions = useMemo(() => ModalNavigatorScreenOptions(styles), [styles]);

    return (
        <NoDropZone>
            {!isSmallScreenWidth && <Overlay onPress={navigation.goBack} />}
            <View style={styles.LHPNavigatorContainer(isSmallScreenWidth)}>
                <Stack.Navigator screenOptions={screenOptions}>
                    <Stack.Screen
                        name="Search"
                        component={ModalStackNavigators.SearchModalStackNavigator}
                    />
                </Stack.Navigator>
            </View>
        </NoDropZone>
    );
}

LeftModalNavigator.displayName = 'RightModalNavigator';

export default LeftModalNavigator;
