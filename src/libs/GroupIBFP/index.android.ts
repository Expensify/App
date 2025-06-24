import { AndroidCapability, FP, FPAttributeFormat } from 'group-ib-fp';
import Log from '@libs/Log';
import CONFIG from '@src/CONFIG';
import type { UserMetadata } from '@src/types/onyx';

const fp = FP.getInstance();

const enableAndroidCapability = (capability: AndroidCapability): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
        fp.enableAndroidCapability(capability, (error: any, isRun: boolean) => {
            if (error) {
                Log.warn(`[GroupIB FP] Failed to enable ${capability}: ${error}`);
                resolve({ success: false, error: error.toString() });
            } else {
                Log.info(`[GroupIB FP] ${capability} Android capability enabled: ${isRun}`);
                resolve({ success: true });
            }
        });
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

            // Set the global customer ID
            fp.setGlobalIdURL(CONFIG.GROUP_IB_FP.GID_URL, (error: string) => {
                if (error) {
                    Log.warn(`[GroupIB FP] Failed to set global ID URL: ${error}`);
                }
            });

            enableAndroidCapability(AndroidCapability.ActivityCollection);
            enableAndroidCapability(AndroidCapability.MotionCollection);
            enableAndroidCapability(AndroidCapability.AccessPointsCollection);
            enableAndroidCapability(AndroidCapability.CellsCollection);
            enableAndroidCapability(AndroidCapability.Location);
            enableAndroidCapability(AndroidCapability.GlobalIdentification);

            Log.info('[GroupIB FP] Android initialization completed successfully');

            fp.run((error: string) => {
                if (error) {
                    Log.alert(`[GroupIB FP] Android run error: ${error}`);
                } else {
                    Log.info('[GroupIB FP] Android SDK running successfully');
                }
            });
        } catch (error) {
            Log.alert(`[GroupIB FP] Android initialization failed: ${error}`);
        }
    },

    setSessionId: (sessionId: string) => {
            fp.setSessionId(sessionId, (error: string) => {
                if (error) {
                    Log.alert(`[GroupIB FP] Android setSessionId error: ${error}`);
                } else {
                    Log.info('[GroupIB FP] Android setSessionId completed successfully');
                }
            });
    },

    setLogin: (userMetadata: UserMetadata) => {
            if (!userMetadata.email) {
                Log.hmmm('Missing email in GroupIBFP.setLogin');
            }

            fp.setLogin(userMetadata.email ?? '', (error: string) => {
                if (error) {
                    Log.alert(`[GroupIB FP] Android setLogin error: ${error}`);
                } else {
                    Log.info('[GroupIB FP] Android setLogin completed successfully');
                }
            });
    },

    setAttribute: (attributeTitle: string, attributeValue: string, format: FPAttributeFormat = FPAttributeFormat.ClearText) => {
            fp.setAttributeTitle(attributeTitle, attributeValue, format, (error: string) => {
                if (error) {
                    Log.alert(`[GroupIB FP] Android setAttribute error: ${error}`);
                } else {
                    Log.info('[GroupIB FP] Android setAttribute completed successfully');
                }
            });
    },

    sendEvent: (eventName: string) => {
        GroupIBFP.setAttribute('event_type', eventName);
    },
};
export default GroupIBFP;