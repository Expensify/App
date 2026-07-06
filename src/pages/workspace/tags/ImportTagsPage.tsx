import ImportSpreadsheet from "@components/ImportSpreadsheet";
import useDynamicBackPath from "@hooks/useDynamicBackPath";
import useOnyx from "@hooks/useOnyx";
import usePolicy from "@hooks/usePolicy";
import createDynamicRoute from "@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute";
import type { PlatformStackScreenProps } from "@libs/Navigation/PlatformStackNavigation/types";
import type { SettingsNavigatorParamList } from "@libs/Navigation/types";
import {
  goBackFromInvalidPolicy,
  hasAccountingConnections as hasAccountingConnectionsPolicyUtils,
} from "@libs/PolicyUtils";

import NotFoundPage from "@pages/ErrorPage/NotFoundPage";
import AccessOrNotFoundWrapper from "@pages/workspace/AccessOrNotFoundWrapper";

import CONST from "@src/CONST";
import ONYXKEYS from "@src/ONYXKEYS";
import ROUTES, { DYNAMIC_ROUTES } from "@src/ROUTES";
import SCREENS from "@src/SCREENS";
import { isEmptyObject } from "@src/types/utils/EmptyObject";
import isLoadingOnyxValue from "@src/types/utils/isLoadingOnyxValue";

import React from "react";

type ImportTagsPageProps =
  | PlatformStackScreenProps<
      SettingsNavigatorParamList,
      typeof SCREENS.WORKSPACE.DYNAMIC_TAGS_IMPORT
    >
  | PlatformStackScreenProps<
      SettingsNavigatorParamList,
      typeof SCREENS.SETTINGS_TAGS.SETTINGS_TAGS_IMPORT
    >;

function ImportTagsPage({ route }: ImportTagsPageProps) {
  const policyID = route.params.policyID;
  const policy = usePolicy(policyID);
  const hasAccountingConnections = hasAccountingConnectionsPolicyUtils(policy);
  const isQuickSettingsFlow =
    route.name === SCREENS.SETTINGS_TAGS.SETTINGS_TAGS_IMPORT;
  const backTo =
    isQuickSettingsFlow && "backTo" in route.params
      ? route.params.backTo
      : undefined;
  const [spreadsheet, spreadsheetMetadata] = useOnyx(
    ONYXKEYS.IMPORTED_SPREADSHEET,
  );

  const workspaceTagsListBackPath = useDynamicBackPath(
    DYNAMIC_ROUTES.WORKSPACE_TAGS_IMPORT.path,
  );
  const workspaceGoToImportedPath = createDynamicRoute(
    DYNAMIC_ROUTES.WORKSPACE_TAGS_IMPORTED.path,
    ROUTES.WORKSPACE_TAGS.getRoute(policyID),
  );

  if (!spreadsheet && isLoadingOnyxValue(spreadsheetMetadata)) {
    return;
  }
  if (hasAccountingConnections) {
    return <NotFoundPage />;
  }

  return (
    <AccessOrNotFoundWrapper
      policyID={policyID}
      accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
      featureName={CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED}
      fullPageNotFoundViewProps={{
        subtitleKey: isEmptyObject(policy)
          ? undefined
          : "workspace.common.notAuthorized",
        onLinkPress: goBackFromInvalidPolicy,
      }}
    >
      <ImportSpreadsheet
        backTo={isQuickSettingsFlow ? backTo : workspaceTagsListBackPath}
        goTo={(() => {
          if (isQuickSettingsFlow) {
            return ROUTES.SETTINGS_TAGS_IMPORTED.getRoute(policyID, backTo);
          }
          if (spreadsheet?.isImportingMultiLevelTags) {
            return ROUTES.WORKSPACE_MULTI_LEVEL_TAGS_IMPORT_SETTINGS.getRoute(
              policyID,
            );
          }
          return workspaceGoToImportedPath;
        })()}
        isImportingMultiLevelTags={spreadsheet?.isImportingMultiLevelTags}
        shouldForceReplaceNavigation={
          !isQuickSettingsFlow && !spreadsheet?.isImportingMultiLevelTags
        }
      />
    </AccessOrNotFoundWrapper>
  );
}

export default ImportTagsPage;
