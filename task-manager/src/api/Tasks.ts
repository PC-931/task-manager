import axios from "axios";

const API_URL = "http://localhost:5000/api/tasks"; // Update with your backend URL

// Get all tasks
// export const getTasks = async (token: string) => {
//   const response = await axios.get(API_URL, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   return response.data;
// };

// Get all tasks
export const getTasks = async (token: string) => {
  const response = await axios.get(API_URL, {
    headers: { "x-auth-token": token }, // ✅ Change Authorization to x-auth-token
  });
  return response.data;
};


// Create a task
export const createTask = async (task: { title: string; description: string; priority: string }, token: string) => {
  const response = await axios.post(API_URL, task, {
    headers: { "x-auth-token": token },
  });
  return response.data;
};

// Update a task
export const updateTask = async (taskId: string, updates: { title?: string; description?: string; completed?: boolean }, token: string) => {
  const response = await axios.put(`${API_URL}/${taskId}`, updates, {
    headers: { "x-auth-token": token },
  });
  return response.data;
};

// Delete a task
export const deleteTask = async (taskId: string, token: string) => {
  const response = await axios.delete(`${API_URL}/${taskId}`, {
    headers: { "x-auth-token": token },
  });
  return response.data;
};
