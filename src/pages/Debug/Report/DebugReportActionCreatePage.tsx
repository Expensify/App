import type {StackScreenProps} from '@react-navigation/stack';
import React, {useState} from 'react';
import {View} from 'react-native';
import Onyx, {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
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
import type {ReportAction} from '@src/types/onyx';

type DebugReportActionCreatePageProps = StackScreenProps<DebugParamList, typeof SCREENS.DEBUG.REPORT_ACTION_CREATE>;

function DebugReportActionCreatePage({
    route: {
        params: {reportID},
    },
}: DebugReportActionCreatePageProps) {
    const styles = useThemeStyles();
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [personalDetailsList] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [draftReportAction, setDraftReportAction] = useState<string>(
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
        ),
    );
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
                        title="Debug - Create Report Action"
                        onBackButtonPress={Navigation.goBack}
                    />
                    <ScrollView contentContainerStyle={[styles.ph5, styles.pb5, styles.gap5]}>
                        <View>
                            <Text style={[styles.textLabelSupporting, styles.mb2]}>Edit JSON:</Text>
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
                                            throw SyntaxError('Missing reportID property');
                                        }
                                        if (!parsedReportAction.reportActionID) {
                                            throw SyntaxError('Missing reportActionID property');
                                        }
                                        if (!parsedReportAction.created) {
                                            throw SyntaxError('Missing created property');
                                        }
                                        if (!parsedReportAction.actionName) {
                                            throw SyntaxError('Missing actionName property');
                                        }
                                        setError('');
                                    } catch (error) {
                                        setError(error.message as string);
                                    } finally {
                                        setDraftReportAction(updatedJSON);
                                    }
                                }}
                                textInputContainerStyles={[styles.border, styles.borderBottom, styles.p5]}
                            />
                        </View>
                        <View>
                            <Text style={[styles.textLabelSupporting, styles.mb2]}>Preview:</Text>
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
                                <Text>Nothing to preview</Text>
                            )}
                        </View>
                        <Button
                            success
                            text="Save"
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
