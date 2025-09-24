import React from 'react';

type Props = { to?: string; label?: string };

const BackButton: React.FC<Props> = ({ to = '#', label = '← Volver' }) => {
  const go = () => { window.location.hash = to; };
  return (
    <button
      onClick={go}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-100 text-gray-700"
    >
      {label}
    </button>
  );
};

export default BackButton;
