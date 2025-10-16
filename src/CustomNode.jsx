import React from 'react';
import { Handle, Position } from 'reactflow';

function CustomNode({ data, selected }) {
  const boxStyle = {
    background: '#b0c4de',
    borderRadius: 20,
    padding: 12,
    width: 450,
    fontSize: '16px',
    color: '#000',
    fontFamily: 'Arial, sans-serif',
    boxShadow: selected ? '0 0 10px #0077cc' : '0 1px 4px rgba(0,0,0,0.1)',
  };

  const labelStyle = { fontWeight: 'bold', marginBottom: 4 };
  const inputStyle = {
    width: '100%',
    padding: '6px',
    border: '1px solid #ccc',
    borderRadius: 6,
    fontFamily: '微软雅黑',
    fontSize: '18px',
    marginBottom: 8,
    backgroundColor: selected ? '#fff' : '#f9f9f9',
  };

  // 通用阻止拖动行为
  const stopDrag = (e) => {
    e.stopPropagation();
  };

  return (
    <div style={boxStyle}>

      <div style={labelStyle}>Task id:</div>
      <input
        value={data.taskId}
        onChange={(e) => data.onChange('taskId', e.target.value)}
        style={inputStyle}
        onMouseDown={stopDrag}
        onPointerDown={stopDrag}
      />

      <div style={labelStyle}>Task name:</div>
      <input
        value={data.taskName}
        onChange={(e) => data.onChange('taskName', e.target.value)}
        style={inputStyle}
        onMouseDown={stopDrag}
        onPointerDown={stopDrag}
      />

      <div style={labelStyle}>Memory & thread:</div>
      <input
        value={data.memThread}
        onChange={(e) => data.onChange('memThread', e.target.value)}
        style={inputStyle}
        onMouseDown={stopDrag}
        onPointerDown={stopDrag}
      />

      <div style={labelStyle}>Other parameters:</div>
      <input
        value={data.params}
        onChange={(e) => data.onChange('params', e.target.value)}
        style={inputStyle}
        onMouseDown={stopDrag}
        onPointerDown={stopDrag}
      />
      <Handle
        type="target"
        position={Position.Top}
        style={{
          width: 12,
          height: 12,
          background: '#555',  // 可根据需要换颜色
          border: '2px solid white',
          borderRadius: '50%',
        }}
      />

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: 12,
          height: 12,
          background: '#555',
          border: '2px solid white',
          borderRadius: '50%',
        }}
      />
    </div>
  );
}

export default CustomNode;
