export const getTypeColor = (type: string): { bg: string; text: string; border: string } => {
  const lowerType = type.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(lowerType)) {
    return { 
      bg: 'bg-emerald-50', 
      text: 'text-emerald-700', 
      border: 'border-emerald-200' 
    };
  } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(lowerType)) {
    return { 
      bg: 'bg-red-50', 
      text: 'text-red-700', 
      border: 'border-red-200' 
    };
  } else if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(lowerType)) {
    return { 
      bg: 'bg-purple-50', 
      text: 'text-purple-700', 
      border: 'border-purple-200' 
    };
  } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(lowerType)) {
    return { 
      bg: 'bg-orange-50', 
      text: 'text-orange-700', 
      border: 'border-orange-200' 
    };
  } else if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'html', 'css'].includes(lowerType)) {
    return { 
      bg: 'bg-blue-50', 
      text: 'text-blue-700', 
      border: 'border-blue-200' 
    };
  } else if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(lowerType)) {
    return { 
      bg: 'bg-indigo-50', 
      text: 'text-indigo-700', 
      border: 'border-indigo-200' 
    };
  } else if (['xlsx', 'xls', 'csv'].includes(lowerType)) {
    return { 
      bg: 'bg-teal-50', 
      text: 'text-teal-700', 
      border: 'border-teal-200' 
    };
  }
  return { 
    bg: 'bg-slate-50', 
    text: 'text-slate-700', 
    border: 'border-slate-200' 
  };
};