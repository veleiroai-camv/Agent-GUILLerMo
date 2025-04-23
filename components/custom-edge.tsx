import { memo } from "react"
import { type EdgeProps, getSmoothStepPath, EdgeLabelRenderer } from "reactflow"

export const CustomEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    data,
    markerEnd,
  }: EdgeProps) => {
    const [edgePath, labelX, labelY] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    })

    return (
      <>
        <path
          id={id}
          style={style}
          className="react-flow__edge-path stroke-foreground stroke-2"
          d={edgePath}
          markerEnd={markerEnd}
        />
        {data?.label && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: "absolute",
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                pointerEvents: "all",
              }}
              className="nodrag nopan rounded bg-background px-2 py-1 text-xs shadow-md"
            >
              {data.label}
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    )
  },
)

CustomEdge.displayName = "CustomEdge"
