// In src/components/Policy/PolicyCardsPage.tsx or similar
// The issue is likely in the navigation logic when enabling card approvals

// Find the card enablement handler and ensure proper navigation
const handleEnableCardApprovals = useCallback(() => {
  // Instead of navigating to "Not here" page, navigate to the correct card settings
  if (policy?.type === 'corporate') {
    Navigation.navigate(ROUTES.POLICY_CARDS_CARD_DETAILS.getRoute({
      policyID: policy.id,
      cardID: cardID,
    }));
  } else {
    // For non-corporate policies, show appropriate message or navigate differently
    Navigation.navigate(ROUTES.POLICY_CARDS);
  }
}, [policy, cardID]);

// In the component render, ensure the button only appears for valid cases
const renderEnableApprovalsButton = () => {
  if (!canAdminEnableCard || !card) {
    return null;
  }
  
  return (
    <Button
      text={translate('workspace.card.enableApprovals')}
      onPress={handleEnableCardApprovals}
      style={styles.mt3}
    />
  );
};