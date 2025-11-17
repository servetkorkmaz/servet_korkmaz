
import React from 'react';

type IconProps = {
  className?: string;
};

export const IconUpload: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
);

export const IconWand: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 4V2"></path>
        <path d="M15 8V6"></path>
        <path d="M12.5 6.5.5 18.5"></path>
        <path d="M18 12.5 11.5 6"></path>
        <path d="M20 2 14 8"></path>
        <path d="m14 2-1.5 1.5"></path>
        <path d="m22 10-1.5 1.5"></path>
        <path d="m3.5 20.5 1.5-1.5"></path>
        <path d="m10 22 1.5-1.5"></path>
        <path d="M18 8a2 2 0 0 0-2-2"></path>
        <path d="M6 16a2 2 0 0 0 2 2"></path>
    </svg>
);

export const IconSparkles: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3L9.5 8.5L4 11L9.5 13.5L12 19L14.5 13.5L20 11L14.5 8.5L12 3Z"/>
      <path d="M21 3L19 5"/>
      <path d="M3 21L5 19"/>
      <path d="M19 21L21 19"/>
      <path d="M3 3L5 5"/>
    </svg>
);

// FIX: Added 'IconMoviePlay' component.
export const IconMoviePlay: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 5.2H2a.7.7 0 0 0-.8.7v12.2a.7.7 0 0 0 .8.7h20a.7.7 0 0 0 .8-.7V5.9a.7.7 0 0 0-.8-.7Z"></path>
        <path d="m10 15.3 5-3.2-5-3.2v6.4Z"></path>
    </svg>
);

export const IconDownload: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
);