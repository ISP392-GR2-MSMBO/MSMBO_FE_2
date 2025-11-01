import axios from "axios";

const BASE_URL = "http://localhost:8080";

const getAuthToken = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
        try {
            const userObject = JSON.parse(storedUser);
            return userObject?.token;
        } catch (e) { return null; }
    }
    return null;
};

const createAuthConfig = () => {
    const token = getAuthToken();
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const paymentApi = {
    createPaymentLink: async (bookingId) => {
        return axios
            .post(`${BASE_URL}/payment/create-link`, { bookingId: bookingId }, createAuthConfig())
            .then((response) => response.data)
            .catch((error) => {
                console.error("Error creating payment link:", error);
                throw error;
            });
    },

    handleTransfer: async (data) => {
        const response = await axios.post(`${BASE_URL}/payment/payos_transfer_handler`, data);
        return response.data;
    },
};
