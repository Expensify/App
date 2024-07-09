import React from 'react';
import {View} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as TripReservationUtils from '@libs/TripReservationUtils';
import CONST from '@src/CONST';
import Icon from './Icon';
import Text from './Text';

function TripDetailsMenuItem() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const reservationIcon = TripReservationUtils.getTripReservationIcon(CONST.RESERVATION_TYPE.FLIGHT);

    return (
        <View style={[styles.pv3, styles.ph5]}>
            <View style={[styles.tripDetailsContainer, styles.pb3]}>
                <View style={[StyleUtils.getTripReservationIconContainer(false), styles.mr3]}>
                    <Icon
                        src={reservationIcon}
                        fill={theme.icon}
                    />
                </View>
                <View>
                    <Text style={styles.textBold}>AA 2661</Text>
                    <Text style={styles.textLabelSupporting}>American Airlines AA 2661 \u2022 Seat 24D</Text>
                </View>
            </View>

            <View style={[styles.tripDetailsContainer, styles.pt3]}>
                <Text style={[styles.textBold, styles.textLarge]}>8:20 AM</Text>
                <View style={[styles.tripDetailsContainer, styles.flex1, styles.justifyContentBetween]}>
                    <View style={styles.tripDetailsLine} />
                    <View style={styles.tripDetailsLineTextContainer}>
                        <Text style={styles.textLabelSupporting}>6h 23m</Text>
                        <Text style={[styles.textLabelSupporting, styles.tripDetailsLineSubtext]}>Non-stop</Text>
                    </View>
                    <View style={styles.tripDetailsLine} />
                </View>
                <Text style={[styles.textBold, styles.textLarge]}>11:43 AM</Text>
            </View>

            <View style={[styles.tripDetailsContainer, styles.pt3]}>
                <View style={{flex: 1, paddingRight: 24}}>
                    <Text style={[styles.labelStrong, styles.pb1]}>PHL</Text>
                    <Text style={[styles.textLabelSupporting, styles.pb1]}>Philadelphia International Airport</Text>
                    <Text style={styles.textLabelSupporting}>Terminal A</Text>
                </View>
                <View style={{flex: 1, paddingLeft: 24, alignItems: 'flex-end'}}>
                    <Text style={[styles.labelStrong, styles.pb1]}>SFO</Text>
                    <Text style={[styles.textLabelSupporting, styles.textAlignRight, styles.pb1]}>San Francisco International Airport</Text>
                    <Text style={[styles.textLabelSupporting, styles.textAlignRight]}>Terminal 2</Text>
                </View>
            </View>
        </View>
    );
}

TripDetailsMenuItem.displayName = 'TripDetailsMenuItem';

export default TripDetailsMenuItem;
