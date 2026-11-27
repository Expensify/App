package com.margelo.nitro.utils

/**
 * Android lays no bar out along a side edge and gives no bar region inside the top inset, so there is no vertical bar
 * edge and no top bar region, and neither ever changes.
 */
class HybridWindowBarsModule : HybridWindowBarsModuleSpec() {
    override val memorySize: Long = 0L

    override val verticalBarEdge: VerticalBarEdge = VerticalBarEdge.UNSPECIFIED

    override val topBarRegion: TopBarRegion? = null

    override fun addChangeListener(onChange: () -> Unit): () -> Unit = {}
}
