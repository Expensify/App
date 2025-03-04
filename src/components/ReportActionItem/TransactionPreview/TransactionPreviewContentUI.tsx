import React, { useMemo } from "react";
import {  View  } from "react-native";
import Button from '@components/Button';
import Icon from '@components/Icon';
import { DotIndicator, Folder, Tag } from '@components/Icon/Expensicons';
import MoneyRequestSkeletonView from '@components/MoneyRequestSkeletonView';
import MultipleAvatars from '@components/MultipleAvatars';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import ReportActionItemImages from '@components/ReportActionItem/ReportActionItemImages';
import Text from '@components/Text';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import ControlSelection from '@libs/ControlSelection';
import { convertToDisplayString } from '@libs/CurrencyUtils';
import { canUseTouchScreen } from '@libs/DeviceCapabilities';
import { getCleanedTagName } from '@libs/PolicyUtils';
import variables from '@styles/variables';
import type { TransactionPreviewUIProps } from './types';

function TransactionPreviewContentUI({
    isDeleted,
    isScanning,
    isWhisper,
    isHovered,
    isSettled,
    isBillSplit,
    isApproved,
    isSettlementOrApprovalPartial,
    isReviewDuplicateTransactionPage,
    shouldShowSkeleton,
    shouldShowRBR,
    shouldDisableOnPress,
    shouldShowKeepButton,
    shouldShowDescription,
    shouldShowMerchant,
    shouldShowCategory,
    shouldShowTag,
    displayAmount,
    category,
    showCashOrCard,
    tag,
    requestCurrency,
    merchantOrDescription,
    previewHeaderText,
    requestAmount,
    splitShare,
    receiptImages,
    sortedParticipantAvatars,
    containerStyles,
    walletTermsErrors,
    pendingAction,
    showContextMenu,
    offlineWithFeedbackOnClose,
    translate,
    navigateToReviewFields,
    onPreviewPressed
}: TransactionPreviewUIProps) {
  const theme = useTheme();
  const styles = useThemeStyles();
  const StyleUtils = useStyleUtils();
  const {windowWidth} = useWindowDimensions();
  const {shouldUseNarrowLayout} = useResponsiveLayout();

  const themeStyles = useMemo(() => [{
    backgroundColor: theme.cardBG
  }], [theme.cardBG]);

  const shouldShowCategoryOrTag = shouldShowCategory || shouldShowTag;

  const childContainer = (
    <View>
      <OfflineWithFeedback
        errors={walletTermsErrors}
        onClose={() => offlineWithFeedbackOnClose}
        errorRowStyles={[styles.mbn1]}
        needsOffscreenAlphaCompositing
        pendingAction={pendingAction}
        shouldDisableStrikeThrough={isDeleted}
        shouldDisableOpacity={isDeleted}
      >
        <View
          style={[
            isScanning || isWhisper ? [styles.reportPreviewBoxHoverBorder, styles.reportContainerBorderRadius] : undefined,
            !onPreviewPressed ? [styles.moneyRequestPreviewBox, containerStyles, themeStyles] : {},
          ]}
        >
          {!isDeleted && (
            <ReportActionItemImages
              images={receiptImages}
              isHovered={isHovered || isScanning}
              size={1}
            />
          )}
          {shouldShowSkeleton ? (
            <MoneyRequestSkeletonView />
          ) : (
            <View style={[styles.expenseAndReportPreviewBoxBody, styles.mtn1]}>
              <View style={styles.expenseAndReportPreviewTextButtonContainer}>
                <View style={styles.expenseAndReportPreviewTextContainer}>
                  <View style={[styles.flexRow]}>
                    <Text style={[styles.textLabelSupporting, styles.flex1, styles.lh16]}>{previewHeaderText}</Text>
                    {!isSettled && shouldShowRBR && (
                      <Icon
                        src={DotIndicator}
                        fill={theme.danger}
                        small
                      />
                    )}
                  </View>
                  <View>
                    <View style={[styles.flexRow]}>
                      <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                        {(shouldShowMerchant || shouldShowDescription) && (
                        <Text
                          fontSize={variables.fontSizeLarge}
                          style={[
                            isBillSplit &&
                            StyleUtils.getAmountFontSizeAndLineHeight(
                              shouldUseNarrowLayout,
                              windowWidth,
                              displayAmount.length,
                              sortedParticipantAvatars.length,
                            ),
                            isDeleted && styles.lineThrough,
                          ]}
                          numberOfLines={1}
                        >
                          {merchantOrDescription}
                        </Text>
                          )}
                        <Text

                          fontSize={variables.fontSizeLarge}
                          style={[
                            isBillSplit &&
                            StyleUtils.getAmountFontSizeAndLineHeight(
                              shouldUseNarrowLayout,
                              windowWidth,
                              displayAmount.length,
                              sortedParticipantAvatars.length,
                            ),
                            isDeleted && styles.lineThrough,
                          ]}
                          numberOfLines={1}
                        >
                          {displayAmount}
                        </Text>
                      </View>
                      {isBillSplit && (
                        <View style={styles.moneyRequestPreviewBoxAvatar}>
                          <MultipleAvatars
                            icons={sortedParticipantAvatars}
                            shouldStackHorizontally
                            size="small"
                            shouldUseCardBackground
                          />
                        </View>
                      )}
                    </View>
                    <View style={[styles.flexRow]}>
                      {!!splitShare && (
                        <Text style={[styles.textLabel, styles.colorMuted, styles.amountSplitPadding]}>
                          {translate('iou.yourSplit', {amount: convertToDisplayString(splitShare, requestCurrency)})}
                        </Text>
                      )}
                    </View>
                  </View>
                  {shouldShowCategoryOrTag && (
                    <View style={[styles.flexRow, styles.pt1, styles.alignItemsCenter]}>
                      {shouldShowCategory && (
                        <View
                          style={[
                            styles.flexRow,
                            styles.alignItemsCenter,
                            styles.gap1,
                            shouldShowTag && styles.mw50,
                            shouldShowTag && styles.pr1,
                            styles.flexShrink1,
                          ]}
                        >
                          <Icon
                            src={Folder}
                            height={variables.iconSizeExtraSmall}
                            width={variables.iconSizeExtraSmall}
                            fill={theme.icon}
                          />
                          <Text
                            numberOfLines={1}
                            style={[styles.textMicroSupporting, styles.pre, styles.flexShrink1]}
                          >
                            {category}
                          </Text>
                        </View>
                      )}
                      {shouldShowTag && !!tag && (
                        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap1, category && styles.pl1]}>
                          <Icon
                            src={Tag}
                            height={variables.iconSizeExtraSmall}
                            width={variables.iconSizeExtraSmall}
                            fill={theme.icon}
                          />
                          <Text
                            numberOfLines={1}
                            style={[styles.textMicroSupporting, styles.pre, styles.flexShrink1]}
                          >
                            {getCleanedTagName(tag)}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}
        </View>
      </OfflineWithFeedback>
    </View>
  );

  if (!onPreviewPressed) {
    return childContainer;
  }

  return (
    <PressableWithoutFeedback
      onPress={shouldDisableOnPress ? undefined : onPreviewPressed}
      onPressIn={() => canUseTouchScreen() && ControlSelection.block()}
      onPressOut={() => ControlSelection.unblock()}
      onLongPress={showContextMenu}
      shouldUseHapticsOnLongPress
      accessibilityLabel={isBillSplit ? translate('iou.split') : showCashOrCard}
      accessibilityHint={convertToDisplayString(requestAmount, requestCurrency)}
      style={[
        styles.moneyRequestPreviewBox,
        containerStyles,
        themeStyles,
        shouldDisableOnPress && styles.cursorDefault,
        (isSettled || isApproved) && isSettlementOrApprovalPartial && styles.offlineFeedback.pending
      ]}
    >
      {childContainer}
      {isReviewDuplicateTransactionPage && !isSettled && !isApproved && shouldShowKeepButton && (
        <Button
          text={translate('violations.keepThisOne')}
          success
          style={styles.p4}
          onPress={navigateToReviewFields}
        />
      )}
    </PressableWithoutFeedback>
  );
}

TransactionPreviewContentUI.displayName = 'TransactionPreviewContentUI';

export default TransactionPreviewContentUI;
