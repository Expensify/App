import React, { useMemo } from 'react';
import { View } from 'react-native';
import { CONST } from '../CONST';

const ReportActionContextMenu = ({
  report,
  reportAction,
  isConciergeChatReport,
}) => {
  const isForwardedAction = reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.FORWARDED;

  const menuItems = useMemo(() => {
    const items = [];

    if (isForwardedAction && isConciergeChatReport) {
      items.push({
        icon: 'Concierge',
        text: 'Routed Concierge Action',
        onPress: () => {
          // Handle the press event
        },
      });
    }

    // ... (other menu items)

    return items;
  }, [isForwardedAction, isConciergeChatReport]);

  return (
    <View>
      {/* Render the menu items */}
      {menuItems.map((item, index) => (
        <View key={index}>
          {/* Render the menu item */}
          <View>
            {/* Icon */}
            {/* Text */}
          </View>
        </View>
      ))}
    </View>
  );
};

export default ReportActionContextMenu;