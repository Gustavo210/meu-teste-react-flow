import React, { memo } from "react";
import { Handle, Position, useConnection } from "@xyflow/react";

// eslint-disable-next-line react-refresh/only-export-components
export default memo(({ data, id }) => {
  const connection = useConnection();
  const isTarget = connection.inProgress && connection.fromNode.id !== id;
  return (
    <>
      <div>{data.label}</div>
      <input
        className="nodrag"
        type="color"
        onChange={data.onChange}
        defaultValue={data.color}
      />
      {!connection.inProgress && (
        <Handle
          className="customHandleRight"
          position={Position.Right}
          type="source"
        />
      )}
      {(!connection.inProgress || isTarget) && (
        <Handle
          className="customHandle"
          position={Position.Left}
          type="target"
          isConnectableStart={false}
        />
      )}
    </>
  );
});
