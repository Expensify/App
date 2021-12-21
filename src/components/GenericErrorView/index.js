import React from 'react';
import {View} from 'react-native';
import Icon from '../Icon';
import defaultTheme from '../../styles/themes/default';
import * as Expensicons from '../Icon/Expensicons';
import ExpensifyText from '../ExpensifyText';
import Button from '../Button';
import LogoWordmark from '../../../assets/images/expensify-wordmark.svg';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import variables from '../../styles/variables';
import styles from '../../styles/styles';
import ErrorBodyText from './ErrorBodyText';
import TextLink from '../TextLink';
import CONST from '../../CONST';

const propTypes = {
    ...withLocalizePropTypes,
};

const GenericErrorView = (props) => {
    const refreshPage = () => {

    };

    return (
        <View style={[styles.flex1, styles.m5]}>
            <View style={[styles.flexColumn, styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
                <View style={[styles.flexColumn, styles.flexColumn, styles.alignItemsStart]}>
                    <View style={[styles.mb5]}>
                        <Icon
                            src={Expensicons.Bug}
                            height={variables.componentSizeNormal}
                            width={variables.componentSizeNormal}
                            fill={defaultTheme.iconSuccessFill}
                        />
                    </View>
                    <View style={[styles.mb5]}>
                        <ExpensifyText style={[styles.headerText, styles.textXXLarge]}>
                            {props.translate('genericErrorView.title')}
                        </ExpensifyText>
                    </View>
                    <View style={[styles.mb5]}>
                        <ErrorBodyText />
                        <ExpensifyText>
                            {props.translate('genericErrorView.body.helpTextConcierge')}
                            <TextLink href={CONST.EMAIL.CONCIERGE} style={[styles.link]}>
                                {CONST.EMAIL.CONCIERGE}
                            </TextLink>

                        </ExpensifyText>
                    </View>
                    <View style={styles.flexWrap}>
                        <Button
                            success
                            onPress={refreshPage}
                            text={props.translate('genericErrorView.refresh')}
                        />
                    </View>
                </View>
            </View>
            <View styles={[styles.alignSelfEnd]}>
                <View style={[styles.flex1, styles.flexRow, styles.justifyContentCenter]}>
                    <LogoWordmark height={30} width={80} />
                </View>
            </View>
        </View>
    );
};

GenericErrorView.propTypes = propTypes;

export default withLocalize(GenericErrorView);
