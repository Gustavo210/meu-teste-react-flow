; import React, { memo } from 'react';
import { Handle, Position, useConnection } from '@xyflow/react';

export default memo(({ data, isConnectable, id }) => {
  const connection = useConnection();
  const isTarget = connection.inProgress && connection.fromNode.id !== id;
  return (
    <>

      <div>
        Custom Color Picker Node: <strong>{data.color}</strong>
      </div>
      <input
        className="nodrag"
        type="color"
        onChange={data.onChange}
        defaultValue={data.color}
      />
      {!connection.inProgress && (
        <Handle
          className='customHandleRight'
          position={Position.Right}
          type="source"
        />
      )}
      {(!connection.inProgress || isTarget) && (
        <Handle className="customHandle" position={Position.Left} type="target" isConnectableStart={false} />
      )}
    </>
  );
});
