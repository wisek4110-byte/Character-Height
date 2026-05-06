import React from 'react';

interface Props {
  id: string;
  width: number;
  height: number;
  color: string;
  name?: string;
}

export default function ObjectVisual({ id, width, height, color, name }: Props) {
  const containerStyle = {
    width: `${width}px`,
    height: `${height}px`,
    position: 'relative' as const,
    opacity: 0.85,
  };

  const NameTag = () => {
    if (!name) return null;
    return <div className="absolute -top-6 -left-2 whitespace-nowrap text-[11px] font-medium text-gray-700 bg-white/80 px-2 py-0.5 rounded shadow-sm border border-gray-200 pointer-events-none z-10 backdrop-blur-sm">{name}</div>;
  };

  if (id === 'obj-door') {
    return (
      <div style={containerStyle} className="bg-[#f2f1ec] border-[#d4d4d0] border-[1px] rounded-sm flex flex-col items-center py-[8%] shadow-sm">
        <div className="w-[66%] h-[50%] border-[1px] border-[#d4d4d0] bg-[#ebeae4] mb-[8%]"></div>
        <div className="w-[66%] h-[30%] border-[1px] border-[#d4d4d0] bg-[#ebeae4]"></div>
        {/* Door handle & keyhole */}
        <div className="absolute left-[14%] top-[54%] w-[8%] h-[2px] bg-[#9ca3af]"></div>
        <div className="absolute left-[14%] top-[58%] w-[2%] h-[2.5%] rounded bg-[#9ca3af]"></div>
        {/* Hinges */}
        <div className="absolute right-0 top-[15%] w-[2%] h-[4%] bg-[#e5e7eb] border-y-[1px] border-l-[1px] border-[#d1d5db]"></div>
        <div className="absolute right-0 top-[50%] w-[2%] h-[4%] bg-[#e5e7eb] border-y-[1px] border-l-[1px] border-[#d1d5db]"></div>
        <div className="absolute right-0 bottom-[15%] w-[2%] h-[4%] bg-[#e5e7eb] border-y-[1px] border-l-[1px] border-[#d1d5db]"></div>
        <NameTag />
      </div>
    );
  }

  if (id === 'obj-bed') {
    return (
      <div style={containerStyle} className="bg-[#f0f0f0] border-[#cccccc] border-[1px] rounded-sm shadow-sm relative flex flex-col items-center">
        {/* Wooden Headboard */}
        <div className="absolute top-0 w-[100%] h-[4%] bg-[#d2b48c] border-b-[1px] border-[#c19a6b] rounded-t-sm z-0"></div>
        <div className="absolute top-[4%] w-[96%] h-[2%] bg-[#deb887] border-b-[1px] border-[#d2b48c] z-0"></div>
        
        {/* Pillow area background */}
        <div className="absolute top-[6%] w-[96%] h-[20%] bg-[#e8e8e8] border-x-[1px] border-[#cccccc] z-0"></div>
        
        {/* Pillows */}
        <div className="absolute top-[7%] w-[75%] h-[12%] bg-white border-[1px] border-[#dddddd] rounded-md shadow-sm z-10 flex items-center justify-center"></div>
        <div className="absolute top-[13%] w-[55%] h-[6%] bg-white border-[1px] border-[#dddddd] rounded-full shadow-sm z-10"></div>
        
        {/* Blanket/Duvet */}
        <div className="absolute bottom-0 w-[96%] h-[74%] bg-white border-[1px] border-[#e0e0e0] rounded-t-lg shadow-sm z-10 flex flex-col items-center">
          <div className="w-full h-[12%] bg-[#f8f8f8] border-b-[1px] border-[#eeeeee] rounded-t-lg mb-2"></div>
          {/* Subtle bedding folds */}
          <div className="w-[80%] h-[1px] bg-[#f0f0f0] mt-[10%] rotate-2 opacity-50"></div>
          <div className="w-[60%] h-[1px] bg-[#f0f0f0] mt-[20%] -rotate-3 opacity-50"></div>
          <NameTag />
        </div>
      </div>
    );
  }

  if (id === 'obj-car') {
    return (
      <div style={containerStyle} className="relative flex flex-col items-end justify-end">
        <svg 
          viewBox="0 0 480 207" 
          width="100%" 
          height="100%" 
          preserveAspectRatio="none"
          className="drop-shadow-sm overflow-visible"
        >
          {/* Main Body Silhouette - Sleeker Sedan */}
          <path 
            d="M30,173 L10,173 C5,173 0,168 0,163 L0,138 C0,118 30,93 70,83 L160,63 C190,28 250,23 310,23 C380,23 430,43 460,83 L470,93 C480,103 480,118 480,133 L480,163 C480,168 475,173 470,173 L440,173"
            fill="#f4f4f5"
            stroke="#d4d4d8"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* Windows */}
          <path 
            d="M175,68 L275,68 L275,36 C230,36 190,48 175,68 Z" 
            fill="#e4e4e7" 
            stroke="#d4d4d8"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          <path 
            d="M285,68 L400,68 C380,48 340,36 285,36 L285,68 Z" 
            fill="#e4e4e7" 
            stroke="#d4d4d8"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />

          {/* Details - Doors, handles */}
          <rect x="275" y="36" width="6" height="32" fill="#d4d4d8" />
          <path d="M278,68 L278,168" stroke="#d4d4d8" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <path d="M175,68 L175,168" stroke="#d4d4d8" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          
          {/* Door handles */}
          <rect x="230" y="80" width="16" height="4" rx="2" fill="#fafafa" stroke="#d4d4d8" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <rect x="340" y="80" width="16" height="4" rx="2" fill="#fafafa" stroke="#d4d4d8" strokeWidth="1" vectorEffect="non-scaling-stroke" />

          {/* Trunk line & Hood Line */}
          <path d="M430,83 L470,93" stroke="#d4d4d8" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <path d="M70,83 L30,93" stroke="#d4d4d8" strokeWidth="1" vectorEffect="non-scaling-stroke" />

          {/* Wheels */}
          <g>
            <circle cx="105" cy="173" r="34" fill="#71717a" stroke="#52525b" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <circle cx="105" cy="173" r="24" fill="#f4f4f5" stroke="#d4d4d8" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <circle cx="105" cy="173" r="6" fill="#a1a1aa" />
          </g>
          
          <g>
            <circle cx="375" cy="173" r="34" fill="#71717a" stroke="#52525b" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <circle cx="375" cy="173" r="24" fill="#f4f4f5" stroke="#d4d4d8" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <circle cx="375" cy="173" r="6" fill="#a1a1aa" />
          </g>
          
          {/* Lights */}
          <path d="M15,128 Q0,143 15,153 L25,140 Z" fill="#fef08a" stroke="#fde047" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <path d="M465,118 Q480,128 475,143 L455,133 Z" fill="#fca5a5" stroke="#f87171" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
        <NameTag />
      </div>
    );
  }

  if (id === 'obj-chalkboard') {
    return (
      <div style={containerStyle} className="bg-[#a16207] border-[#713f12] border-[1px] shadow-sm rounded-sm p-[4px] relative flex flex-col justify-between">
        {/* Board Surface */}
        <div className="w-full flex-grow bg-[rgb(29,84,63)] border-[1px] border-[#064e3b] rounded-[1px] relative overflow-hidden">
           {/* Subtle chalk marking */}
           <div className="absolute top-[20%] left-[10%] w-[30%] h-[1px] bg-white/20"></div>
           <div className="absolute top-[35%] left-[15%] w-[20%] h-[1px] bg-white/20"></div>
           <div className="absolute top-[50%] left-[5%] w-[40%] h-[1px] bg-white/10"></div>
        </div>
        
        {/* Chalk holder tray area */}
        <div className="w-full h-[8px] flex items-end px-[20px] justify-between mt-[4px]">
           <div className="flex gap-[8px] h-full items-end pb-[1px]">
             <div className="w-[12px] h-[4px] bg-[#f8fafc] border-[1px] border-[#cbd5e1] rounded-[1px]"></div>
             <div className="w-[12px] h-[4px] bg-[#fce7f3] border-[1px] border-[#fbcfe8] rounded-[1px]"></div>
             <div className="w-[12px] h-[4px] bg-[#bfdbfe] border-[1px] border-[#93c5fd] rounded-[1px]"></div>
           </div>
           {/* Eraser */}
           <div className="w-[30px] h-[6px] bg-[#f1f5f9] border-[1px] border-[#94a3b8] rounded-[1px] mb-[1px]"></div>
        </div>
        <NameTag />
      </div>
    );
  }

  // Default fallback
  const baseStyle = {
    width: `${width}px`,
    height: `${height}px`,
    backgroundColor: `${color}40`,
    borderColor: color,
    borderWidth: '1px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
  };

  return (
    <div style={baseStyle} className="rounded-sm shadow-sm border-dashed text-center">
      <NameTag />
    </div>
  );
}
