import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/ButtonComposed';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import DateUtils from '@libs/DateUtils';
import DebugUtils from '@libs/DebugUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {DebugParamList} from '@libs/Navigation/types';
import {rand64} from '@libs/NumberUtils';

import ReportActionItem from '@pages/inbox/report/ReportActionItem';

import Debug from '@userActions/Debug';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetailsList, ReportAction, Session} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';

type DebugReportActionCreatePageProps = PlatformStackScreenProps<DebugParamList, typeof SCREENS.DEBUG.REPORT_ACTION_CREATE>;

function isParsedReportAction(value: unknown): value is ReportAction {
    return typeof value === 'object' && value !== null && 'reportActionID' in value;
}

function parseReportActionJSON(draftReportAction: string): ReportAction | null {
    try {
        const parsedReportAction: unknown = JSON.parse(draftReportAction.replaceAll('\n', ''));
        return isParsedReportAction(parsedReportAction) ? parsedReportAction : null;
    } catch {
        return null;
    }
}

const getInitialReportAction = (reportID: string, session: OnyxEntry<Session>, personalDetailsList: OnyxEntry<PersonalDetailsList>) =>
    DebugUtils.stringifyJSON({
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        reportID,
        reportActionID: rand64(),
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
    const [draftReportAction, setDraftReportAction] = useState<string>(() => getInitialReportAction(reportID, session, personalDetailsList));
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.chatReportID)}`);

    const reportAction = useMemo(() => parseReportActionJSON(draftReportAction), [draftReportAction]);

    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportAction?.childReportID}`);

    const [error, setError] = useState<string>();

    const createReportAction = useCallback(() => {
        if (!reportAction) {
            return;
        }
        Debug.mergeDebugData(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
            [reportAction.reportActionID]: reportAction,
        });
        Navigation.navigate(ROUTES.DEBUG_REPORT_TAB_ACTIONS.getRoute(reportID));
    }, [reportAction, reportID]);

    const editJSON = useCallback(
        (updatedJSON: string) => {
            try {
                DebugUtils.validateReportActionJSON(updatedJSON);
                setError('');
            } catch (e) {
                const {cause, message} = e as SyntaxError;
                setError(cause ? translate(message as TranslationPaths, cause as never) : message);
            } finally {
                setDraftReportAction(updatedJSON);
            }
        },
        [translate],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            shouldEnableMinHeight={canUseTouchScreen()}
            testID="DebugReportActionCreatePage"
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
                                onChangeText={editJSON}
                                // We need to explicitly add styles.pt5 and styles.pb5 to override the default top and bottom padding of the text input
                                textInputContainerStyles={[styles.border, styles.borderBottom, styles.ph5, styles.pt5, styles.pb5]}
                            />
                        </View>
                        <View>
                            <Text style={[styles.textLabelSupporting, styles.mb2]}>{translate('debug.preview')}</Text>
                            {!error && reportAction ? (
                                <ReportActionItem
                                    action={reportAction}
                                    transactionThreadReport={transactionThreadReport}
                                    report={report}
                                    chatReport={chatReport}
                                    parentReportAction={undefined}
                                    displayAsGroup={false}
                                    shouldDisplayNewMarker={false}
                                    isFirstVisibleReportAction={false}
                                    shouldDisplayContextMenu={false}
                                />
                            ) : (
                                <Text>{translate('debug.nothingToPreview')}</Text>
                            )}
                        </View>
                        <Text style={[styles.headerText, styles.textAlignCenter]}>{translate('debug.hint')}</Text>
                        <Button
                            variant="success"
                            isDisabled={!draftReportAction || !!error}
                            onPress={createReportAction}
                        >
                            <Button.Text>{translate('common.save')}</Button.Text>
                        </Button>
                    </ScrollView>
                </View>
            )}
        </ScreenWrapper>
    );
}

export default DebugReportActionCreatePage;
