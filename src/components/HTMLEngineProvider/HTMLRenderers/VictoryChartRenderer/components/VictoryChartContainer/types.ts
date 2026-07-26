import type {ViewStyle} from 'react-native';

type VictoryChartContainerLayout =
    | {
          kind: 'fixed';
          width: number;
          height: number;
      }
    | {
          kind: 'scaled';
          designHeight: number;
          scale: number;
      }
    | {
          kind: 'fluid';
      };

type VictoryChartContainerThemeStyles = {
    container: ViewStyle;
    content: ViewStyle;
    mw100: ViewStyle;
};

export type {VictoryChartContainerLayout, VictoryChartContainerThemeStyles};
