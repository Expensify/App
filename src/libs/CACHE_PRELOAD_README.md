# 🚀 Aggressive Cache Preloading System

## ⚠️ **CRITICAL WARNING**

This system loads **ALL** database data into memory on startup. This can consume **500MB-2GB+** of memory depending on the user's data size. Use with extreme caution!

## 🎯 What This Does

- Preloads all major Onyx collections at startup
- Monitors memory usage during preload
- Provides comprehensive debugging utilities
- Only runs in development mode by default

## 📊 Memory Impact Analysis

### Expected Memory Usage:
- **Small user**: 50-200MB
- **Medium user**: 200-500MB  
- **Large user**: 500MB-1GB
- **Enterprise user**: 1GB-2GB+

### Collections Loaded:
- `COLLECTION.REPORT` (Usually largest)
- `COLLECTION.REPORT_ACTIONS` (Can be massive)
- `COLLECTION.TRANSACTION` 
- `COLLECTION.POLICY`
- `COLLECTION.WORKSPACE_CARDS_LIST`
- `PERSONAL_DETAILS_LIST`
- All other major collections

## 🛠️ How to Use

### Automatic Startup (Development Only)
The system automatically runs in development mode. Check console for:
```
🚀 Starting aggressive cache preloading...
⚠️  WARNING: This will consume significant memory!
📊 Cache Preload Progress: 15/45 completed
✅ Cache preloading completed! { totalSizeMB: 234, successRate: 96% }
```

### Manual Control

#### Enable in Production:
```bash
export ENABLE_CACHE_PRELOAD=true
```

#### Browser Console Commands:
```javascript
// Start manual preload
window.preloadAll()

// Generate memory report
window.memoryReport()

// Run stress test
window.stressTest(60000) // 60 seconds

// Start memory monitoring
window.cacheDebug.startMemoryTracking()

// Get current memory stats
window.cacheDebug.getCurrentMemoryStats()

// Run comprehensive test
window.cacheDebug.runPreloadTest()
```

## 📈 Monitoring & Debugging

### Real-Time Memory Monitoring:
```javascript
// Start monitoring (updates every 5 seconds)
window.cacheDebug.startMemoryTracking()

// Stop and get analysis
const results = window.cacheDebug.stopMemoryTracking()
```

### Performance Testing:
```javascript
// Run comprehensive preload test
const testResults = await window.cacheDebug.runPreloadTest({
    logProgress: true,
    maxConcurrency: 3,
    testCollections: true,
    testSingleKeys: true
})

// Run stress test
const stressResults = await window.cacheDebug.performanceStressTest(
    60000, // duration in ms
    10     // operations per second
)
```

### Memory Analysis:
```javascript
// Current memory usage
const memory = window.cacheDebug.getCurrentMemoryStats()
console.log(`Using ${memory.used}MB / ${memory.limit}MB (${(memory.used/memory.limit*100).toFixed(1)}%)`)

// Analyze cache contents
const analysis = await window.cacheDebug.analyzeCacheContents()
```

## ⚡ Configuration Options

### Preload Settings:
```javascript
cachePreloader.preloadAllData({
    maxConcurrency: 3,        // Max parallel requests
    collections: true,        // Load collections
    singleKeys: true,         // Load single keys
    onProgress: (progress) => console.log(progress)
})
```

### Collections Loaded:
- ✅ `REPORT` collections
- ✅ `TRANSACTION` collections  
- ✅ `POLICY` collections
- ✅ `WORKSPACE_CARDS` collections
- ✅ Personal details
- ✅ Account information
- ✅ All financial data

## 🚨 Production Considerations

### Memory Pressure
- Monitor device memory limits
- Implement aggressive eviction under pressure
- Consider reducing `maxCachedKeysCount` from 50,000

### Performance Impact
- **Startup time**: +2-10 seconds
- **Memory usage**: +500MB-2GB  
- **Network usage**: High initial load
- **Battery impact**: Significant during preload

### Recommendations
1. **Mobile devices**: Disable or use selective preloading
2. **Desktop/Web**: Can handle full preload
3. **Enterprise**: May need custom limits
4. **Monitoring**: Always monitor memory usage

## 🔧 Customization

### Selective Preloading:
```javascript
// Only load specific collections
const results = await cachePreloader.preloadAllData({
    collections: false,  // Skip collections
    singleKeys: true,    // Only single keys
})
```

### Custom Collections:
Edit `COLLECTIONS_TO_PRELOAD` in `PreloadCache.ts`:
```typescript
private readonly COLLECTIONS_TO_PRELOAD = [
    {key: 'COLLECTION.REPORT', command: 'ReadAllReports'},
    // Add/remove collections as needed
];
```

## 📊 Expected Results

### Performance Gains:
- **Cache hit rate**: 95%+ for preloaded data
- **Load times**: Near-instant for cached data
- **User experience**: Smoother navigation

### Memory Usage Examples:
```
Small user (< 100 reports):     ~50MB
Medium user (100-1000 reports): ~200MB  
Large user (1000+ reports):     ~500MB
Enterprise user:                ~1GB+
```

## 🚦 Safety Features

### Built-in Protections:
- ✅ Development-only by default
- ✅ Memory usage monitoring
- ✅ Error handling and recovery
- ✅ Progress tracking
- ✅ Configurable limits

### Warning System:
- Warns if memory usage > 100MB
- Logs all preload activities
- Provides detailed error reporting
- Monitors memory pressure

## 🎯 Use Cases

### Best For:
- Desktop applications
- Development/testing
- High-memory devices
- Power users with fast connections

### Avoid For:
- Mobile devices with <4GB RAM
- Slow network connections
- Memory-constrained environments
- Users with massive datasets (>10GB)

## 🔍 Troubleshooting

### High Memory Usage:
```javascript
// Check what's using memory
window.memoryReport()

// Reduce preload scope
cachePreloader.preloadAllData({ 
    collections: false,  // Skip heavy collections
    maxConcurrency: 1    // Reduce concurrency
})
```

### Performance Issues:
```javascript
// Run diagnostic test
window.cacheDebug.runPreloadTest()

// Check for memory leaks
window.cacheDebug.startMemoryTracking()
// ... wait 5 minutes ...
window.cacheDebug.stopMemoryTracking()
```

---

**Remember**: This is an aggressive caching strategy that prioritizes performance over memory efficiency. Monitor carefully and adjust based on your users' device capabilities!
