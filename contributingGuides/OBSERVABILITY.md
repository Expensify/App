# Observability

## Philosophy

### Why Observability Matters

When users encounter issues in live sessions that we can't reproduce locally, bugs don't get fixed. This leads to churn and decreased customer lifetime value. Observability shifts us from reactive to proactive monitoring by automatically collecting traces and logs during user sessions, enabling us to diagnose issues without manual reproduction.

### Terminology

- [**Telemetry**](https://opentelemetry.io/docs/concepts/observability-primer/#reliability-and-metrics): How a system collects data (metrics, logs, traces)
- [**Observability**](https://opentelemetry.io/docs/concepts/observability-primer/#what-is-observability): Using telemetry to understand what's happening inside the system
- [**Span**](https://docs.sentry.io/concepts/key-terms/tracing/#whats-a-span): Basic unit representing a specific operation (navigation, API call, render) with duration and metadata
- [**Trace**](https://docs.sentry.io/concepts/key-terms/tracing/#whats-a-trace): Collection of spans showing end-to-end flow through the system
- [**Tags**](https://docs.sentry.io/platforms/react-native/enriching-events/tags/): Contextual attributes (locale, app version, policy ID) for filtering and pattern detection
- **P90**: 90th percentile—90% of data falls below this value 

## Tools & implementation

We use **Sentry** for observability across all platforms (Web, iOS, Android) and environments (production, staging, development). Sentry collects traces, spans, and contextual data from user sessions to identify and diagnose issues. For a better understanding of Sentry visit [Sentry docs](https://docs.sentry.io/). 
For testing Sentry locally remember to set env variable `ENABLE_SENTRY_ON_DEV=true` in your local .env file. 

### Working with Spans

#### Creating a Span

```typescript
startSpan(spanId, {
    name: CONST.TELEMETRY.SPAN_OPEN_REPORT,
    op: CONST.TELEMETRY.SPAN_OPEN_REPORT,
});
```

Minimum set of parameters required to create a span:

**Span ID**: [Covered in Metrics section]

**Span configuration**: Set of parameters passed to `Sentry.startInteractiveSpan`. See the [Sentry docs](https://docs.sentry.io/platforms/react-native/tracing/instrumentation/custom-instrumentation/#starting-inactive-spans-startinactivespan) for more details.

Additional parameters can be added as a config object (third parameter):

**Minimum Duration**: what's the minimum duration of a span. Spans shorter than this duration are discarded.

```typescript
startSpan(CONST.TELEMETRY.SPAN_SKELETON, {
    name: CONST.TELEMETRY.SPAN_SKELETON,
    op: CONST.TELEMETRY.SPAN_SKELETON,
}, {minDuration: CONST.TELEMETRY.CONFIG.SKELETON_MIN_DURATION});
```

#### Finishing a Span

There are two ways to finish a span:

```typescript
endSpan(spanId); // Operation completed successfully
```

```typescript
cancelSpan(spanId); // Operation abandoned (e.g., user navigated away, component unmounted)
```

The difference is that the latter adds a `canceled` attribute to the span indicating that it was canceled.

### Constants

Defined in `src/CONST/index.ts` under `CONST.TELEMETRY`:
- Span names: `SPAN_OPEN_REPORT`, `SPAN_SEND_MESSAGE`
- Tag names: `TAG_ACTIVE_POLICY`, `TAG_AUTHENTICATION_ERROR_TYPE`
- Attribute names: `ATTRIBUTE_REPORT_ID`, `ATTRIBUTE_MESSAGE_LENGTH`
- Configuration: `CONFIG.SKELETON_MIN_DURATION`

#### Naming Conventions

**Span names** describe **what's measured**, not **where**. Use `OpenReport` instead of `ReportPage`. Child span's should match parent span names (e.g., parent: `OpenReport`, child: `OpenReportFetchData`).

#### Tags vs. Attributes

- **Tags**: For filtering and grouping in dashboards (indexed, searchable)
- **Attributes**: For additional context without filtering (not indexed)

### Middleware

Process events before sending to Sentry:
- **minDurationFilter** - Discards spans shorter than a specified duration
- **scopeTagsEnricher** - Adds cohort and policy tags
- **emailDomainFilter** - Removes accounts we don't want to send telemetry for

Middleware runs automatically. Add new middleware only for global filtering or enrichment (e.g., new PII protection).

## Metrics

We track three categories:

### Performance Metrics

User-facing latency with thresholds (P90):

- **App start time**: 3s
- **OD → ND transition**: 3s
- **Open report**: 1s
- **Navigate to Reports tab**: 400ms
- **Navigate to Inbox tab**: 400ms
- **Open search modal**: 400ms
- **Open Create Expense**: 400ms
- **Send message**: 300ms

### Failure Rates

Error conditions tracked for trend analysis:

- **ANRs**: number of "Application Not Responding" errors
- **404 pages**: number of user actions other than deep links that result in 404
- **Infinite skeletons**: Skeleton visible 10+ seconds
- **Authentication failures**: number of authentication errors other than wrong credentials 

### Feature Health

End-to-end flows for critical features. There is only one feature currently tracked:

- **Create expense**: Create spans and dashboard that will provide information about feature health of creating expense for each type: Manual entry, scan, distance.

More features will be handled in the future.

### Adding New Metrics

It’s recommended to first verify whether the intended observability outcome can be achieved using existing, built-in metrics. Sentry’s default implementation provides a wide range of useful spans and traces that can often be leveraged for this purpose. If you’ve confirmed that none of the available metrics meet your needs, follow the steps below. 

#### 1. Define Span ID

Span ID identifies an operation instance:

```typescript
// Multiple instances: Add unique identifier
const spanId = `${CONST.TELEMETRY.SPAN_OPEN_REPORT}-${reportID}`;

// Single instance: Use constant directly
const spanId = CONST.TELEMETRY.SPAN_APP_STARTUP;
```

#### 2. Add Constants

Add span name, tags, and attributes to `src/CONST/index.ts`:

```typescript
TELEMETRY: {
    SPAN_YOUR_OPERATION: 'ManualYourOperation',
    TAG_YOUR_TAG: 'your_tag',
    ATTRIBUTE_YOUR_ATTR: 'your_attr'
}
```

#### 3. Start Span

```typescript
startSpan(spanId, {
    name: CONST.TELEMETRY.SPAN_YOUR_OPERATION,
    op: CONST.TELEMETRY.SPAN_YOUR_OPERATION,
});
```

#### 4. Add Context

```typescript
const span = getSpan(spanId);
span?.setAttribute(CONST.TELEMETRY.ATTRIBUTE_YOUR_ATTR, value);
span?.setTag(CONST.TELEMETRY.TAG_YOUR_TAG, value);
```

#### 5. Finish Span

```typescript
endSpan(spanId); // or cancelSpan(spanId)
```

#### When to Add Metrics

Add metrics when:
- Operation impacts user experience
- Performance regressions need monitoring
- Debugging requires operation visibility

Don't add metrics for:
- Internal operations invisible to users
- Operations already covered by parent spans
- Operations too granular to be actionable