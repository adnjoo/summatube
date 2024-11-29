import React from "react";

const MyButton: React.FC = () => {
  const handleClick = () => {
    alert("Summatube button clicked!");
  };

  return (
    <div className="absolute bottom-4 right-4 text-lg text-black bg-amber-400 z-50 p-4 rounded shadow-md">
      <span>Summatube Button </span>
      <button
        className="ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        onClick={handleClick}
      >
        Click Me
      </button>
    </div>
  );
};

export default MyButton;
