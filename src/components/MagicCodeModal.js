import React, { PureComponent } from "react";
import PropTypes from 'prop-types';
import { View } from "react-native";
import colors from "../styles/colors";
import styles from '../styles/styles';
import Icon from "./Icon";
import withLocalize, {withLocalizePropTypes} from "./withLocalize";
import Text from './Text';
import * as Expensicons from './Icon/Expensicons';
import * as Illustrations from './Icon/Illustrations';

const propTypes = {
    /** Code to display. */
    code: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};
class MagicCodeModal extends PureComponent {

    render() {
        return (
            <View style={styles.deeplinkWrapperContainer}>
                <View style={styles.deeplinkWrapperMessage}>
                    <View style={styles.mb2}>
                        <Icon
                            width={200}
                            height={164}
                            src={Illustrations.MagicCodeYellow}
                        />
                    </View>
                    <Text style={[styles.textHeadline, styles.textXXLarge, styles.textAlignCenter]}>
                        {this.props.translate('magicCodeModal.title')}
                    </Text>
                    <View style={[styles.mt2, styles.mb2]}>
                        <Text style={[styles.fontSizeNormal, styles.textAlignCenter]}>
                            {this.props.translate('magicCodeModal.description')}
                        </Text>
                    </View>
                    <View style={styles.mt6}>
                        <Text style={styles.magicCodeDigits}>
                            {this.props.code}
                        </Text>
                    </View>
                </View>
                <View style={styles.deeplinkWrapperFooter}>
                    <Icon
                        width={154}
                        height={34}
                        fill={colors.green}
                        src={Expensicons.ExpensifyWordmark}
                    />
                </View>
            </View >
        );
    }
}

MagicCodeModal.propTypes = propTypes;
export default withLocalize(MagicCodeModal);