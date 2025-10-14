import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
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
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import Icon from './Icon';
import {Camera} from './Icon/Expensicons';
import {PressableWithoutFeedback} from './Pressable';

const sessionSelector = (session: OnyxEntry<OnyxTypes.Session>) => ({email: session?.email, accountID: session?.accountID});

function FloatingCameraButton() {
    const {textLight} = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false, selector: sessionSelector});
    const [allTransactionDrafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {canBeMissing: true});
    const reportID = useMemo(() => generateReportID(), []);

    const [policyChatForActivePolicy] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        canBeMissing: true,
        selector: (reports) => {
            if (isEmptyObject(activePolicy) || !activePolicy?.isPolicyExpenseChatEnabled) {
                return undefined;
            }
            const policyChatsForActivePolicy = getWorkspaceChats(activePolicyID, [session?.accountID ?? CONST.DEFAULT_NUMBER_ID], reports);
            return policyChatsForActivePolicy.at(0);
        },
    });

    const onPress = () => {
        interceptAnonymousUser(() => {
            if (policyChatForActivePolicy?.policyID && shouldRestrictUserBillableActions(policyChatForActivePolicy.policyID)) {
                Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policyChatForActivePolicy.policyID));
                return;
            }

            const quickActionReportID = policyChatForActivePolicy?.reportID ?? reportID;
            startMoneyRequest(CONST.IOU.TYPE.SUBMIT, quickActionReportID, CONST.IOU.REQUEST_TYPE.SCAN, true, undefined, allTransactionDrafts);
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
        >
            <View
                style={styles.floatingActionButton}
                testID="floating-camera-button-container"
            >
                <Icon
                    fill={textLight}
                    src={Camera}
                    width={variables.iconSizeNormal}
                    height={variables.iconSizeNormal}
                />
            </View>
        </PressableWithoutFeedback>
    );
}

FloatingCameraButton.displayName = 'FloatingCameraButton';

export default FloatingCameraButton;
