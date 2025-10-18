import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  to?: string;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const BackButton: React.FC<BackButtonProps> = ({ 
  to, 
  onClick, 
  className = '',
  children 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 ${className}`}
    >
      <ArrowLeft size={20} />
      {children && <span className="font-medium">{children}</span>}
    </button>
  );
};

export default BackButton;