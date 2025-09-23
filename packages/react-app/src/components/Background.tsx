import React from 'react';

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-enterprise-bg">
      {/* 简洁的企业级背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100">
        {/* 微妙的网格图案 */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(71, 85, 105, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(71, 85, 105, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
        
        {/* 顶部装饰性渐变 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700" />
      </div>
    </div>
  );
};

export default Background;