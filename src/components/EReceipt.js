import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import ONYXKEYS from '../ONYXKEYS';
import EReceiptBG from '../../assets/images/eReceipt-BGImage.svg';
import * as StyleUtils from '../styles/StyleUtils';
import transactionPropTypes from './transactionPropTypes';
import styles from '../styles/styles';
import * as Expensicons from './Icon/Expensicons';
import * as MCCIcons from './Icon/MCCIcons';
import Icon from './Icon';
import Text from './Text';

const propTypes = {
        /* Onyx Props */
        transactionID: PropTypes.string.isRequired,

        /* Onyx Props */
        transaction: transactionPropTypes,
};

const defaultProps = {
    transaction: {},
}

function EReceipt({transaction}) {
    const colorStyles = StyleUtils.getEReceiptColor(transaction.parentTransactionID || transaction.transactionID || '');
    const primaryColor = colorStyles.backgroundColor;
    const secondaryColor = colorStyles.color;
    
    return (
        <View style={{width: 335, backgroundColor: primaryColor}}>
                <View style={{position: 'absolute', top: 0, left: 0, width: '100%', aspectRatio: 335 / 540}}>
                    <EReceiptBG height={540} style={colorStyles} />
                </View>
                <View style={{alignItems: 'center', paddingHorizontal: 32, paddingBottom: 56, paddingTop: 32}}>
                    <View style={[{height: 100, width: 72, alignItems: 'center', justifyContent: 'center', flexShrink: 0}]}>
                        <Icon
                            src={Expensicons.EReceiptIcon}
                            height={100}
                            width={72}
                            fill={secondaryColor}
                            additionalStyles={[{position: 'absolute', top: 0}]}
                        />
                        <Icon
                            src={MCCIcons.Airlines}
                            height={40}
                            width={40}
                            fill={primaryColor}
                        />
                    </View>
                </View>
                <View style={[{width: 335, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, paddingHorizontal: 36, gap: 36}]}>
                    <View style={[styles.alignItemsCenter, styles.alignSelfCenter, styles.flexColumn, styles.gap2]}>
                        <View style={[{justifyContent: 'center', gap: 1, flexDirection: 'row'}]}>
                            <View style={[{flexDirection: 'column', paddingTop: 3, gap: 10}]}>
                                <Text style={[styles.eReceiptAmount, {fontSize: 28, lineHeight: 'normal'}, {color: secondaryColor}]}>
                                    $
                                </Text>
                            </View>
                            <Text adjustsFontSizeToFit style={[styles.eReceiptAmount, {fontSize: 44, lineHeight: 'normal'}, {color: secondaryColor}, {wordBreak: 'break-all'}]}>
                            1,245.93
                            </Text>
                        </View>
                        <Text style={[styles.eReceiptMerchant, {textAlign: 'center', wordBreak: 'break-all'}]}>
                            United
                        </Text>
                    </View>
                    <View style={[styles.alignSelfStretch, styles.flexColumn, styles.gap4]}>
                        <View style={[{flexDirection: 'column', gap: 2}]}>
                            <Text style={[styles.eReceiptWaypointTitle, {color: secondaryColor}]}>
                            Transaction date
                            </Text>
                            <Text style={[styles.eReceiptWaypointAddress]}>
                            January 12, 2022
                            </Text>
                        </View>
                        <View style={[{flexDirection: 'column', gap: 2}]}>
                            <Text style={[styles.eReceiptWaypointTitle, {color: secondaryColor}]}>
                            Card
                            </Text>
                            <Text style={[styles.eReceiptWaypointAddress]}>
                            Expensify Card - 1234
                            </Text>
                        </View>
                    </View>
                    <View style={[{paddingTop: 36, height: 20, paddingLeft: 0, justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, alignSelf: 'stretch', flexDirection: 'row'}]}>
                        <Icon
                            width={86}
                            height={19.25}
                            fill={secondaryColor}
                            src={Expensicons.ExpensifyWordmark}
                        />
                        <Text style={styles.eReceiptGuaranteed}>Guaranteed eReceipt</Text>
                    </View>
                </View>
        </View>
    );
}

EReceipt.displayName = 'EReceipt';
EReceipt.propTypes = propTypes;
EReceipt.defaultProps = defaultProps;

export default withOnyx({
    transaction: {
        key: ({transactionID}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
    },
})(EReceipt);
