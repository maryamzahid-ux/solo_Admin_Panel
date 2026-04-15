import React from 'react';
import './Loader.css';

interface LoaderProps {
  fullScreen?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  fullScreen = false, 
  size = 'medium',
  color = '#52d244' 
}) => {
  const containerClass = fullScreen ? 'loader-container-full' : 'loader-container-inline';
  
  return (
    <div className={containerClass}>
      <div className={`solo-spinner ${size}`} style={{ borderTopColor: color }}>
        <div className="inner-dot" style={{ background: color }}></div>
      </div>
    </div>
  );
};

export default Loader;
