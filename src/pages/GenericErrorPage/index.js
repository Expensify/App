import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import Icon from '../../components/Icon';
import defaultTheme from '../../styles/themes/default';
import * as Expensicons from '../../components/Icon/Expensicons';
import ExpensifyText from '../../components/ExpensifyText';
import Button from '../../components/Button';
import LogoWordmark from '../../../assets/images/expensify-wordmark.svg';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import compose from '../../libs/compose';
import * as Session from '../../libs/actions/Session';
import variables from '../../styles/variables';
import styles from '../../styles/styles';
import ErrorBodyText from './ErrorBodyText';
import TextLink from '../../components/TextLink';
import CONST from '../../CONST';

const propTypes = {
    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,

    /** Function call on Refresh button click */
    onRefresh: PropTypes.func.isRequired,
};

const genericErrorPage = (props) => {
    const onSignOutClick = () => {
        Session.signOut();
        props.onRefresh();
    };

    return (
        <View style={[styles.flex1, styles.pv10, styles.ph5, styles.errorPageContainer]}>
            <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
                <View style={styles.alignItemsStart}>
                    <View style={styles.mb5}>
                        <Icon
                            src={Expensicons.Bug}
                            height={variables.componentSizeNormal}
                            width={variables.componentSizeNormal}
                            fill={defaultTheme.iconSuccessFill}
                        />
                    </View>
                    <View style={styles.mb5}>
                        <ExpensifyText style={[styles.headerText, styles.textXXLarge]}>
                            {props.translate('genericErrorPage.title')}
                        </ExpensifyText>
                    </View>
                    <View style={styles.mb5}>
                        <ErrorBodyText />
                        <ExpensifyText>
                            {props.translate('genericErrorPage.body.helpTextConcierge')}
                            <TextLink href={`mailto:${CONST.EMAIL.CONCIERGE}`} style={[styles.link]}>
                                {CONST.EMAIL.CONCIERGE}
                            </TextLink>
                        </ExpensifyText>
                    </View>
                    <View style={[styles.flexWrap, styles.w100]}>
                        <View style={[styles.flex1, styles.flexRow, styles.justifyContentBetween]}>
                            <Button
                                success
                                small={props.isSmallScreenWidth}
                                onPress={props.onRefresh}
                                text={props.translate('genericErrorPage.refresh')}
                            />
                            <Button
                                small={props.isSmallScreenWidth}
                                onPress={onSignOutClick}
                                text={props.translate('initialSettingsPage.signOut')}
                            />
                        </View>
                    </View>
                </View>
            </View>
            <View styles={styles.alignSelfEnd}>
                <View style={[styles.flex1, styles.flexRow, styles.justifyContentCenter]}>
                    <LogoWordmark height={30} width={80} />
                </View>
            </View>
        </View>
    );
};

genericErrorPage.propTypes = propTypes;

export default compose(
    withWindowDimensions,
    withLocalize,
)(genericErrorPage);
