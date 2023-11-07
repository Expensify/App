import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import styles from '@styles/styles';
import CONST from '@src/CONST';

const propTypes = {
    /** Style for wrapping View */
    // eslint-disable-next-line react/forbid-prop-types
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Translate function */
    translate: PropTypes.func.isRequired,
};

const defaultProps = {
    containerStyles: [],
};

function HelpLinks({containerStyles, translate}) {
    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, containerStyles]}>
            <Icon src={Expensicons.QuestionMark} />
            <View style={[styles.ml2, styles.dFlex, styles.flexRow]}>
                <TextLink
                    style={[styles.textMicro]}
                    href={CONST.BANK_ACCOUNT_PERSONAL_DOCUMENTATION_INFO_URL}
                >
                    {translate('requestorStep.learnMore')}
                </TextLink>
                <Text style={[styles.textMicroSupporting]}>{' | '}</Text>
                <TextLink
                    style={[styles.textMicro, styles.textLink]}
                    href={CONST.PERSONAL_DATA_PROTECTION_INFO_URL}
                >
                    {translate('requestorStep.isMyDataSafe')}
                </TextLink>
            </View>
        </View>
    );
}

HelpLinks.displayName = 'HelpLinks';
HelpLinks.propTypes = propTypes;
HelpLinks.defaultProps = defaultProps;

export default HelpLinks;
