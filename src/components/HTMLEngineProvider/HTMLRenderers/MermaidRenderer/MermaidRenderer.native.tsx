import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import WebView from 'react-native-webview';
import type {CustomRendererProps, TBlock} from 'react-native-render-html';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type MermaidRendererProps = CustomRendererProps<TBlock> & {
    /** Key of the element */
    key?: string;
};

/**
 * Native-specific Mermaid chart renderer component (for iOS/Android)
 */
function MermaidRenderer({tnode, key}: MermaidRendererProps) {
    const styles = useThemeStyles();
    const [preferredSkinTone] = useOnyx(ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE, {initialValue: CONST.EMOJI_DEFAULT_SKIN_TONE});

    // Extract chart definition from the data attribute
    const chartData = tnode.attributes[CONST.MERMAID_CHART_ATTRIBUTE] as string;

    // Decode newline placeholders back to actual newlines
    const decodedChartData = chartData ? chartData.replace(/__MERMAID_NEWLINE__/g, '\n') : chartData;

    // Generate HTML content for WebView with Mermaid chart
    const mermaidHTML = useMemo(() => {
        if (!decodedChartData) {
            return '<html><body><p>No chart data available</p></body></html>';
        }

        const theme = preferredSkinTone === CONST.EMOJI_DEFAULT_SKIN_TONE ? 'default' : 'dark';
        
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=yes">
    <script src="https://cdn.jsdelivr.net/npm/mermaid@11.7.0/dist/mermaid.min.js"></script>
    <style>
        body {
            margin: 0;
            padding: 16px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: transparent;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .mermaid {
            max-width: 100%;
            height: auto;
        }
        .error {
            color: #ff0000;
            text-align: center;
            padding: 20px;
        }
    </style>
</head>
<body>
    <div class="mermaid" id="mermaid-chart">
        ${decodedChartData}
    </div>
    <script>
        try {
            mermaid.initialize({
                startOnLoad: true,
                theme: '${theme}',
                securityLevel: 'strict',
                htmlLabels: true,
                suppressErrorRendering: false
            });
            
            mermaid.run();
        } catch (error) {
            console.error('Mermaid rendering error:', error);
            document.body.innerHTML = '<div class="error">Failed to render chart: ' + error.message + '</div>';
        }
    </script>
</body>
</html>`;
    }, [decodedChartData, preferredSkinTone]);

    if (!decodedChartData) {
        return (
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentCenter, styles.p4]}>
                <Text style={styles.textSupporting}>Unable to display chart</Text>
            </View>
        );
    }

    // For mobile platforms, use WebView with pinch-to-zoom support
    return (
        <View style={[styles.alignItemsCenter, styles.p2]}>
            <WebView
                source={{html: mermaidHTML}}
                style={[styles.w100, {height: 400, backgroundColor: colors.white}]}
                originWhitelist={['*']}
                javaScriptEnabled
                domStorageEnabled
                startInLoadingState
                scalesPageToFit
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                // Enable pinch-to-zoom on mobile
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}
            />
        </View>
    );
}

MermaidRenderer.displayName = 'MermaidRenderer';

export default MermaidRenderer; 