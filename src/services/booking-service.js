const { BookingRepository } = require("../repository/index");
const { FLIGHT_SERVICE_PATH } = require("../config/serverConfig");
const axios = require("axios");
const { ServiceError } = require("../utils/errors");

class BookingService {
    constructor() {
        this.BookingRepository = new BookingRepository();
    }

    async createBooking(data) {
        try {
            const flightId = data.flightId;
            let getFlightRequestURL = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${flightId}`;
            const response = await axios.get(getFlightRequestURL);
            const flightData = response.data.data;
            let priceOfTheFlight = flightData.price;
            if (data.noOfSeats > flightData.totalSeats) {
                throw new ServiceError(
                    "Something went wrong in the booking process",
                    "Insufficient seats in the flight"
                );
            }
            const totalCost = priceOfTheFlight * data.noOfSeats;
            const bookingPayload = { ...data, totalCost };
            const booking = await this.BookingRepository.create(bookingPayload);
            return booking;
        } catch (error) {
            if (
                error.name == "RepositoryError" ||
                error.name == "ValidationError"
            ) {
                throw error;
            }
            throw new ServiceError();
        }
    }
}

module.exports = BookingService;
