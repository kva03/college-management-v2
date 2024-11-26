import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
type Props = {}

export default function StudentSoltSelect({}: any) {
    const getSlotStatus = (dayIndex, hour) => {
        return schedule[dayIndex]?.[hour]?.status || SlotStatus.FREE;
      };
  return (
    <Select
    value={getSlotStatus(dayIndex, hour)}
    onValueChange={(value) => handleUpdateSlot(dayIndex, hour, value)}
   
  >
    <SelectTrigger 
      className={`w-full ${getStatusColor(getSlotStatus(dayIndex, hour))} 
      ${false ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {/* <SelectItem value={SlotStatus.FREE}>1st Quater</SelectItem>
      <SelectItem value={SlotStatus.BUSY}>Half Hour</SelectItem>
      <SelectItem value={SlotStatus.LECTURE}>3RD Quater</SelectItem>
      <SelectItem value={SlotStatus.OTHER}>FullHour</SelectItem> */}
    </SelectContent>
  </Select>
  )
}