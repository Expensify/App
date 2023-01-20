import React, { PureComponent } from "react";
import { View } from "react-native";
import colors from "../../styles/colors";
import styles from '../../styles/styles';
import Icon from "../Icon";
import withLocalize from "../withLocalize";
import * as Expensicons from '../Icon/Expensicons';

class MagicCodeModal extends PureComponent {

    render() {
        return (
            <View style={styles.deeplinkWrapperContainer}>
                <View style={styles.deeplinkWrapperFooter}>
                    <Icon
                        width={154}
                        height={34}
                        fill={colors.green}
                        src={Expensicons.ExpensifyWordmark}
                    />
                </View>
            </View>
        );
    }
}

export default withLocalize(MagicCodeModal);