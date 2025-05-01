/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/naming-convention */
import type {ReactNode} from 'react';
import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import type {ThemeStyles} from '@styles/index';

type ContentComponent = (props: {styles: ThemeStyles}) => ReactNode;

type HelpContent = {
    /** The content to display for this route */
    content: ContentComponent;

    /** Any children routes that this route has */
    children?: Record<string, HelpContent>;

    /** Whether this route is an exact match or displays parent content */
    isExact?: boolean;
};

const helpContentMap: HelpContent = {
  children: {
    settings: {
      children: {
        workspaces: {
          children: {
            ":policyId": {
              content: ({styles}: {styles: ThemeStyles}) => (
        <View>
        <View style={[styles.mb4]}>
          <Text style={[styles.textHeadlineH2]}>Introduction</Text>
        </View>
        <View style={[styles.mb4]}>
          <Text style={styles.textNormal}>Expensify Chat is a tool for real-time collaboration with a Slack-style experience.</Text>
        </View>
      </View>
),
            },
          },
          content: ({styles}: {styles: ThemeStyles}) => (
        <View>
        <View style={[styles.mb4]}>
          <Text style={[styles.textHeadlineH2]}>Introduction</Text>
        </View>
        <View style={[styles.mb4]}>
          <Text style={styles.textNormal}>Expensify Chat is a tool for real-time collaboration with a Slack-style experience.</Text>
        </View>
      </View>
),
        },
      },
      content: ({styles}: {styles: ThemeStyles}) => (
        <View>
        <View style={[styles.mb4]}>
          <Text style={[styles.textHeadlineH2]}>Introduction</Text>
        </View>
        <View style={[styles.mb4]}>
          <Text style={styles.textNormal}>Expensify Chat is a tool for real-time collaboration with a Slack-style experience.</Text>
        </View>
      </View>
),
    },
  },
  content: () => null,
}

export default helpContentMap;
export type {ContentComponent};
