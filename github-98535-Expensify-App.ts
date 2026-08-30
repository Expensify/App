// Assuming this is in a React Native component file like ThreadHeader.tsx
// The issue is likely in how commuter exclusion distance is calculated/displayed

import React from 'react';
import { View, Text } from 'react-native';
import { useCommuterExclusion } from '@hooks/exclusions'; // hypothetical hook

interface ThreadHeaderProps {
  isSelfDM: boolean;
  distance?: number;
  // other props...
}

const ThreadHeader: React.FC<ThreadHeaderProps> = ({ isSelfDM, distance }) => {
  const { hasExclusion, exclusionDistance } = useCommuterExclusion();
  
  // Only show commuter exclusion when:
  // 1. User has an actual exclusion
  // 2. This is NOT a self DM (self DMs shouldn't show commuter distance)
  const shouldShowCommuterExclusion = hasExclusion && !isSelfDM;
  
  return (
    <View style={styles.container}>
      {/* Other header content */}
      
      {shouldShowCommuterExclusion && (
        <View style={styles.exclusionContainer}>
          <Text style={styles.exclusionText}>
            Commuter exclusion: {exclusionDistance} miles
          </Text>
        </View>
      )}
      
      {/* Distance display for non-self DMs without exclusion */}
      {!isSelfDM && !shouldShowCommuterExclusion && distance !== undefined && (
        <Text style={styles.distanceText}>
          Distance: {distance} miles
        </Text>
      )}
    </View>
  );
};

export default ThreadHeader;