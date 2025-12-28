import React from 'react';

const VerdentDeck: React.FC = () => {
  return (
    <div className="w-[546px] h-[198px] relative">
      <div className="w-[546px] bg-black min-h-[198px] absolute top-0 left-0"></div>
      <div className="absolute top-[70px] left-[92px] flex justify-start items-center w-[360px] h-[60px]">
        <div className="relative w-[60px] h-[60px]">
          <div className="w-[60px] bg-gray-300 min-h-[60px] absolute top-0 left-0"></div>
          <img 
            src="/assets/image_1.png" 
            alt="Verdent Deck Icon" 
            className="w-[32px] h-[48px] absolute top-[6px] left-[14px]" 
          />
        </div>
        <div className="w-[300px] text-[40.22px] whitespace-nowrap text-white leading-[normal] tracking-[normal] font-semibold flex-shrink-0">
          <span className="text-[40.22px] tracking-[0%]">Verdent&nbsp;Deck</span>
        </div>
      </div>
    </div>
  );
};

export default VerdentDeck;