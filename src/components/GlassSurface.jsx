import LiquidGlass from 'liquid-glass-react';

const SHARED_PROPS = {
  displacementScale: 95,
  blurAmount: 0.5,
  saturation: 140,
  aberrationIntensity: 1,
  elasticity: 0
};

export default function GlassSurface({
  children,
  padding = '18px',
  cornerRadius = 20,
  className = '',
  style,
  ...rest
}) {
  return (
    <LiquidGlass
      {...SHARED_PROPS}
      padding={padding}
      cornerRadius={cornerRadius}
      overLight
      className={`glass-surface ${className}`.trim()}
      style={{
        width: '100%',
        display: 'block',
        boxShadow: '0 22px 60px rgba(15, 17, 21, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.55)',
        ...style
      }}
      {...rest}
    >
      {children}
    </LiquidGlass>
  );
}
