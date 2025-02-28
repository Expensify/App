import type {StackCardInterpolationProps} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {isSafari} from '@libs/Browser';
import * as ModalStackNavigators from '@libs/Navigation/AppNavigator/ModalStackNavigators';
import useModalCardStyleInterpolator from '@libs/Navigation/AppNavigator/useModalCardStyleInterpolator';
import useSideModalStackScreenOptions from '@libs/Navigation/AppNavigator/useSideModalStackScreenOptions';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ConsoleNavigatorParamList, PublicScreensParamList} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import Overlay from './Overlay';

type PublicRightModalNavigatorComponentProps = PlatformStackScreenProps<PublicScreensParamList, typeof NAVIGATORS.PUBLIC_RIGHT_MODAL_NAVIGATOR>;

const Stack = createPlatformStackNavigator<ConsoleNavigatorParamList>();

function PublicRightModalNavigatorComponent({navigation}: PublicRightModalNavigatorComponentProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const modalNavigatorOptions = useSideModalStackScreenOptions();
    const customInterpolator = useModalCardStyleInterpolator();

    const screenOptions = useMemo(() => {
        // The .forHorizontalIOS interpolator from `@react-navigation` is misbehaving on Safari, so we override it with Expensify custom interpolator
        if (isSafari()) {
            return {
                ...modalNavigatorOptions,
                web: {
                    ...modalNavigatorOptions.web,
                    cardStyleInterpolator: (props: StackCardInterpolationProps) => customInterpolator({props}),
                },
            };
        }

        return modalNavigatorOptions;
    }, [customInterpolator, modalNavigatorOptions]);
    return (
        <NoDropZone>
            {!shouldUseNarrowLayout && <Overlay onPress={navigation.goBack} />}
            <View style={styles.RHPNavigatorContainer(shouldUseNarrowLayout)}>
                <Stack.Navigator
                    screenOptions={screenOptions}
                    id={NAVIGATORS.PUBLIC_RIGHT_MODAL_NAVIGATOR}
                >
                    <Stack.Screen
                        name={SCREENS.PUBLIC_CONSOLE_DEBUG}
                        component={ModalStackNavigators.ConsoleModalStackNavigator}
                    />
                </Stack.Navigator>
            </View>
        </NoDropZone>
    );
}

export default PublicRightModalNavigatorComponent;
