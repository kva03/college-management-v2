'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createBooking } from '@/actions/booking';
import moment from 'moment'
interface TimeSlot {
  id: string;
  teacherId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  status: string;
  isRecurring: boolean;
  Booking: any[];
}

interface BookingModalProps {
  timeSlot: TimeSlot;
  teacherId: string;
  onClose: () => void;
  onBooking: () => void;
}
const extractBookTimes = (data) => {
  return data
      .filter((item) => item.requestedStartTime) // Ensure `requestedStartTime` is not null
      .map((item) => ({
        time: moment(item.requestedStartTime).format('hh:mm A'), // Format time
        status: item.status, // Include the status field
      }));
};
const BookingModal: React.FC<BookingModalProps> = ({ teacherId, timeSlot, onClose, onBooking }) => {
  const [reason, setReason] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [bookedTime, setBookedTime] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [error, setError] = useState('');

  const formatTimeForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toTimeString().slice(0, 5); // HH:mm format
  };

  const slotStartTime = formatTimeForInput(timeSlot.startTime);
  const slotEndTime = formatTimeForInput(timeSlot.endTime);

useEffect(()=>{

  setBookedTime(extractBookTimes(timeSlot.Booking))
},[timeSlot])
  useEffect(() => {
    const generateSlots = () => {
      const slotList: string[] = [];
      const startHour = parseInt(slotStartTime.split(':')[0]);
      const startMinute = parseInt(slotStartTime.split(':')[1]);
      const endHour = parseInt(slotEndTime.split(':')[0]);
      const endMinute = parseInt(slotEndTime.split(':')[1]);

      let currentHour = startHour;
      let currentMinute = startMinute;

      while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
        const time = new Date();
        time.setHours(currentHour, currentMinute, 0);

        slotList.push(
            time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        );

        currentMinute += 15;
        if (currentMinute === 60) {
          currentHour += 1;
          currentMinute = 0;
        }
      }

      return slotList;
    };

    setSlots(generateSlots());
  }, [slotStartTime, slotEndTime]);

  const handleSlotSelection = (slot: string) => {
    setSelectedSlot(slot === selectedSlot ? null : slot); // Toggle the selection
  };


  const handleBooking = async () => {
    setError('');

    if (!selectedSlot) {
      setError('Please select a valid time slot.');
      return;
    }



    try {
      // Parse the base date and selected time
      const baseDate = moment(timeSlot.startTime); // Get the date from the timeslot
      const [hour, minute] = selectedSlot.split(':').map((t) => parseInt(t)); // Extract hour and minute from selectedSlot

      // Construct the start time using the selected slot
      const startTime = baseDate.clone().set({
        hour,
        minute,
        second: 0,
        millisecond: 0,
      });

      // Add 15 minutes to get the end time
      const endTime = startTime.clone().add(15, 'minutes');

      console.log('Start Time:', startTime.format('YYYY-MM-DD HH:mm:ss'));
      console.log('End Time:', endTime.format('YYYY-MM-DD HH:mm:ss'));

      // Send booking data to the API
      const response = await createBooking({
        teacherId,
        timeSlotId: timeSlot.id,
        reason,
        requestedStartTime: startTime.toISOString(),
        requestedEndTime: endTime.toISOString(),
      });

      if (response) {
        onBooking();
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      setError('Failed to book the appointment. Please try again.');
    }
  };

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  console.log(bookedTime)
  return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Appointment</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <div className="space-y-4">
              <p>Day: {daysOfWeek[timeSlot.dayOfWeek]}</p>
              <p>Available Slot: {slotStartTime} - {slotEndTime}</p>
              <div>
                <label className="block text-gray-700 mb-2">Select Time Slot</label>
                <div className="grid grid-cols-4 gap-2">
                  {slots.map((slot) => (
                      <button
                          key={slot}
                          type="button"
                          disabled={bookedTime.some(
                              (booking) => booking.time === slot && booking.status !== "REJECTED"
                          )}
                          onClick={() => handleSlotSelection(slot)}
                          className={`p-2 rounded-md border ${
                            bookedTime.some((booking) => booking.time === slot && booking.status === "APPROVED")
                              ? "bg-green-300 text-green-900" // Green for ACCEPTED
                              : bookedTime.some((booking) => booking.time === slot && booking.status === "PENDING")
                              ? "bg-blue-300 text-blue-900" // Light blue for PENDING
                              : selectedSlot === slot
                              ? "bg-blue-500 text-white" // Blue for selected slot
                              : "bg-gray-200 text-gray-700" // Default for unselected slots
                          }`}
                      >
                        {slot}
                      </button>
                  ))}
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>
              <div>
                <label htmlFor="reason" className="block text-sm font-medium">Reason for booking:</label>
                <Input
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter reason for booking"
                />
              </div>
            </div>
          </DialogDescription>
          <DialogFooter>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={handleBooking} disabled={!selectedSlot || !reason}>Book</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
};

export default BookingModal;
