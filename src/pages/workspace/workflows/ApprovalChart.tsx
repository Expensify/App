import mermaid from 'mermaid';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Platform, View} from 'react-native';
import WebView from 'react-native-webview';
import {ReactZoomPanPinchContentRef, TransformComponent, TransformWrapper} from 'react-zoom-pan-pinch';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {F1Car, Minus, Plus} from '@components/Icon/Expensicons';
import colors from '@styles/theme/colors';

interface ApprovalChartProps {
    goBack: () => void;
}

export default function ApprovalChart({goBack}: ApprovalChartProps) {
    const [loading, setLoading] = useState(false);

    const chart = `
    graph TD

%% Level 1: submitsTo only
AmeliaAveo["Amelia Aveo"]:::rounded -->|"submits to"| CarolConvertible_L2["Carol Convertible"]:::rounded
CarolConvertible_L1["Carol Convertible"]:::rounded -->|"submits to"| ChrisCavalier_L2a["Chris Cavalier"]:::rounded
ChrisCavalier_L1["Chris Cavalier"]:::rounded -->|"submits to"| LoganDacia_L2a["Logan Dacia"]:::rounded
ConradCobalt_L1["Conrad Cobalt"]:::rounded -->|"submits to"| DorianDelorean_L2a["Dorian Delorean"]:::rounded
DorianDelorean_L1["Dorian Delorean"]:::rounded -->|"submits to"| ChrisCavalier_L2b["Chris Cavalier"]:::rounded
EloiseElantra["Eloise Elantra"]:::rounded -->|"submits to"| ChrisCavalier_L2c["Chris Cavalier"]:::rounded
JudyJetta["Judy Jetta"]:::rounded -->|"submits to"| RichardReliant_L2a["Richard Reliant"]:::rounded
LebronJames_L1["Lebron James"]:::rounded -->|"submits to"| RichardReliant_L2b["Richard Reliant"]:::rounded
LoganDacia_L1["Logan Dacia"]:::rounded -->|"submits to"| RichardReliant_L2c["Richard Reliant"]:::rounded
MarkMalibu["Mark Malibu"]:::rounded -->|"submits to"| LebronJames_L2a["Lebron James"]:::rounded
NormanNeon["Norman Neon"]:::rounded -->|"submits to"| LebronJames_L2b["Lebron James"]:::rounded
PeterPinto["Peter Pinto"]:::rounded -->|"submits to"| VictorVersa_L2["Victor Versa"]:::rounded
RichardReliant_L1["Richard Reliant"]:::rounded -->|"submits to"| LoganDacia_L2d["Logan Dacia"]:::rounded
VictorVersa_L1["Victor Versa"]:::rounded -->|"submits to"| LebronJames_L2c["Lebron James"]:::rounded

%% Level 2+: forwardsTo only
CarolConvertible_L2 -.->|"forwards to"| ConradCobalt_L3["Conrad Cobalt"]:::rounded
ConradCobalt_L3 -.->|"forwards to"| DorianDelorean_L4["Dorian Delorean"]:::rounded
DorianDelorean_L4 -.->|"forwards to"| ChrisCavalier_L5["Chris Cavalier"]:::rounded

LebronJames_L2a -.->|"forwards to"| VictorVersa_L3a["Victor Versa"]:::rounded
VictorVersa_L3a -.->|"forwards to"| AshtonAztek_L4["Ashton Aztek"]:::rounded
AshtonAztek_L4 -.->|"forwards to"| ChrisCavalier_L5b["Chris Cavalier"]:::rounded

RichardReliant_L2b -.->|"forwards to"| LebronJames_L3["Lebron James"]:::rounded
LoganDacia_L2a -.->|"forwards to"| DorianDelorean_L3a["Dorian Delorean"]:::rounded
    classDef rounded rx:27,stroke:transparent;
    `;

    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
            <HeaderWithBackButton
                title="Workflows"
                onBackButtonPress={goBack}
                style={{zIndex: 50}}
            />

            {loading && <LoadingState />}
            {!loading && Platform.OS === 'web' && <ApprovalChartWeb chart={chart} />}
            {!loading && Platform.OS !== 'web' && <ApprovalChartMobile chart={chart} />}
        </View>
    );
}

interface ChartViewProps {
    chart: string;
}

function ApprovalChartWeb({chart}: ChartViewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const workflowRef = useRef<ReactZoomPanPinchContentRef>(null);

    useEffect(() => {
        if (containerRef.current) {
            mermaid.initialize({
                themeVariables: {
                    mainBkg: colors.green,
                    textColor: colors.white,
                    edgeLabelBackground: colors.green700,
                    lineColor: colors.green700,
                },
            });
            containerRef.current.innerHTML = chart;
            mermaid.run({nodes: [containerRef.current]});
        }
    }, [chart]);

    const onZoom = () => {
        if (workflowRef.current) {
            workflowRef.current.zoomIn(0.5);
        }
    };

    const onUnZoom = () => {
        if (workflowRef.current) {
            workflowRef.current.zoomOut(0.5);
        }
    };

    return (
        <div style={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 0, position: 'relative'}}>
            <TransformWrapper
                ref={workflowRef}
                minScale={0.1}
                maxScale={5}
                centerOnInit
            >
                <TransformComponent>
                    <div
                        style={{
                            width: 20000,
                            height: 20000,
                            backgroundImage: 'radial-gradient(#ccc 1px, transparent 1px)',
                            backgroundSize: '20px 20px',
                        }}
                    >
                        <div
                            ref={containerRef}
                            className="mermaid"
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '100%',
                                height: '100%',
                            }}
                        />
                    </div>
                </TransformComponent>
            </TransformWrapper>

            <View style={{position: 'absolute', bottom: 20, right: 20, display: 'flex', gap: 4}}>
                <Button
                    success
                    icon={Plus}
                    onPress={onZoom}
                />
                <Button
                    success
                    icon={Minus}
                    onPress={onUnZoom}
                />
            </View>
        </div>
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

function LoadingState() {
    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <F1Car />
        </View>
    );
}
