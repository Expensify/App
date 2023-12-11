import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import Section from '@components/Section';
import Text from '@components/Text';
import UnorderedList from '@components/UnorderedList';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import compose from '@libs/compose';
import userPropTypes from '@pages/settings/userPropTypes';
import useThemeStyles from '@styles/useThemeStyles';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /** Information about the logged in user's account */
    user: userPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    user: {},
};

function WorkspaceCardVBANoECardView(props) {
    const styles = useThemeStyles();
    return (
        <>
            <Section
                title={props.translate('workspace.card.header')}
                icon={Illustrations.CreditCardsNew}
            >
                <View style={[styles.mv3]}>
                    <UnorderedList
                        items={[
                            props.translate('workspace.card.benefit1'),
                            props.translate('workspace.card.benefit2'),
                            props.translate('workspace.card.benefit3'),
                            props.translate('workspace.card.benefit4'),
                        ]}
                    />
                </View>
                <Button
                    text={props.translate('workspace.card.addWorkEmail')}
                    onPress={() => {
                        Link.openOldDotLink(CONST.ADD_SECONDARY_LOGIN_URL);
                    }}
                    icon={Expensicons.Mail}
                    style={[styles.mt4]}
                    iconStyles={[styles.buttonCTAIcon]}
                    shouldShowRightIcon
                    large
                    success
                />
            </Section>
            {Boolean(props.user.isCheckingDomain) && <Text style={[styles.m5, styles.formError]}>{props.translate('workspace.card.checkingDomain')}</Text>}
        </>
    );
}

WorkspaceCardVBANoECardView.propTypes = propTypes;
WorkspaceCardVBANoECardView.defaultProps = defaultProps;
WorkspaceCardVBANoECardView.displayName = 'WorkspaceCardVBANoECardView';

export default compose(
    withLocalize,
    withOnyx({
        user: {
            key: ONYXKEYS.USER,
        },
    }),
)(WorkspaceCardVBANoECardView);
