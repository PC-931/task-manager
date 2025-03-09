import axios from "axios";

const API_URL = "http://localhost:5001/api/auth"; // Update with your backend URL

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data?.message || "Login failed";
    } else {
      throw "Login failed";
    }
  }
};

export const registerUser = async (username: string, email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/register`, { username, email, password });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data?.message || "Registration failed";
    } else {
      throw "Registration failed";
    }
  }
};
