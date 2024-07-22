import type {StackScreenProps} from '@react-navigation/stack';
import React, {useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Onyx, {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import type {DebugParamList} from '@libs/Navigation/types';
import * as NumberUtils from '@libs/NumberUtils';
import ReportActionItem from '@pages/home/report/ReportActionItem';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetailsList, ReportAction, Session} from '@src/types/onyx';

type DebugReportActionCreatePageProps = StackScreenProps<DebugParamList, typeof SCREENS.DEBUG.REPORT_ACTION_CREATE>;

const getInitialReportAction = (reportID: string, session: OnyxEntry<Session>, personalDetailsList: OnyxEntry<PersonalDetailsList>) =>
    JSON.stringify(
        {
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            reportID,
            reportActionID: NumberUtils.rand64(),
            created: DateUtils.getDBTime(),
            actorAccountID: session?.accountID,
            avatar: (session?.accountID && personalDetailsList?.[session.accountID]?.avatar) ?? '',
            message: [{type: CONST.REPORT.MESSAGE.TYPE.COMMENT, html: 'Hello world!', text: 'Hello world!'}],
        },
        null,
        6,
    );

function DebugReportActionCreatePage({
    route: {
        params: {reportID},
    },
}: DebugReportActionCreatePageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [personalDetailsList] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [draftReportAction, setDraftReportAction] = useState<string>(getInitialReportAction(reportID, session, personalDetailsList));
    const [error, setError] = useState<string>();
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            shouldEnableMinHeight={DeviceCapabilities.canUseTouchScreen()}
            testID={DebugReportActionCreatePage.displayName}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                    <HeaderWithBackButton
                        title={`${translate('debug.debug')} - ${translate('debug.createReportAction')}`}
                        onBackButtonPress={Navigation.goBack}
                    />
                    <ScrollView contentContainerStyle={[styles.ph5, styles.pb5, styles.gap5]}>
                        <View>
                            <Text style={[styles.textLabelSupporting, styles.mb2]}>{translate('debug.editJson')}</Text>
                            <TextInput
                                errorText={error}
                                accessibilityLabel="Text input field"
                                forceActiveLabel
                                numberOfLines={18}
                                multiline
                                value={draftReportAction}
                                onChangeText={(updatedJSON) => {
                                    try {
                                        const parsedReportAction = JSON.parse(updatedJSON.replaceAll('\n', '')) as ReportAction;
                                        if (!parsedReportAction.reportID) {
                                            throw SyntaxError(translate('debug.missingProperty', {propertyName: 'reportID'}));
                                        }
                                        if (!parsedReportAction.reportActionID) {
                                            throw SyntaxError(translate('debug.missingProperty', {propertyName: 'reportActionID'}));
                                        }
                                        if (!parsedReportAction.created) {
                                            throw SyntaxError(translate('debug.missingProperty', {propertyName: 'created'}));
                                        }
                                        if (!parsedReportAction.actionName) {
                                            throw SyntaxError(translate('debug.missingProperty', {propertyName: 'actionName'}));
                                        }
                                        setError('');
                                    } catch (e) {
                                        setError((e as SyntaxError).message);
                                    } finally {
                                        setDraftReportAction(updatedJSON);
                                    }
                                }}
                                textInputContainerStyles={[styles.border, styles.borderBottom, styles.p5]}
                            />
                        </View>
                        <View>
                            <Text style={[styles.textLabelSupporting, styles.mb2]}>{translate('debug.preview')}</Text>
                            {!error ? (
                                <ReportActionItem
                                    action={JSON.parse(draftReportAction.replaceAll('\n', '')) as ReportAction}
                                    report={{reportID}}
                                    reportActions={[]}
                                    parentReportAction={undefined}
                                    displayAsGroup={false}
                                    isMostRecentIOUReportAction={false}
                                    shouldDisplayNewMarker={false}
                                    index={0}
                                    isFirstVisibleReportAction={false}
                                    shouldDisplayContextMenu={false}
                                />
                            ) : (
                                <Text>{translate('debug.nothingToPreview')}</Text>
                            )}
                        </View>
                        <Text style={[styles.headerText, styles.textAlignCenter]}>{translate('debug.hint')}</Text>
                        <Button
                            success
                            text={translate('common.save')}
                            isDisabled={!draftReportAction}
                            onPress={() => {
                                if (!draftReportAction || error) {
                                    return;
                                }
                                const parsedReportAction = JSON.parse(draftReportAction.replaceAll('\n', '')) as ReportAction;
                                // eslint-disable-next-line rulesdir/prefer-actions-set-data
                                Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {[parsedReportAction.reportActionID]: parsedReportAction});
                                Navigation.navigate(ROUTES.DEBUG_REPORT_TAB_ACTIONS.getRoute(reportID));
                            }}
                        />
                    </ScrollView>
                </View>
            )}
        </ScreenWrapper>
    );
}

DebugReportActionCreatePage.displayName = 'DebugReportActionCreatePage';

export default DebugReportActionCreatePage;
