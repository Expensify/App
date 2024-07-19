import React from 'react';
import {View} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as TripReservationUtils from '@libs/TripReservationUtils';
import CONST from '@src/CONST';
import Icon from './Icon';
import Text from './Text';

/**
 * This component is going to be used in TravelDetails when we resolve
 * the backends and send over detailed info about reservations.
 * 
 * Due to it not being currently used and there being no data passed to this
 * as I am unaware of the data structure, I have disabled eslint rules
 * for this component.
 *
 * Please refer to the conversation below for more details:
 * https://swmansion.slack.com/archives/C05S5EV2JTX/p1721062807563259
 */
/* eslint-disable */
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
                    <Text style={styles.textBold}>{}</Text>
                    <Text style={styles.textLabelSupporting}>{}</Text>
                </View>
            </View>

            <View style={[styles.tripDetailsContainer, styles.pt3]}>
                <Text style={[styles.textBold, styles.textLarge]}>{}</Text>
                <View style={[styles.tripDetailsContainer, styles.flex1, styles.justifyContentBetween]}>
                    <View style={styles.tripDetailsLine} />
                    <View style={styles.tripDetailsLineTextContainer}>
                        <Text style={styles.textLabelSupporting}>{}</Text>
                        <Text style={[styles.textLabelSupporting, styles.tripDetailsLineSubtext]}>{}</Text>
                    </View>
                    <View style={styles.tripDetailsLine} />
                </View>
                <Text style={[styles.textBold, styles.textLarge]}>{}</Text>
            </View>

            <View style={[styles.tripDetailsContainer, styles.pt3]}>
                <View style={{flex: 1, paddingRight: 24}}>
                    <Text style={[styles.labelStrong, styles.pb1]}>{}</Text>
                    <Text style={[styles.textLabelSupporting, styles.pb1]}>{}</Text>
                    <Text style={styles.textLabelSupporting}>{}</Text>
                </View>
                <View style={{flex: 1, paddingLeft: 24, alignItems: 'flex-end'}}>
                    <Text style={[styles.labelStrong, styles.pb1]}>{}</Text>
                    <Text style={[styles.textLabelSupporting, styles.textAlignRight, styles.pb1]}>{}</Text>
                    <Text style={[styles.textLabelSupporting, styles.textAlignRight]}>{}</Text>
                </View>
            </View>
        </View>
    );
}

TripDetailsMenuItem.displayName = 'TripDetailsMenuItem';

export default TripDetailsMenuItem;
