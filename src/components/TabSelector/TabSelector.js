import {View} from 'react-native';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import * as Expensicons from '../Icon/Expensicons';
import ONYXKEYS from '../../ONYXKEYS';
import TabSelectorItem from './TabSelectorItem';
import Tab from '../../libs/actions/Tab';
import CONST from '../../CONST';
import useLocalize from '../../hooks/useLocalize';
import styles from '../../styles/styles';
import * as IOU from '../../libs/actions/IOU';

const propTypes = {
    /** Which tab has been selected */
    selectedTab: PropTypes.string,

    /** The current money request ID */
    moneyRequestID: PropTypes.string,
};

const defaultProps = {
    selectedTab: CONST.TAB.TAB_MANUAL,
    moneyRequestID: '',
};

function TabSelector(props) {
    const {translate} = useLocalize();
    return (
        <View style={styles.tabSelector}>
            <TabSelectorItem
                title={translate('tabSelector.manual')}
                isSelected={props.selectedTab === CONST.TAB.TAB_MANUAL}
                icon={Expensicons.Pencil}
                onPress={() => {
                    IOU.resetMoneyRequestInfo(props.moneyRequestID);
                    Tab.onTabPress(CONST.TAB.TAB_MANUAL);
                }}
            />
            <TabSelectorItem
                title={translate('tabSelector.scan')}
                isSelected={props.selectedTab === CONST.TAB.TAB_SCAN}
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
    selectedTab: {
        key: ONYXKEYS.SELECTED_TAB,
    },
})(TabSelector);
