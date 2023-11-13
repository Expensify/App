import {useState} from 'react';
import {Text, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import AttachmentView from '@components/Attachments/AttachmentView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OptionsSelector from '@components/OptionsSelector';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import Share from '@libs/Share';
import * as Report from '@userActions/Report';
import compose from '@libs/compose';
import styles from '@styles/styles';
import PropTypes from "prop-types";
import personalDetailsPropType from './personalDetailsPropType';
import reportPropTypes from './reportPropTypes';

function ShareMessagePage({report, personalDetails, translate, testID}) {
    const {participantAccountIDs, reportID} = report;
    const {isTextShare, ...share} = Share.useShareData();
    const [message, setMessage] = useState(isTextShare ? share.source : '');

    const participants = _.map(participantAccountIDs, (accountID) => OptionsListUtils.getParticipantsOption({accountID, selected: true}, personalDetails));

    const navigateToReportOrUserDetail = (option) => {
        if (option.accountID) {
            const activeRoute = Navigation.getActiveRoute().replace(/\?.*/, '');

            Navigation.navigate(ROUTES.PROFILE.getRoute(option.accountID, activeRoute));
        } else if (option.reportID) {
            Navigation.navigate(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(option.reportID));
        }
    };

    return (
        <ScreenWrapper
            testID={testID}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton title={translate('newChatPage.shareToExpensify')} />
            <OptionsSelector
                boldStyle
                canSelectMultipleOptions={false}
                confirmButtonText={translate('common.share')}
                disableArrowKeysActions
                onConfirmSelection={() => {
                    if (isTextShare) {
                        Report.addComment(reportID, message);
                    } else {
                        Report.addAttachment(reportID, share, message);
                    }
                    Navigation.dismissModal(reportID);
                }}
                onSelectRow={navigateToReportOrUserDetail}
                sections={[
                    {
                        title: translate('common.to'),
                        data: participants,
                        shouldShow: true,
                        indexOffset: 0,
                    },
                ]}
                selectedOptions={participants}
                shouldAllowScrollingChildren
                shouldShowConfirmButton
                shouldShowTextInput={false}
                shouldTextInputAppearBelowOptions
                shouldUseStyleForChildren={false}
                showTitleTooltip
                value=""
            >
                <View style={{padding: 24}}>
                    <TextInput
                        accessibilityLabel={translate('common.message')}
                        autoGrowHeight
                        blurOnSubmit
                        containerStyles={[styles.autoGrowHeightMultilineInput]}
                        label={translate('common.message')}
                        onChangeText={setMessage}
                        returnKeyType="done"
                        submitOnEnter={false}
                        textAlignVertical="top"
                        value={message}
                    />
                </View>
                {!isTextShare && (
                    <View style={{padding: 24}}>
                        <Text style={styles.textLabelSupporting}>{translate('common.attachment')}</Text>
                        {!!share.source && (
                            <View style={{borderRadius: 8, height: 200, marginTop: 8, overflow: 'hidden', width: '100%'}}>
                                <AttachmentView
                                    file={share}
                                    source={share.source}
                                />
                            </View>
                        )}
                    </View>
                )}
            </OptionsSelector>
        </ScreenWrapper>
    );
}

ShareMessagePage.propTypes = {
    testID: PropTypes.string,
    /** The personal details of the person who is logged in */
    personalDetails: personalDetailsPropType,

    /** The report currently being used */
    report: reportPropTypes,

    ...withLocalizePropTypes,
};
ShareMessagePage.defaultProps = {
    testID: 'ShareMessagePage',
    personalDetails: {},
    report: {},
};

export default compose(
    withLocalize,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID.toString()}`,
        },
    }),
)(ShareMessagePage);
