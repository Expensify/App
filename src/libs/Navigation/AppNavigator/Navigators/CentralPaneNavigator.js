import React from 'react';
import * as PlatformStackNavigator from '../../PlatformStackNavigator';
import SCREENS from '../../../../SCREENS';
import ReportScreenWrapper from '../ReportScreenWrapper';
import getCurrentUrl from '../../currentUrl';
import styles from '../../../../styles/styles';
import FreezeWrapper from '../../FreezeWrapper';

const Stack = PlatformStackNavigator.createPlatformStackNavigator();

const url = getCurrentUrl();
const openOnAdminRoom = url ? new URL(url).searchParams.get('openOnAdminRoom') : undefined;

function CentralPaneNavigator() {
    return (
        <FreezeWrapper>
            <Stack.Navigator>
                <Stack.Screen
                    name={SCREENS.REPORT}
                    // We do it this way to avoid adding the url params to url
                    initialParams={{openOnAdminRoom: openOnAdminRoom ? 'true' : undefined}}
                    options={{
                        headerShown: false,
                        title: 'New Expensify',

                        // Prevent unnecessary scrolling
                        cardStyle: styles.cardStyleNavigator,
                    }}
                    component={ReportScreenWrapper}
                />
            </Stack.Navigator>
        </FreezeWrapper>
    );
}

export default CentralPaneNavigator;
