import { getBezierPath, useInternalNode, useReactFlow } from "@xyflow/react";
import { useState, useCallback, useRef, useEffect } from "react";

import { getEdgeParams } from "./initialElements.js";

function FloatingEdge({ id, source, target, markerEnd, style, ...rest }) {
  const { updateEdge } = useReactFlow();
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);
  const [showTextArea, setShowTextArea] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [textareaSize, setTextareaSize] = useState();
  const textareaRef = useRef(null);
  const measureRef = useRef(null);

  const updateTextareaSize = useCallback(() => {
    const lines = (rest.label || "M").split("\n");
    const maxLineWidth = Math.max(
      ...lines.map((line) => {
        if (!measureRef.current) {
          return 0;
        }
        measureRef.current.textContent = line || "M";
        return measureRef.current.offsetWidth;
      }),
      2
    );

    const height = Math.max(20, lines.length * 20);

    const width = Math.max(40, maxLineWidth + 4);
    setTextareaSize({ width, height });
  }, [rest.label]);

  useEffect(() => {
    updateTextareaSize();
  }, [rest.label, updateTextareaSize]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "0";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [rest.label]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleLabelChange = useCallback(
    (event) => {
      updateEdge(id, {
        label: event.target.value,
      });
      if (rest.onLabelChange) {
        rest.onLabelChange(id, event.target.value);
      }
      if (event.target.value.length === 0) {
        setShowTextArea(false);
      }
    },
    [id, rest]
  );

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    sourceNode,
    targetNode
  );

  const [edgePath] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  });

  const pathLength = document.getElementById(id)?.getTotalLength() ?? 0;
  const midPoint =
    pathLength > 0
      ? document.getElementById(id)?.getPointAtLength(pathLength / 2)
      : { x: (sx + tx) / 2, y: (sy + ty) / 2 };

  const labelX = midPoint?.x ?? (sx + tx) / 2;
  const labelY = midPoint?.y ?? (sy + ty) / 2;

  const normalColor = "rgb(207, 207, 207)";
  const highlightColor = "rgb(0, 149, 255)";

  const edgePathStyle = {
    strokeWidth: 3,
    stroke: isHovered ? highlightColor : normalColor,
    transition: "stroke 0.2s ease",
    cursor: "pointer",
    ...style,
  };

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        style={edgePathStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={(event) => {
          event.stopPropagation();
        }}
        onDoubleClick={(event) => {
          event.stopPropagation();
          setShowTextArea(true);
        }}
      />
      {(showTextArea || !!rest.label?.length) && (
        <foreignObject
          width="100%"
          height="100"
          x={labelX - 220 / 1.5}
          y={labelY - 100 / 2 - 1}
          className="edgebutton-foreignobject"
          requiredExtensions="http://www.w3.org/1999/xhtml"
          data-edge-id={id}
        >
          <div
            style={{
              position: "relative",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              ref={measureRef}
              style={{
                position: "absolute",
                visibility: "hidden",
                whiteSpace: "pre",
                fontSize: "inherit",
                fontFamily: "inherit",
              }}
            >
              {rest.label || "M"}
            </span>
            {!!textareaSize && (
              <textarea
                ref={textareaRef}
                autoFocus
                value={rest.label}
                onChange={handleLabelChange}
                onBlur={() => {
                  if (!rest.label.length) {
                    setShowTextArea(false);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: `${textareaSize.width}px`,
                  minHeight: `${textareaSize.height}px`,
                  backgroundColor: "transparent",
                  border: "none",
                  outline: "none",
                  textAlign: "center",
                  fontSize: "inherit",
                  fontFamily: "inherit",
                  margin: 0,
                  padding: 0,
                  resize: "none",
                  overflow: "hidden",
                  lineHeight: "1.2",
                  pointerEvents: "auto",
                  position: "relative",
                  zIndex: 10,
                  background: "#fff",
                }}
                className="nodrag"
                placeholder="Adici"
              />
            )}
          </div>
        </foreignObject>
      )}
    </>
  );
}

export default FloatingEdge;
