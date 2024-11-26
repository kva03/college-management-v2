// app/actions/booking.ts
'use server'


import { getServerSession } from "next-auth/next"

import { revalidatePath } from "next/cache"
import { BookingStatus } from "@prisma/client"
import { authOptions } from "@/utils/auth"
import { prisma } from "@/utils/prismaDB"



export async function createBooking(data: {
  teacherId: string
  timeSlotId: string
  reason: string
  requestedStartTime: any
  requestedEndTime: any
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return { error: "Unauthorized" }
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { student: true }
  })

  if (!user?.student) {
    return { error: "Student not found" }
  }

  try {
    const booking = await prisma.booking.create({
      data: {
        teacherId: data.teacherId,
        studentId: user.student.id,
        timeSlotId: data.timeSlotId,
        reason: data.reason,
        requestedStartTime: data.requestedStartTime,
        requestedEndTime: data.requestedEndTime,
        status: BookingStatus.PENDING
      }
    })

    revalidatePath('/student/bookings')
    return booking
  } catch (error) {
    console.error('Error creating booking:', error)
    return { error: "Failed to create booking" }
  }
}

// export async function createBooking(data) {
//   const session = await getServerSession(authOptions);
//
//   if (!session?.user?.email) {
//     return { error: "Unauthorized" };
//   }
//
//   const user = await prisma.user.findUnique({
//     where: { email: session.user.email },
//     include: { student: true },
//   });
//
//   if (!user?.student) {
//     return { error: "Student not found" };
//   }
//
//   try {
//     // Check if the TimeSlot already exists
//     let timeSlot = await prisma.timeSlot.findFirst({
//       where: {
//         teacherId: data.teacherId,
//         dayOfWeek: new Date(data.requestedStartTime).getDay(), // Get the day of the week (0-6)
//         startTime: data.requestedStartTime,
//         endTime: data.requestedEndTime,
//       },
//     });
//
//     // If the TimeSlot doesn't exist, create it
//     if (!timeSlot) {
//       timeSlot = await prisma.timeSlot.create({
//         data: {
//           teacherId: data.teacherId,
//           dayOfWeek: new Date(data.requestedStartTime).getDay(), // Get the day of the week
//           startTime: data.requestedStartTime,
//           endTime: data.requestedEndTime,
//           status: "FREE", // Default status
//         },
//       });
//     }
//
//     // Create the Booking
//     const booking = await prisma.booking.create({
//       data: {
//         teacherId: data.teacherId,
//         studentId: user.student.id,
//         timeSlotId: timeSlot.id, // Use the dynamically created or fetched TimeSlot ID
//         reason: data.reason,
//         requestedStartTime: data.requestedStartTime,
//         requestedEndTime: data.requestedEndTime,
//         status: "PENDING", // Default status
//       },
//     });
//
//     revalidatePath('/student/bookings'); // Revalidate path if necessary
//     return booking;
//   } catch (error) {
//     console.error("Error creating booking:", error);
//     return { error: "Failed to create booking" };
//   }
// }



export async function getStudentBookings() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return { error: "Unauthorized" }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { student: true }
    })

    if (!user?.student) {
      return { error: "Student not found" }
    }

    const bookings = await prisma.booking.findMany({
      where: {
        studentId: user.student.id
      },
      include: {
        teacher: true,
        timeSlot: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return bookings
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return { error: "Failed to fetch bookings" }
  }
}

export async function getPendingBookings(teacherId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return { error: "Unauthorized" }
  }

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        teacherId,
        status: BookingStatus.PENDING
      },
      include: {
        student: true,
        timeSlot: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return bookings
  } catch (error) {
    console.error('Error fetching pending bookings:', error)
    return { error: "Failed to fetch pending bookings" }
  }
}


export async function approveBooking(
    bookingId: string,
    approvedTimes: {
      startTime: string;
      endTime: string;
    }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: "Unauthorized" };
  }

  try {
    // Update the booking with approved times
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.APPROVED,
        approvedStartTime: new Date(approvedTimes.startTime),
        approvedEndTime: new Date(approvedTimes.endTime),
      },
    });

    // Fetch all approved bookings for the same time slot (exclude REJECTED)
    const allBookings = await prisma.booking.findMany({
      where: {
        timeSlotId: booking.timeSlotId,
        NOT: { status: BookingStatus.REJECTED },
      },
    });

    // Calculate the total booked duration in minutes
    let totalBookedMinutes = 0;
    allBookings.forEach((b) => {
      // Only include bookings with valid approved times
      if (b.approvedStartTime && b.approvedEndTime) {
        const start = new Date(b.approvedStartTime).getTime();
        const end = new Date(b.approvedEndTime).getTime();
        totalBookedMinutes += (end - start) / 60000; // Convert milliseconds to minutes
      }
    });

    // Update time slot status based on total booked time
    if (totalBookedMinutes >= 60) {
      await prisma.timeSlot.update({
        where: {
          id: booking.timeSlotId,
        },
        data: {
          status: "BUSY",
        },
      });
    }

    // Revalidate paths
    revalidatePath("/teacher/bookings");
    revalidatePath("/student/bookings");

    return booking;
  } catch (error) {
    console.error("Error approving booking:", error);
    return { error: "Failed to approve booking" };
  }
}



// export async function approveBooking(bookingId: string, approvedTimes: {
//   startTime: string,
//   endTime: string
// }) {
//   const session = await getServerSession(authOptions)
//   if (!session?.user?.email) {
//     return { error: "Unauthorized" }
//   }
//
//   try {
//     const booking = await prisma.booking.update({
//       where: { id: bookingId },
//       data: {
//         status: BookingStatus.APPROVED,
//         approvedStartTime: new Date(approvedTimes.startTime),
//         approvedEndTime: new Date(approvedTimes.endTime)
//       }
//     })
//     await prisma.timeSlot.update({
//       where: {
//         id: booking.timeSlotId
//       },
//       data: {
//         status: 'BUSY'
//       }
//     })
//     revalidatePath('/teacher/bookings')
//     revalidatePath('/student/bookings')
//     return booking
//   } catch (error) {
//     console.error('Error approving booking:', error)
//     return { error: "Failed to approve booking" }
//   }
// }




export async function rejectBooking(bookingId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return { error: "Unauthorized" }
  }

  try {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.REJECTED
      }
    })

    revalidatePath('/teacher/bookings')
    revalidatePath('/student/bookings')
    return booking
  } catch (error) {
    console.error('Error rejecting booking:', error)
    return { error: "Failed to reject booking" }
  }
}
