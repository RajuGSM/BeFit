import React from 'react';

const Form = ({ children, title, onSubmit }) => {
  return (
    <div className="w-1/2 p-8">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">{title}</h2>
      <form onSubmit={onSubmit}>
        {children}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-4"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Form;
