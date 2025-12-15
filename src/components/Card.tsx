import React from "react";

interface CardProps {
  title: string;
  value: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  title,
  value,
  className = "",
  children,
}) => (
  <div
    className={`bg-cream p-4 rounded shadow-xl text-center font-semibold ${className}`}
  >
    <div className="text-xs text-navy">{title}</div>
    <div className="text-xl font-bold text-teal">{value}</div>
    {children}
  </div>
);

export default Card;
