import { Booking, DayOfWeek } from '../types';

const BOOKINGS_STORAGE_KEY = 'app_bookings';

const getBookings = (): Promise<Booking[]> => {
  return new Promise((resolve) => {
    try {
      const bookingsJson = localStorage.getItem(BOOKINGS_STORAGE_KEY);
      resolve(bookingsJson ? JSON.parse(bookingsJson) : []);
    } catch (error) {
      console.error('Failed to retrieve bookings from localStorage', error);
      resolve([]);
    }
  });
};

const saveBookings = (bookings: Booking[]): Promise<void> => {
    return new Promise((resolve) => {
        localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
        resolve();
    });
};

const createBooking = async (details: { customerName: string; customerEmail: string; day: DayOfWeek; time: string; }): Promise<void> => {
    const bookings = await getBookings();
    const newBooking: Booking = {
        id: `booking-${Date.now()}`,
        ...details,
        bookedAt: new Date().toISOString()
    };
    const updatedBookings = [...bookings, newBooking];
    await saveBookings(updatedBookings);
};

const findBookingToRateByEmail = async (email: string): Promise<Booking | null> => {
    const bookings = await getBookings();
    // Find the most recent booking by this user that has not been rated yet.
    const userBookings = bookings
        .filter(b => b.customerEmail.toLowerCase() === email.toLowerCase() && !b.rating)
        .sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime());

    return userBookings[0] || null;
};

const submitRating = async (bookingId: string, rating: number, comment: string): Promise<void> => {
    const bookings = await getBookings();
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);
    
    if (bookingIndex === -1) {
        throw new Error("Booking not found.");
    }

    if (bookings[bookingIndex].rating) {
        throw new Error("error.rating.alreadyRated");
    }

    bookings[bookingIndex] = {
        ...bookings[bookingIndex],
        rating,
        comment,
        ratedAt: new Date().toISOString()
    };

    await saveBookings(bookings);
};

const getAllRatedBookings = async (): Promise<Booking[]> => {
    const bookings = await getBookings();
    return bookings
        .filter(b => b.rating)
        .sort((a, b) => new Date(b.ratedAt!).getTime() - new Date(a.ratedAt!).getTime());
};

export const bookingService = {
  createBooking,
  findBookingToRateByEmail,
  submitRating,
  getAllRatedBookings,
};
