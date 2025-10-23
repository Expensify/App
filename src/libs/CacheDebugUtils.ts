import cachePreloader from './PreloadCache';
import type {MemoryStats, PreloadProgress} from './PreloadCache';

type CacheAnalysis = {
    onyxKeys: {key: string; sizeMB: number; type: 'collection' | 'single'}[];
    memoryStats: MemoryStats | null;
    totalCacheSizeMB: number;
    largestItems: {key: string; sizeMB: number}[];
    recommendations: string[];
};

/**
 * Debug utilities for analyzing cache performance and memory usage
 */
class CacheDebugUtils {
    private memoryTrackingInterval: NodeJS.Timeout | null = null;
    private memoryHistory: {timestamp: number; stats: MemoryStats}[] = [];

    /**
     * Analyze current Onyx cache contents and memory usage
     */
    public async analyzeCacheContents(): Promise<CacheAnalysis> {
        // This would need to be implemented to access Onyx internals
        // For now, return a mock analysis
        const analysis: CacheAnalysis = {
            onyxKeys: [],
            memoryStats: this.getCurrentMemoryStats(),
            totalCacheSizeMB: 0,
            largestItems: [],
            recommendations: [],
        };

        // Add some mock data for demonstration
        analysis.recommendations = [
            'Consider reducing maxCachedKeysCount from 50,000',
            'Add more collections to evictableKeys list',
            'Implement memory pressure detection',
            'Consider lazy loading for large collections',
        ];

        return analysis;
    }

    /**
     * Start memory tracking with periodic snapshots
     */
    public startMemoryTracking(intervalMs = 5000): void {
        if (this.memoryTrackingInterval) {
            this.stopMemoryTracking();
        }

        console.log('🧠 Starting memory tracking...');
        this.memoryHistory = [];

        this.memoryTrackingInterval = setInterval(() => {
            const stats = this.getCurrentMemoryStats();
            if (stats) {
                this.memoryHistory.push({
                    timestamp: Date.now(),
                    stats,
                });

                // Keep only last 100 entries
                if (this.memoryHistory.length > 100) {
                    this.memoryHistory.shift();
                }

                console.log(`🧠 Memory: ${stats.used}MB used / ${stats.total}MB total (${Math.round((stats.used / stats.limit) * 100)}% of limit)`);
            }
        }, intervalMs);
    }

    /**
     * Stop memory tracking
     */
    public stopMemoryTracking(): {summary: any; history: typeof this.memoryHistory} {
        if (this.memoryTrackingInterval) {
            clearInterval(this.memoryTrackingInterval);
            this.memoryTrackingInterval = null;
        }

        const summary = this.analyzeMemoryHistory();
        console.log('🧠 Memory tracking stopped', summary);

        return {
            summary,
            history: [...this.memoryHistory],
        };
    }

    /**
     * Get current memory statistics
     */
    public getCurrentMemoryStats(): MemoryStats | null {
        if (typeof performance !== 'undefined' && performance.memory) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024), // MB
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024), // MB
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024), // MB
            };
        }
        return null;
    }

    /**
     * Analyze memory usage history
     */
    private analyzeMemoryHistory() {
        if (this.memoryHistory.length === 0) {
            return null;
        }

        const first = this.memoryHistory[0];
        const last = this.memoryHistory[this.memoryHistory.length - 1];
        const peak = this.memoryHistory.reduce((max, entry) => (entry.stats.used > max.stats.used ? entry : max));

        const memoryIncrease = last.stats.used - first.stats.used;
        const peakUsage = peak.stats.used;
        const avgUsage = Math.round(this.memoryHistory.reduce((sum, entry) => sum + entry.stats.used, 0) / this.memoryHistory.length);

        return {
            durationMs: last.timestamp - first.timestamp,
            memoryIncreaseMB: memoryIncrease,
            peakUsageMB: peakUsage,
            avgUsageMB: avgUsage,
            finalUsageMB: last.stats.used,
            memoryPressure: last.stats.used / last.stats.limit,
            dataPoints: this.memoryHistory.length,
        };
    }

    /**
     * Run a comprehensive preload test with monitoring
     */
    public async runPreloadTest(
        options: {
            logProgress?: boolean;
            maxConcurrency?: number;
            testCollections?: boolean;
            testSingleKeys?: boolean;
        } = {},
    ): Promise<{
        results: PreloadProgress[];
        summary: any;
        memoryAnalysis: any;
    }> {
        const {logProgress = true, maxConcurrency = 3, testCollections = true, testSingleKeys = true} = options;

        console.log('🚀 Starting comprehensive cache preload test...');

        // Start memory tracking
        this.startMemoryTracking(1000); // Track every second during test

        const progressCallback = logProgress
            ? (progress: PreloadProgress[]) => {
                  const completed = progress.filter((p) => p.status === 'completed').length;
                  const failed = progress.filter((p) => p.status === 'failed').length;
                  const loading = progress.filter((p) => p.status === 'loading').length;

                  console.log(`📊 Progress: ${completed} completed, ${failed} failed, ${loading} loading (${progress.length} total)`);
              }
            : undefined;

        // Run the preload test
        const results = await cachePreloader.preloadAllData({
            onProgress: progressCallback,
            maxConcurrency,
            collections: testCollections,
            singleKeys: testSingleKeys,
        });

        // Stop memory tracking and get analysis
        const memoryAnalysis = this.stopMemoryTracking();
        const summary = cachePreloader.getPreloadSummary();

        console.log('✅ Preload test completed!', {
            summary,
            memoryIncrease: memoryAnalysis.summary?.memoryIncreaseMB,
            peakMemory: memoryAnalysis.summary?.peakUsageMB,
        });

        return {
            results,
            summary,
            memoryAnalysis: memoryAnalysis.summary,
        };
    }

    /**
     * Monitor cache performance over time
     */
    public async performanceStressTest(
        duration = 60000, // 1 minute
        operationsPerSecond = 10,
    ): Promise<{
        operationsCompleted: number;
        averageResponseTime: number;
        memoryImpact: number;
        errors: string[];
    }> {
        console.log(`🔥 Starting cache stress test for ${duration / 1000}s at ${operationsPerSecond} ops/sec...`);

        const startMemory = this.getCurrentMemoryStats();
        const startTime = Date.now();
        const errors: string[] = [];
        let operationsCompleted = 0;
        let totalResponseTime = 0;

        // Start memory tracking
        this.startMemoryTracking(500);

        const interval = 1000 / operationsPerSecond;

        const testPromise = new Promise<void>((resolve) => {
            const timer = setInterval(async () => {
                if (Date.now() - startTime >= duration) {
                    clearInterval(timer);
                    resolve();
                    return;
                }

                try {
                    const opStart = performance.now();

                    // Simulate cache operations
                    await new Promise((r) => setTimeout(r, Math.random() * 50)); // 0-50ms random operation

                    const opTime = performance.now() - opStart;
                    totalResponseTime += opTime;
                    operationsCompleted++;
                } catch (error) {
                    errors.push(error instanceof Error ? error.message : 'Unknown error');
                }
            }, interval);
        });

        await testPromise;

        const memoryAnalysis = this.stopMemoryTracking();
        const endMemory = this.getCurrentMemoryStats();

        const results = {
            operationsCompleted,
            averageResponseTime: operationsCompleted > 0 ? totalResponseTime / operationsCompleted : 0,
            memoryImpact: endMemory && startMemory ? endMemory.used - startMemory.used : 0,
            errors,
        };

        console.log('🔥 Stress test completed!', results);
        return results;
    }

    /**
     * Generate a detailed performance report
     */
    public generatePerformanceReport(): string {
        const memoryStats = this.getCurrentMemoryStats();
        const timestamp = new Date().toISOString();

        return `
# Cache Performance Report
Generated: ${timestamp}

## Memory Usage
${
    memoryStats
        ? `
- Used: ${memoryStats.used}MB
- Total: ${memoryStats.total}MB  
- Limit: ${memoryStats.limit}MB
- Usage: ${Math.round((memoryStats.used / memoryStats.limit) * 100)}%
`
        : 'Memory stats not available'
}

## Cache Configuration
- Max Cached Keys: 50,000
- Evictable Collections: 5 types
- Memory Pressure Handling: Not implemented

## Recommendations
1. Consider reducing maxCachedKeysCount for mobile devices
2. Implement memory pressure detection and aggressive eviction
3. Add more collections to evictableKeys list
4. Implement lazy loading for large datasets
5. Add periodic cache cleanup routines
6. Monitor memory usage in production

## Test Commands
\`\`\`javascript
// Start comprehensive preload test
window.cacheDebug.runPreloadTest()

// Start memory monitoring
window.cacheDebug.startMemoryTracking()

// Run stress test
window.cacheDebug.performanceStressTest()
\`\`\`
        `.trim();
    }
}

// Export singleton instance
const cacheDebugUtils = new CacheDebugUtils();
export default cacheDebugUtils;
