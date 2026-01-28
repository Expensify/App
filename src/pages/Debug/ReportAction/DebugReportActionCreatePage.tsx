import {isUserValidatedSelector} from '@selectors/Account';
import {tierNameSelector} from '@selectors/UserWallet';
import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
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

type DebugReportActionCreatePageProps = PlatformStackScreenProps<DebugParamList, typeof SCREENS.DEBUG.REPORT_ACTION_CREATE>;

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
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const [personalDetailsList] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const [userWalletTierName] = useOnyx(ONYXKEYS.USER_WALLET, {selector: tierNameSelector, canBeMissing: false});
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector, canBeMissing: true});
    const [draftReportAction, setDraftReportAction] = useState<string>(() => getInitialReportAction(reportID, session, personalDetailsList));
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID, {canBeMissing: true});
    const [tryNewDot] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT, {canBeMissing: false});
    const isTryNewDotNVPDismissed = !!tryNewDot?.classicRedirect?.dismissed;

    const [error, setError] = useState<string>();

    const createReportAction = useCallback(() => {
        const parsedReportAction = JSON.parse(draftReportAction.replaceAll('\n', '')) as ReportAction;
        Debug.mergeDebugData(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
            [parsedReportAction.reportActionID]: parsedReportAction,
        });
        Navigation.navigate(ROUTES.DEBUG_REPORT_TAB_ACTIONS.getRoute(reportID));
    }, [draftReportAction, reportID]);

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
                            {!error ? (
                                <ReportActionItem
                                    allReports={allReports}
                                    policies={policies}
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
                                    userWalletTierName={userWalletTierName}
                                    isUserValidated={isUserValidated}
                                    personalDetails={personalDetailsList}
                                    userBillingFundID={userBillingFundID}
                                    isTryNewDotNVPDismissed={isTryNewDotNVPDismissed}
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
                            onPress={createReportAction}
                        />
                    </ScrollView>
                </View>
            )}
        </ScreenWrapper>
    );
}

export default DebugReportActionCreatePage;
