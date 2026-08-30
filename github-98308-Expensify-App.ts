// Assuming the relevant file is something like ReportScreen.tsx or ReportDetailsScreen.tsx
// This is a synthesized implementation based on typical React Native patterns in the Expensify codebase

import React, { useEffect, useMemo } from 'react';
import { View, FlatList } from 'react-native';
import _ from 'underscore';
import type { Report, ReportAction, Expense } from '@src/types/onyx';
import { useOnyx } from 'react-native-onyx';
import * as ReportActionsUtils from '@src/libs/ReportActionsUtils';
import ReportActionItem from '@src/components/Report/ReportActionItem';
import CONST from '@src/CONST';

type ReportScreenProps = {
  route: {
    params: {
      reportID: string;
    };
  };
};

function ReportScreen({ route }: ReportScreenProps) {
  const { reportID } = route.params;
  
  const [report, reportLoading] = useOnyx(`report_${reportID}`, {
    initialValue: null,
  });
  
  const [reportActions, reportActionsLoading] = useOnyx(`reportActions_${reportID}`, {
    initialValue: null,
  });

  // Extract expenses from report actions
  const expenses = useMemo(() => {
    if (!reportActions) return [];
    
    return _.chain(reportActions)
      .filter((action) => ReportActionsUtils.isExpenseAction(action))
      .map((action) => action?.data?.expense)
      .compact()
      .value() as Expense[];
  }, [reportActions]);

  // Highlight existing expenses when report loads
  useEffect(() => {
    if (!reportActions || !expenses.length) return;

    // Logic to highlight expenses: mark them as "highlighted" in Onyx or local state
    // In the real app, this might involve updating a temporary session or local state
    // For this fix, we assume there's a mechanism to highlight expenses by their reportActionID
    const expenseReportActionIDs = expenses.map((expense) => expense?.reportActionID).filter(Boolean) as string[];
    
    // This would typically trigger highlighting via a global state or local effect
    // Example: call a function to highlight these expenses
    // highlightExpenses(expenseReportActionIDs);
    
    // In the actual Expensify codebase, this might involve setting a temporary session variable
    // or using a local state to track highlighted expenses
    // For demonstration, we'll assume there's a hook or function to handle this
  }, [reportActions, expenses]);

  // Render report actions
  const renderReportAction = ({ item }: { item: ReportAction }) => {
    const isHighlighted = useMemo(() => {
      // Check if this action corresponds to an existing expense
      const expense = expenses.find((e) => e?.reportActionID === item?.reportActionID);
      return !!expense;
    }, [expenses, item?.reportActionID]);

    return (
      <ReportActionItem
        reportAction={item}
        isHighlighted={isHighlighted}
      />
    );
  };

  if (reportLoading || reportActionsLoading) {
    return <View />;
  }

  return (
    <FlatList
      data={reportActions || []}
      renderItem={renderReportAction}
      keyExtractor={(item) => item?.reportActionID || ''}
      inverted={false}
    />
  );
}

export default ReportScreen;