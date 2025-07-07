"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var NoDropZone_1 = require("@components/DragAndDrop/NoDropZone");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Transaction_1 = require("@libs/actions/Transaction");
var TwoFactorAuthActions_1 = require("@libs/actions/TwoFactorAuthActions");
var hideKeyboardOnSwipe_1 = require("@libs/Navigation/AppNavigator/hideKeyboardOnSwipe");
var ModalStackNavigators = require("@libs/Navigation/AppNavigator/ModalStackNavigators");
var useCustomScreenOptions_1 = require("@libs/Navigation/AppNavigator/useCustomScreenOptions");
var createPlatformStackNavigator_1 = require("@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator");
var CONST_1 = require("@src/CONST");
var NAVIGATORS_1 = require("@src/NAVIGATORS");
var SCREENS_1 = require("@src/SCREENS");
var NarrowPaneContext_1 = require("./NarrowPaneContext");
var Overlay_1 = require("./Overlay");
var Stack = (0, createPlatformStackNavigator_1.default)();
function RightModalNavigator(_a) {
    var navigation = _a.navigation, route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var isExecutingRef = (0, react_1.useRef)(false);
    var screenOptions = (0, useCustomScreenOptions_1.default)();
    return (<NarrowPaneContext_1.NarrowPaneContextProvider>
            <NoDropZone_1.default>
                {!shouldUseNarrowLayout && (<Overlay_1.default onPress={function () {
                if (isExecutingRef.current) {
                    return;
                }
                isExecutingRef.current = true;
                navigation.goBack();
                setTimeout(function () {
                    isExecutingRef.current = false;
                }, CONST_1.default.ANIMATED_TRANSITION);
            }}/>)}
                <react_native_1.View style={styles.RHPNavigatorContainer(shouldUseNarrowLayout)}>
                    <Stack.Navigator screenOptions={screenOptions} screenListeners={{
            blur: function () {
                var _a, _b, _c;
                if (
                // @ts-expect-error There is something wrong with a types here and it's don't see the params list
                ((_b = (_a = navigation.getState().routes.find(function (routes) { return routes.name === NAVIGATORS_1.default.RIGHT_MODAL_NAVIGATOR; })) === null || _a === void 0 ? void 0 : _a.params) === null || _b === void 0 ? void 0 : _b.screen) ===
                    SCREENS_1.default.RIGHT_MODAL.TRANSACTION_DUPLICATE ||
                    ((_c = route.params) === null || _c === void 0 ? void 0 : _c.screen) !== SCREENS_1.default.RIGHT_MODAL.TRANSACTION_DUPLICATE) {
                    return;
                }
                // Delay clearing review duplicate data till the RHP is completely closed
                // to avoid not found showing briefly in confirmation page when RHP is closing
                react_native_1.InteractionManager.runAfterInteractions(function () {
                    (0, Transaction_1.abandonReviewDuplicateTransactions)();
                });
            },
        }} id={NAVIGATORS_1.default.RIGHT_MODAL_NAVIGATOR}>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.SETTINGS} component={ModalStackNavigators.SettingsModalStackNavigator}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.TWO_FACTOR_AUTH} component={ModalStackNavigators.TwoFactorAuthenticatorStackNavigator} listeners={{
            beforeRemove: function () {
                react_native_1.InteractionManager.runAfterInteractions(TwoFactorAuthActions_1.clearTwoFactorAuthData);
            },
        }}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.NEW_CHAT} component={ModalStackNavigators.NewChatModalStackNavigator}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.PROFILE} component={ModalStackNavigators.ProfileModalStackNavigator}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.DEBUG} component={ModalStackNavigators.DebugModalStackNavigator}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.NEW_REPORT_WORKSPACE_SELECTION} component={ModalStackNavigators.NewReportWorkspaceSelectionModalStackNavigator}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.REPORT_DETAILS} component={ModalStackNavigators.ReportDetailsModalStackNavigator}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.REPORT_CHANGE_WORKSPACE} component={ModalStackNavigators.ReportChangeWorkspaceModalStackNavigator}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.REPORT_SETTINGS} component={ModalStackNavigators.ReportSettingsModalStackNavigator}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.REPORT_DESCRIPTION} component={ModalStackNavigators.ReportDescriptionModalStackNavigator}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.SETTINGS_CATEGORIES} component={ModalStackNavigators.CategoriesModalStackNavigator}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.SETTINGS_TAGS} component={ModalStackNavigators.TagsModalStackNavigator}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.EXPENSIFY_CARD} component={ModalStackNavigators.ExpensifyCardModalStackNavigator}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.DOMAIN_CARD} component={ModalStackNavigators.DomainCardModalStackNavigator}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.PARTICIPANTS} component={ModalStackNavigators.ReportParticipantsModalStackNavigator}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.ROOM_MEMBERS} component={ModalStackNavigators.RoomMembersModalStackNavigator}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.MONEY_REQUEST} component={ModalStackNavigators.MoneyRequestModalStackNavigator}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.WORKSPACE_CONFIRMATION} component={ModalStackNavigators.WorkspaceConfirmationModalStackNavigator}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.NEW_TASK} component={ModalStackNavigators.NewTaskModalStackNavigator}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.TEACHERS_UNITE} component={ModalStackNavigators.NewTeachersUniteNavigator}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.TASK_DETAILS} component={ModalStackNavigators.TaskModalStackNavigator}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.ENABLE_PAYMENTS} component={ModalStackNavigators.EnablePaymentsStackNavigator}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.SPLIT_DETAILS} component={ModalStackNavigators.SplitDetailsModalStackNavigator}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.ADD_PERSONAL_BANK_ACCOUNT} component={ModalStackNavigators.AddPersonalBankAccountModalStackNavigator}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.WALLET_STATEMENT} component={ModalStackNavigators.WalletStatementStackNavigator}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.FLAG_COMMENT} component={ModalStackNavigators.FlagCommentStackNavigator}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.EDIT_REQUEST} component={ModalStackNavigators.EditRequestStackNavigator}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.SIGN_IN} component={ModalStackNavigators.SignInModalStackNavigator}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.REFERRAL} component={ModalStackNavigators.ReferralModalStackNavigator}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.PRIVATE_NOTES} component={ModalStackNavigators.PrivateNotesModalStackNavigator} options={hideKeyboardOnSwipe_1.default}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.TRANSACTION_DUPLICATE} component={ModalStackNavigators.TransactionDuplicateStackNavigator}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.TRAVEL} component={ModalStackNavigators.TravelModalStackNavigator}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.SEARCH_REPORT} component={ModalStackNavigators.SearchReportModalStackNavigator}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.RESTRICTED_ACTION} component={ModalStackNavigators.RestrictedActionModalStackNavigator}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.SEARCH_ADVANCED_FILTERS} component={ModalStackNavigators.SearchAdvancedFiltersModalStackNavigator}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.SEARCH_SAVED_SEARCH} component={ModalStackNavigators.SearchSavedSearchModalStackNavigator}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.MISSING_PERSONAL_DETAILS} component={ModalStackNavigators.MissingPersonalDetailsModalStackNavigator}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.ADD_UNREPORTED_EXPENSE} component={ModalStackNavigators.AddUnreportedExpenseModalStackNavigator}/>
                        <Stack.Screen name={SCREENS_1.default.RIGHT_MODAL.SCHEDULE_CALL} component={ModalStackNavigators.ScheduleCallModalStackNavigator}/>
                    </Stack.Navigator>
                </react_native_1.View>
            </NoDropZone_1.default>
        </NarrowPaneContext_1.NarrowPaneContextProvider>);
}
RightModalNavigator.displayName = 'RightModalNavigator';
exports.default = RightModalNavigator;
