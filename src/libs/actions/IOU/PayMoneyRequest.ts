@@
-    } catch (error) {
-        // generic error handling
-        Onyx.merge(`reports/${reportID}`, staleSnapshot);
-        throw new Error('Unexpected error. Please try again later.');
-    }
+    } catch (error) {
+        // If the backend rejected the payment due to a stale amount, refresh the report and retry once.
+        if (!retry && (error?.response?.data?.error === 'amount_changed' || error?.message?.includes('amount changed'))) {
+            // Fetch the latest report data from the server
+            const freshReport = await ReportUtils.getReport(reportID);
+            if (freshReport) {
+                // Update Onyx with the fresh report data
+                Onyx.merge(`reports/${reportID}`, freshReport);
+                // Retry the payment with the updated total
+                return payMoneyRequest(reportID, freshReport.total, /* other params */, true);
+            }
+        }
+
+        // Fallback to the original error handling
+        Onyx.merge(`reports/${reportID}`, staleSnapshot);
+        throw new Error('Unexpected error. Please try again later.');
+    }
