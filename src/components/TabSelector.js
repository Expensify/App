import {View} from 'react-native';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import * as Expensicons from './Icon/Expensicons';
import ONYXKEYS from '../ONYXKEYS';
import TabSelectorItem from './TabSelectorItem';
import Tab from '../libs/actions/Tab';
import CONST from '../CONST';
import useLocalize from '../hooks/useLocalize';
import styles from '../styles/styles';
import * as IOU from '../libs/actions/IOU';

const propTypes = {
    /** Which tab has been selected */
    tabSelected: PropTypes.string,

    /** The current money request ID */
    moneyRequestID: PropTypes.string,
};

const defaultProps = {
    tabSelected: CONST.TAB.TAB_MANUAL,
    moneyRequestID: '',
};

function TabSelector(props) {
    const {translate} = useLocalize();
    const selectedTab = props.tabSelected ? props.tabSelected : CONST.TAB.TAB_MANUAL;
    return (
        <View style={styles.tabSelector}>
            <TabSelectorItem
                title={translate('tabSelector.manual')}
                selected={selectedTab === CONST.TAB.TAB_MANUAL}
                icon={Expensicons.Pencil}
                onPress={() => {
                    IOU.resetMoneyRequestInfo(props.moneyRequestID);
                    Tab.onTabPress(CONST.TAB.TAB_MANUAL);
                }}
            />
            <TabSelectorItem
                title={translate('tabSelector.scan')}
                selected={selectedTab === CONST.TAB.TAB_SCAN}
                icon={Expensicons.Receipt}
                onPress={() => {
                    IOU.resetMoneyRequestInfo(props.moneyRequestID);
                    Tab.onTabPress(CONST.TAB.TAB_SCAN);
                }}
            />
        </View>
    );
}

TabSelector.propTypes = propTypes;
TabSelector.defaultProps = defaultProps;
TabSelector.displayName = 'TabSelector';

export default withOnyx({
    tabSelected: {
        key: ONYXKEYS.TAB_SELECTOR,
    },
})(TabSelector);
