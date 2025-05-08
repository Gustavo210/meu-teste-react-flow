import { memo } from 'react';
import { Handle, Position, NodeResizer, NodeToolbar, useConnection } from '@xyflow/react';
import { useState } from 'react';

const ResizableNodeSelected = ({ data, selected, isConnectable, id, ...rest }) => {
  const connection = useConnection();
  const [isEditing, setIsEditing] = useState(false)
  const [label, setLabel] = useState(data.label)
  const isTarget = connection.inProgress && connection.fromNode.id !== id;
  console.log("rest", rest)
  return (
    <div >
      <NodeToolbar
        isVisible={data.forceToolbarVisible || undefined}
        position={Position.Bottom}
      >
        <button>+</button>
        <button>-</button>
      </NodeToolbar>
      <NodeResizer
        color="#ff0071"
        isVisible={selected}
        minWidth={100}
        minHeight={30}
      />
      {isEditing ?
        <input
          defaultValue={label}
          onChange={e => setLabel(e.currentTarget.value)}
          onBlur={() => setIsEditing(false)}
          style={{ width: `calc(${rest.width}px - 1.85rem` }}
        /> :
        <div style={{ padding: 10 }} onDoubleClick={() => setIsEditing(true)}>{label}</div>}
      {!connection.inProgress && (
        <Handle
          position={Position.Right}
          type="source"
        />
      )}
      {(!connection.inProgress || isTarget) && (
        <Handle className="customHandle" position={Position.Left} type="target" isConnectableStart={false} />
      )}
    </div >
  );
};

export default memo(ResizableNodeSelected);
