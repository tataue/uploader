import { useMemo } from 'react';
import { FileInfo, ViewMode } from '../types/FileInfo';
import { groupByType, groupByTime } from '../utils/groupUtils';

export const useFileGroups = (files: FileInfo[], viewMode: ViewMode) => {
  const typeGroups = useMemo(() => groupByType(files), [files]);
  const timeGroups = useMemo(() => groupByTime(files), [files]);
  
  const currentGroups = viewMode === 'type' ? typeGroups : timeGroups;
  
  return {
    typeGroups,
    timeGroups,
    currentGroups
  };
};