import Button from "@components/Button";
import FixedFooter from "@components/FixedFooter";
import HeaderWithBackButton from "@components/HeaderWithBackButton";
import Icon from "@components/Icon";
import RenderHTML from "@components/RenderHTML";
import ScreenWrapper from "@components/ScreenWrapper";
import Text from "@components/Text";
import useDynamicBackPath from "@hooks/useDynamicBackPath";
import { useMemoizedLazyExpensifyIcons } from "@hooks/useLazyAsset";
import useLocalize from "@hooks/useLocalize";
import usePolicy from "@hooks/usePolicy";
import useThemeStyles from "@hooks/useThemeStyles";

import type { PlatformStackScreenProps } from "@libs/Navigation/PlatformStackNavigation/types";

import Navigation from "@navigation/Navigation";
import type { SettingsNavigatorParamList } from "@navigation/types";

import AccessOrNotFoundWrapper from "@pages/workspace/AccessOrNotFoundWrapper";

import { clearWorkspaceOwnerChangeFlow } from "@userActions/Policy/Member";

import CONST from "@src/CONST";
import { DYNAMIC_ROUTES } from "@src/ROUTES";
import type SCREENS from "@src/SCREENS";
import React, { useCallback, useRef } from "react";
import { View } from "react-native";

type DynamicWorkspaceOwnerChangeErrorPageProps = PlatformStackScreenProps<
  SettingsNavigatorParamList,
  typeof SCREENS.WORKSPACE.DYNAMIC_OWNER_CHANGE_ERROR
>;

function DynamicWorkspaceOwnerChangeErrorPage({
  route,
}: DynamicWorkspaceOwnerChangeErrorPageProps) {
  const styles = useThemeStyles();
  const { translate } = useLocalize();
  const icons = useMemoizedLazyExpensifyIcons(["MoneyWaving"]);

  const policyID = route.params.policyID;
  const backPath = useDynamicBackPath(
    DYNAMIC_ROUTES.WORKSPACE_OWNER_CHANGE_ERROR.path,
  );

  const closePage = useCallback(() => {
    Navigation.goBack(backPath);
    clearWorkspaceOwnerChangeFlow(policyID);
  }, [backPath, policyID]);

  const policy = usePolicy(policyID);
  const shouldShowRef = useRef(
    !policy?.errorFields && policy?.isChangeOwnerFailed,
  );

  return (
    <AccessOrNotFoundWrapper
      accessVariants={[
        CONST.POLICY.ACCESS_VARIANTS.ADMIN,
        CONST.POLICY.ACCESS_VARIANTS.PAID,
      ]}
      policyID={policyID}
      shouldBeBlocked={!shouldShowRef.current}
    >
      <ScreenWrapper
        testID="DynamicWorkspaceOwnerChangeErrorPage"
        enableEdgeToEdgeBottomSafeAreaPadding
      >
        <HeaderWithBackButton
          title={translate("workspace.changeOwner.changeOwnerPageTitle")}
          onBackButtonPress={closePage}
        />
        <View style={[styles.screenCenteredContainer, styles.alignItemsCenter]}>
          <Icon
            src={icons.MoneyWaving}
            width={187}
            height={173}
            fill=""
            additionalStyles={styles.mb3}
          />
          <Text
            style={[styles.textHeadline, styles.textAlignCenter, styles.mv2]}
          >
            {translate("workspace.changeOwner.errorTitle")}
          </Text>
          <View style={[styles.renderHTML, styles.flexRow]}>
            <RenderHTML
              html={translate("workspace.changeOwner.errorDescription")}
            />
          </View>
        </View>
        <FixedFooter addBottomSafeAreaPadding>
          <Button
            success
            large
            text={translate("common.buttonConfirm")}
            style={styles.mt6}
            pressOnEnter
            onPress={closePage}
          />
        </FixedFooter>
      </ScreenWrapper>
    </AccessOrNotFoundWrapper>
  );
}

export default DynamicWorkspaceOwnerChangeErrorPage;
