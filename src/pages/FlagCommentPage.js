import React, {useMemo} from 'react';
import _ from 'underscore';
import {View, ScrollView} from 'react-native';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import ScreenWrapper from '../components/ScreenWrapper';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import styles from '../styles/styles';
import Navigation from '../libs/Navigation/Navigation';
import Text from '../components/Text';
import * as Expensicons from '../components/Icon/Expensicons';
import MenuItem from '../components/MenuItem';

const propTypes = {
    ...withLocalizePropTypes,
};

function FlagCommentPage(props) {
    const severities = [
        {
            severity: 'spam',
            name: props.translate('moderation.spam'),
            icon: Expensicons.FlagLevelOne,
            description: props.translate('moderation.spamDescription'),
        },
        {
            severity: 'inconsiderate',
            name: props.translate('moderation.inconsiderate'),
            icon: Expensicons.FlagLevelOne,
            description: props.translate('moderation.inconsiderateDescription'),
        },
        {
            severity: 'intimidation',
            name: props.translate('moderation.intimidation'),
            icon: Expensicons.FlagLevelTwo,
            description: props.translate('moderation.intimidationDescription'),
        },
        {
            severity: 'bullying',
            name: props.translate('moderation.bullying'),
            icon: Expensicons.FlagLevelTwo,
            description: props.translate('moderation.bullyingDescription'),
        },
        {
            severity: 'harassment',
            name: props.translate('moderation.harassment'),
            icon: Expensicons.FlagLevelThree,
            description: props.translate('moderation.harassmentDescription'),
        },
        {
            severity: 'assault',
            name: props.translate('moderation.assault'),
            icon: Expensicons.FlagLevelThree,
            description: props.translate('moderation.assaultDescription'),
        },
    ];

    const flagComment = (severity) => {
        console.log(severity);
        console.log(props.route.params.reportActionID);
        console.log(props.route.params.reportID);
    };

    const severityMenuItems = _.map(severities, (item, index) => (<MenuItem
            key={`${item.severity}_${index}`}
            icon={item.icon}
            shouldShowRightIcon
            title={item.name}
            description={item.description}
            onPress={() => flagComment(item.severity)}
            wrapperStyle={[styles.borderBottom]}
        />)
    )

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            {({safeAreaPaddingBottomStyle}) => (
                <>
                    <HeaderWithCloseButton
                        title={props.translate('reportActionContextMenu.flagAsOffensive')}
                        onCloseButtonPress={() => Navigation.dismissModal(true)}
                    />
                    <ScrollView
                        contentContainerStyle={safeAreaPaddingBottomStyle}
                        style={[styles.settingsPageBackground]}
                    >
                        <View style={styles.pageWrapper}>
                            <View style={[styles.settingsPageBody, styles.alignItemsCenter]}>
                                <Text style={[styles.baseFontStyle]}>
                                    {props.translate('moderation.flagDescription')}
                                </Text>
                            </View>
                        </View>
                        <Text style={[styles.ph5, styles.textLabelSupporting, styles.mb1]}>
                            {props.translate('moderation.chooseAReason')}
                        </Text>
                        {severityMenuItems}
                    </ScrollView>
                </>
            )}
        </ScreenWrapper>

    );
}

FlagCommentPage.propTypes = propTypes;
FlagCommentPage.displayName = 'FlagCommentPage';

export default withLocalize(FlagCommentPage);

