"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CENTRAL_PANE_WORKSPACE_SCREENS = void 0;
var react_1 = require("react");
var react_native_1 = require("react-native");
var FocusTrapForScreen_1 = require("@components/FocusTrap/FocusTrapForScreen");
var GetStateForActionHandlers_1 = require("@libs/Navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers");
var createSplitNavigator_1 = require("@libs/Navigation/AppNavigator/createSplitNavigator");
var useSplitNavigatorScreenOptions_1 = require("@libs/Navigation/AppNavigator/useSplitNavigatorScreenOptions");
var animation_1 = require("@libs/Navigation/PlatformStackNavigation/navigationOptions/animation");
var SCREENS_1 = require("@src/SCREENS");
var loadWorkspaceInitialPage = function () { return require('../../../../pages/workspace/WorkspaceInitialPage').default; };
var CENTRAL_PANE_WORKSPACE_SCREENS = (_a = {},
    _a[SCREENS_1.default.WORKSPACE.PROFILE] = function () { return require('../../../../pages/workspace/WorkspaceOverviewPage').default; },
    _a[SCREENS_1.default.WORKSPACE.WORKFLOWS] = function () { return require('../../../../pages/workspace/workflows/WorkspaceWorkflowsPage').default; },
    _a[SCREENS_1.default.WORKSPACE.INVOICES] = function () { return require('../../../../pages/workspace/invoices/WorkspaceInvoicesPage').default; },
    _a[SCREENS_1.default.WORKSPACE.MEMBERS] = function () { return require('../../../../pages/workspace/WorkspaceMembersPage').default; },
    _a[SCREENS_1.default.WORKSPACE.ACCOUNTING.ROOT] = function () { return require('../../../../pages/workspace/accounting/PolicyAccountingPage').default; },
    _a[SCREENS_1.default.WORKSPACE.CATEGORIES] = function () { return require('../../../../pages/workspace/categories/WorkspaceCategoriesPage').default; },
    _a[SCREENS_1.default.WORKSPACE.MORE_FEATURES] = function () { return require('../../../../pages/workspace/WorkspaceMoreFeaturesPage').default; },
    _a[SCREENS_1.default.WORKSPACE.TAGS] = function () { return require('../../../../pages/workspace/tags/WorkspaceTagsPage').default; },
    _a[SCREENS_1.default.WORKSPACE.TAXES] = function () { return require('../../../../pages/workspace/taxes/WorkspaceTaxesPage').default; },
    _a[SCREENS_1.default.WORKSPACE.REPORT_FIELDS] = function () { return require('../../../../pages/workspace/reportFields/WorkspaceReportFieldsPage').default; },
    _a[SCREENS_1.default.WORKSPACE.EXPENSIFY_CARD] = function () { return require('../../../../pages/workspace/expensifyCard/WorkspaceExpensifyCardPage').default; },
    _a[SCREENS_1.default.WORKSPACE.COMPANY_CARDS] = function () { return require('../../../../pages/workspace/companyCards/WorkspaceCompanyCardsPage').default; },
    _a[SCREENS_1.default.WORKSPACE.PER_DIEM] = function () { return require('../../../../pages/workspace/perDiem/WorkspacePerDiemPage').default; },
    _a[SCREENS_1.default.WORKSPACE.DISTANCE_RATES] = function () { return require('../../../../pages/workspace/distanceRates/PolicyDistanceRatesPage').default; },
    _a[SCREENS_1.default.WORKSPACE.RULES] = function () { return require('../../../../pages/workspace/rules/PolicyRulesPage').default; },
    _a);
exports.CENTRAL_PANE_WORKSPACE_SCREENS = CENTRAL_PANE_WORKSPACE_SCREENS;
var Split = (0, createSplitNavigator_1.default)();
function WorkspaceSplitNavigator(_a) {
    var route = _a.route, navigation = _a.navigation;
    var splitNavigatorScreenOptions = (0, useSplitNavigatorScreenOptions_1.default)();
    (0, react_1.useEffect)(function () {
        var unsubscribe = navigation.addListener('transitionEnd', function () {
            // We want to call this function only once.
            unsubscribe();
            // If we open this screen from a different tab, then it won't have animation.
            if (!GetStateForActionHandlers_1.workspaceSplitsWithoutEnteringAnimation.has(route.key)) {
                return;
            }
            // We want to set animation after mounting so it will animate on going UP to the settings split.
            navigation.setOptions({ animation: animation_1.default.SLIDE_FROM_RIGHT });
        });
        return unsubscribe;
    }, [navigation, route.key]);
    return (<FocusTrapForScreen_1.default>
            <react_native_1.View style={{ flex: 1 }}>
                <Split.Navigator persistentScreens={[SCREENS_1.default.WORKSPACE.INITIAL]} sidebarScreen={SCREENS_1.default.WORKSPACE.INITIAL} defaultCentralScreen={SCREENS_1.default.WORKSPACE.PROFILE} parentRoute={route} screenOptions={splitNavigatorScreenOptions.centralScreen}>
                    <Split.Screen name={SCREENS_1.default.WORKSPACE.INITIAL} getComponent={loadWorkspaceInitialPage} options={splitNavigatorScreenOptions.sidebarScreen}/>
                    {Object.entries(CENTRAL_PANE_WORKSPACE_SCREENS).map(function (_a) {
            var screenName = _a[0], componentGetter = _a[1];
            return (<Split.Screen key={screenName} name={screenName} getComponent={componentGetter}/>);
        })}
                </Split.Navigator>
            </react_native_1.View>
        </FocusTrapForScreen_1.default>);
}
WorkspaceSplitNavigator.displayName = 'WorkspaceSplitNavigator';
exports.default = WorkspaceSplitNavigator;
