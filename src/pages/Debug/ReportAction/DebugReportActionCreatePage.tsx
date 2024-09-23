import React, {useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import DebugUtils from '@libs/DebugUtils';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {DebugParamList} from '@libs/Navigation/types';
import * as NumberUtils from '@libs/NumberUtils';
import ReportActionItem from '@pages/home/report/ReportActionItem';
import Debug from '@userActions/Debug';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetailsList, ReportAction, Session} from '@src/types/onyx';

type DebugReportActionCreatePageProps = PlatformStackScreenProps<DebugParamList, typeof SCREENS.DEBUG.REPORT_ACTION_CREATE>;

const getInitialReportAction = (reportID: string, session: OnyxEntry<Session>, personalDetailsList: OnyxEntry<PersonalDetailsList>) =>
    DebugUtils.stringifyJSON({
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        reportID,
        reportActionID: NumberUtils.rand64(),
        created: DateUtils.getDBTime(),
        actorAccountID: session?.accountID,
        avatar: (session?.accountID && personalDetailsList?.[session.accountID]?.avatar) ?? '',
        message: [{type: CONST.REPORT.MESSAGE.TYPE.COMMENT, html: 'Hello world!', text: 'Hello world!'}],
    } satisfies ReportAction);

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
                                accessibilityLabel={translate('debug.editJson')}
                                forceActiveLabel
                                numberOfLines={18}
                                multiline
                                value={draftReportAction}
                                onChangeText={(updatedJSON) => {
                                    try {
                                        DebugUtils.validateReportActionJSON(updatedJSON);
                                        setError('');
                                    } catch (e) {
                                        const {cause, message} = e as SyntaxError;
                                        setError(cause ? translate(message as TranslationPaths, cause as never) : message);
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
                            isDisabled={!draftReportAction || !!error}
                            onPress={() => {
                                const parsedReportAction = JSON.parse(draftReportAction.replaceAll('\n', '')) as ReportAction;
                                Debug.mergeDebugData(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {[parsedReportAction.reportActionID]: parsedReportAction});
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
