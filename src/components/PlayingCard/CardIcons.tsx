import React from 'react';

// Common SVG props
interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const SpadeIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 2C12 2 4 10 4 14C4 18 7.58172 19 10 19C11 19 11 20 11 22H13C13 20 13 19 14 19C16.4183 19 20 18 20 14C20 10 12 2 12 2Z" />
  </svg>
);

export const ClubIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 2C9.23858 2 7 4.23858 7 7C7 9.17709 8.39055 11.0264 10.3013 11.7138C8.52097 11.9056 7 13.3444 7 15C7 16.6569 8.34315 18 10 18C10.7416 18 11.4194 17.7288 11.9405 17.2831C11.9799 18.2435 11.5 21 11.5 21H12.5C12.5 21 12.0201 18.2435 12.0595 17.2831C12.5806 17.7288 13.2584 18 14 18C15.6569 18 17 16.6569 17 15C17 13.3444 15.479 11.9056 13.6987 11.7138C15.6094 11.0264 17 9.17709 17 7C17 4.23858 14.7614 2 12 2Z" />
  </svg>
);

export const DiamondIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 2L4 12L12 22L20 12L12 2Z" />
  </svg>
);

export const HeartIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" />
  </svg>
);

export const LogoIcon: React.FC<IconProps> = ({ size = 64, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="5" fill="rgba(255, 255, 255, 0.1)"/>
    <path d="M50 20L60 45H85L65 60L72.5 85L50 70L27.5 85L35 60L15 45H40L50 20Z" fill="currentColor"/>
  </svg>
);

export const CrownIcon: React.FC<IconProps> = ({ size = 48, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M3 17L4.5 7L9 11L12 4L15 11L19.5 7L21 17H3ZM2 19V21H22V19H2Z" />
  </svg>
);

export const ShieldIcon: React.FC<IconProps> = ({ size = 48, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" />
  </svg>
);
