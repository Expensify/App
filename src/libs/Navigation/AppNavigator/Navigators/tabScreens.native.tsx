import HomePage from '@pages/home/HomePage';
import InsightsPage from '@pages/Insights/InsightsPage';

import ReportsSplitNavigator from './ReportsSplitNavigator';
import SettingsSplitNavigator from './SettingsSplitNavigator';
import WorkspaceNavigator from './WorkspaceNavigator';

/**
 * The tab screens handed over as they are. Code splitting buys nothing here, the whole bundle is already on the
 * device, and going through `lazy` would put a spinner in front of a tab the first time it is opened.
 */
const HomePageScreen = HomePage;
const ReportsSplitNavigatorScreen = ReportsSplitNavigator;
const SettingsSplitNavigatorScreen = SettingsSplitNavigator;
const WorkspaceNavigatorScreen = WorkspaceNavigator;
const InsightsPageScreen = InsightsPage;

export {HomePageScreen, ReportsSplitNavigatorScreen, SettingsSplitNavigatorScreen, WorkspaceNavigatorScreen, InsightsPageScreen};
