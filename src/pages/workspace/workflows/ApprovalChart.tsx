import mermaid from 'mermaid';
import React, {useEffect, useRef} from 'react';
import {Platform, View} from 'react-native';
import WebView from 'react-native-webview';
import HeaderWithBackButton from '@components/HeaderWithBackButton';

interface ApprovalChartProps {
    goBack: () => void;
}

export default function ApprovalChart({goBack}: ApprovalChartProps) {
    const chart = `
    graph TD
        A[Start] --> B{Is it working?}
        B -- Yes --> C[Great!]
        B -- No --> D[Fix it]
        D --> B
    `;

    return (
        <View>
            <HeaderWithBackButton
                title="Workflows"
                onBackButtonPress={goBack}
            />

            {Platform.OS === 'web' ? <ApprovalChartWeb chart={chart} /> : <ApprovalChartMobile chart={chart} />}
        </View>
    );
}

interface ChartViewProps {
    chart: string;
}

function ApprovalChartWeb({chart}: ChartViewProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.innerHTML = chart;
            mermaid.run({nodes: [containerRef.current]});
        }
    }, [chart]);

    return (
        <div
            ref={containerRef}
            className="mermaid"
        />
    );
}

function ApprovalChartMobile({chart}: ChartViewProps) {
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
        <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
        <style>
            body { margin: 0; padding: 0; }
        </style>
        </head>
        <body>
        <div class="mermaid">${chart}</div>
        <script>
            mermaid.initialize({ startOnLoad: true });
        </script>
        </body>
        </html>
  `;

    return (
        <WebView
            originWhitelist={['*']}
            source={{html: htmlContent}}
            style={{flex: 1}}
        />
    );
}
