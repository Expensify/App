import React from 'react';
import {View} from 'react-native';
import Text from './Text';
import CONFIG from '../CONFIG';
import styles from '../styles/styles';
import Switch from './Switch';
import * as Network from '../libs/actions/Network';
import networkPropTypes from './networkPropTypes';
import {withNetwork} from './OnyxProvider';

const propTypes = {
    /** Offline info */
    network: networkPropTypes.isRequired,
};

const OfflineSwitch = props => (
    <>
        {CONFIG.USE_MANUAL_NETWORK && (
            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.ml4]}>
                <Text style={[styles.textStrong]}>Offline: </Text>
                <Switch
                    isOn={props.network.isOffline}
                    onToggle={() => Network.setIsOffline(!props.network.isOffline)}
                />
            </View>
        )}
    </>
);

OfflineSwitch.propTypes = propTypes;
export default withNetwork()(OfflineSwitch);
