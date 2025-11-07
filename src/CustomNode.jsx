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
    textAlign: 'left',
  };

  const labelStyle = { fontWeight: 'bold', marginBottom: 4, textAlign: 'left' };
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

  // 阻止输入框触发节点拖动
  const handleInputMouseDown = (e) => {
    e.stopPropagation();
  };

  // 拖动手柄样式
  const dragHandleStyle = {
    cursor: 'move',
    padding: '8px',
    marginBottom: '10px',
    background: 'rgba(0, 0, 0, 0.05)',
    borderRadius: '10px',
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#555',
  };

  return (
    <div style={boxStyle}>
      {/* 拖动手柄区域 */}
      <div className="drag-handle" style={dragHandleStyle}>
        ⋮⋮ 拖动此处移动节点
      </div>

      <div style={labelStyle}>Task id:</div>
      <input
        className="nodrag"
        value={data.taskId}
        onChange={(e) => data.onChange('taskId', e.target.value)}
        style={inputStyle}
        onMouseDown={handleInputMouseDown}
      />

      <div style={labelStyle}>Task name:</div>
      <input
        className="nodrag"
        value={data.taskName}
        onChange={(e) => data.onChange('taskName', e.target.value)}
        style={inputStyle}
        onMouseDown={handleInputMouseDown}
      />

      <div style={labelStyle}>Memory & thread:</div>
      <input
        className="nodrag"
        value={data.memThread}
        onChange={(e) => data.onChange('memThread', e.target.value)}
        style={inputStyle}
        onMouseDown={handleInputMouseDown}
      />

      <div style={labelStyle}>Other parameters:</div>
      <input
        className="nodrag"
        value={data.params}
        onChange={(e) => data.onChange('params', e.target.value)}
        style={inputStyle}
        onMouseDown={handleInputMouseDown}
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
