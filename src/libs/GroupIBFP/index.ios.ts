import { Capability, FP, FPAttributeFormat } from 'group-ib-fp';
import Log from '@libs/Log';
import CONFIG from '@src/CONFIG';
import type { UserMetadata } from '@src/types/onyx';

const fp = FP.getInstance();

const enableCapability = (capability: Capability) => {
    fp.enableCapability(capability, (error: any, isRun: boolean) => {
        if (error) {
            Log.warn(`[GroupIB FP] Failed to enable ${capability}: ${error}`);
        } else {
            Log.info(`[GroupIB FP] ${capability} capability enabled: ${isRun}`);
        }
    });
};

const GroupIBFP = {
    initialize: () => {
        try {
            // Set customer ID
            fp.setCustomerId(CONFIG.GROUP_IB_FP.CID.ios, CONFIG.GROUP_IB_FP.CID.android, (error: string) => {
                if (error) {
                    Log.warn(`[GroupIB FP] Failed to set customer ID: ${error}`);
                }
            });

            // Set target URL
            fp.setTargetURL(CONFIG.GROUP_IB_FP.BACK_URL, (error: string) => {
                if (error) {
                    Log.warn(`[GroupIB FP] Failed to set target URL: ${error}`);
                }
            });

            const safeCapabilities = [
                Capability.Swizzle, // Must come first.
                Capability.Call,
                Capability.DeviceStatus,
                Capability.Capture,
                Capability.Audio,
                Capability.Proxy,
                Capability.Apps,
                Capability.Keyboard,
                Capability.WebView,
                Capability.Security,
                Capability.PortScan,
                Capability.Cellular,
                Capability.Location,
                Capability.Network,
                Capability.CloudIdentifier,
                Capability.Behavior,
                Capability.Motion, // Must come after Behavior
            ];

            safeCapabilities.forEach(capability => enableCapability(capability));

            Log.info('[GroupIB FP] iOS initialization completed successfully');

            fp.run((error: string) => {
                if (error) {
                    Log.alert(`[GroupIB FP] iOS run error: ${error}`);
                } else {
                    Log.info('[GroupIB FP] iOS SDK running successfully');
                }
            });
        } catch (error) {
            Log.alert(`[GroupIB FP] iOS initialization failed: ${error}`);
        }
    },

    setSessionId: (sessionId: string) => {
        fp.setSessionId(sessionId, (error: string) => {
            if (error) {
                Log.alert(`[GroupIB FP] iOS setSessionId error: ${error}`);
            } else {
                Log.info('[GroupIB FP] iOS setSessionId completed successfully');
            }
        });
    },

    setLogin: (userMetadata: UserMetadata) => {
        if (!userMetadata.email) {
            Log.hmmm('Missing email in GroupIBFP.setLogin');
        }

        fp.setLogin(userMetadata.email ?? '', (error: string) => {
            if (error) {
                Log.alert(`[GroupIB FP] iOS setLogin error: ${error}`);
            } else {
                Log.info('[GroupIB FP] iOS setLogin completed successfully');
            }
        });
    },

    setAttribute: (attributeTitle: string, attributeValue: string, format: FPAttributeFormat = FPAttributeFormat.ClearText) => {
        fp.setAttributeTitle(attributeTitle, attributeValue, format, (error: string) => {
            if (error) {
                Log.alert(`[GroupIB FP] iOS setAttribute error: ${error}`);
            } else {
                Log.info('[GroupIB FP] iOS setAttribute completed successfully');
            }
        });
    },

    sendEvent: (eventName: string) => {
        GroupIBFP.setAttribute('event_type', eventName);
    },
};

export default GroupIBFP;