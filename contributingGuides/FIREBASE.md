# Firebase Integration

This project uses Firebase for gathering information about performance and crashes.

## Performance Metrics

The following table shows the metrics that are being tracked.

| Metric name | Description | Start time | End time |
|----------|----------|----------|----------|
| `_app_start`   | **[ANDROID ONLY]** The time between when the user opens the app and when the app is responsive.     | Starts when the app's `FirebasePerfProvider` `ContentProvider` completes its `onCreate` method.     | Stops when the first activity's `onResume()` method is called.     |
| `_app_in_foreground`    | The time when the app is running in the foreground and available to the user.     | Starts when the first activity to reach the foreground has its `onResume()` method called.     | Stops when the last activity to leave the foreground has its `onStop()` method called.     |
| `_app_in_background`    | Time when the app is running in the background.     | Starts when the last activity to leave the foreground has its `onStop()` method called. | Stops when the first activity to reach the foreground has its `onResume()` method called.     |
| `homepage_initial_render`   | Data     | Data     | Data     |
| `calc_most_recent_last_modified_action`    | Data     | Data     | Data     |
| `chat_render`    | Data     | Data     | Data     |
| `load_search_options`    | Data     | Data     | Data     |
| `js_loaded`    | Data     | Data     | Data     |
| `search_filter_options`    | Data     | Data     | Data     |
| `open_report_thread`   | Data     | Data     | Data     |
| `open_report_from_preview`   | Data     | Data     | Data     |
| `switch_report_from_preview`   | Data     | Data     | Data     |
| `switch_report`    | Data     | Data     | Data     |
| `search_render`   | Data     | Data     | Data     |
| `trie_initialization`   | Data     | Data     | Data     |



