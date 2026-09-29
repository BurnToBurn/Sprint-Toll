import React from 'react';

interface RivetCornersProps {
  className?: string;
  inset?: string;
}

export const RivetCorners: React.FC<RivetCornersProps> = ({ inset = 'top-3 left-3 right-3 bottom-3' }) => {
  return (
    <>
      <div className="rivet top-2.5 left-2.5" aria-hidden="true" />
      <div className="rivet top-2.5 right-2.5" aria-hidden="true" />
      <div className="rivet bottom-2.5 left-2.5" aria-hidden="true" />
      <div className="rivet bottom-2.5 right-2.5" aria-hidden="true" />
    </>
  );
};
