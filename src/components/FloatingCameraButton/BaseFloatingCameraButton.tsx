import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Icon from '@components/Icon';
import {PressableWithoutFeedback} from '@components/Pressable';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {startMoneyRequest} from '@libs/actions/IOU';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import {generateReportID, getWorkspaceChats} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import variables from '@styles/variables';
import Tab from '@userActions/Tab';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';

const sessionSelector = (session: OnyxEntry<OnyxTypes.Session>) => ({email: session?.email, accountID: session?.accountID});

type BaseFloatingCameraButtonProps = {
    icon: IconAsset;
};

function BaseFloatingCameraButton({icon}: BaseFloatingCameraButtonProps) {
    const {textLight} = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false, selector: sessionSelector});
    const [allTransactionDrafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {canBeMissing: true});
    const reportID = useMemo(() => generateReportID(), []);

    const policyChatForActivePolicySelector = useCallback(
        (reports: OnyxCollection<OnyxTypes.Report>) => {
            if (isEmptyObject(activePolicy) || !activePolicy?.isPolicyExpenseChatEnabled) {
                return undefined;
            }
            const policyChatsForActivePolicy = getWorkspaceChats(activePolicyID, [session?.accountID ?? CONST.DEFAULT_NUMBER_ID], reports);
            return policyChatsForActivePolicy.at(0);
        },
        [activePolicy, activePolicyID, session?.accountID],
    );
    const [policyChatForActivePolicy] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true, selector: policyChatForActivePolicySelector}, [policyChatForActivePolicySelector]);

    const onPress = () => {
        interceptAnonymousUser(() => {
            if (policyChatForActivePolicy?.policyID && shouldRestrictUserBillableActions(policyChatForActivePolicy.policyID)) {
                Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policyChatForActivePolicy.policyID));
                return;
            }

            const quickActionReportID = policyChatForActivePolicy?.reportID ?? reportID;
            Tab.setSelectedTab(CONST.TAB.IOU_REQUEST_TYPE, CONST.IOU.REQUEST_TYPE.SCAN);
            startMoneyRequest(CONST.IOU.TYPE.CREATE, quickActionReportID, CONST.IOU.REQUEST_TYPE.SCAN, !!policyChatForActivePolicy?.reportID, undefined, allTransactionDrafts, true);
        });
    };

    return (
        <PressableWithoutFeedback
            style={[
                styles.navigationTabBarFABItem,
                styles.ph0,
                // Prevent text selection on touch devices (e.g. on long press)
                canUseTouchScreen() && styles.userSelectNone,
                styles.floatingCameraButton,
            ]}
            accessibilityLabel={translate('sidebarScreen.fabScanReceiptExplained')}
            onPress={onPress}
            role={CONST.ROLE.BUTTON}
            testID="floating-camera-button"
            sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.FLOATING_CAMERA_BUTTON}
        >
            <View
                style={styles.floatingActionButton}
                testID="floating-camera-button-container"
            >
                <Icon
                    fill={textLight}
                    src={icon}
                    width={variables.iconSizeNormal}
                    height={variables.iconSizeNormal}
                />
            </View>
        </PressableWithoutFeedback>
    );
}

export default BaseFloatingCameraButton;
