import React from 'react';
import { NavLink } from 'react-router-dom';

const AmountBalance = () => {
  return (
    <div className="flex flex-row gap-9 items-center justify-center mb-8">
      <NavLink to={'/check-user-balance'} className="bg-blue-500 text-white py-2 px-4 rounded mt-4 border-[2px] border-blue-500 hover:bg-slate-50 hover:text-blue-500 transition-all duration-300 font-semibold">Check Balance</NavLink>
      <NavLink to={'/amount'} className="bg-blue-500 text-white py-2 px-4 rounded mt-4 border-[2px] border-blue-500 hover:bg-slate-50 hover:text-blue-500 transition-all duration-300 font-semibold">Withdraw Amount</NavLink>
    </div>
  );
};

export default AmountBalance;