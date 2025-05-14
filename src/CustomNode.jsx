import React from 'react'
import { Handle, Position } from 'reactflow'

function CustomNode({ data, selected }) {
  return (
    <div
      style={{
        background: selected ? '#e6f7ff' : '#f0f4f8',
        border: selected ? '2px solid #0077cc' : '1px solid #ccc',
        borderRadius: 8,
        padding: 8,
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        minWidth: 140,
        maxWidth: 200,
      }}
    >
      <textarea
        value={data.label}
        onChange={(e) => data.onChange(e.target.value)}
        onFocus={data.onFocus}   // ✅ 添加这一行
        onBlur={data.onBlur}     // ✅ 添加这一行
        style={{
          fontSize: '12px',
          width: '100%',
          height: '60px',
          resize: 'none',
          border: 'none',
          outline: 'none',
          backgroundColor: 'transparent',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      />
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

export default CustomNode
