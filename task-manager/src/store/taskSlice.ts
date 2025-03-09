import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getTasks, createTask, updateTask as apiUpdateTask, deleteTask } from "../api/Tasks";

interface Task {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    priority: "low" | "medium" | "high"; // New priority field
  }

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
};

// Fetch tasks
export const fetchTasks = createAsyncThunk("tasks/fetch", async (token: string, { rejectWithValue }) => {
  try {
    return await getTasks(token);
  } catch {
    return rejectWithValue("Failed to fetch tasks");
  }
});

// Add a new task
// export const addTask = createAsyncThunk("tasks/add", async ({ task, token }: { task: Task; token: string }, { rejectWithValue }) => {
//   try {
//     return await createTask(task, token);
//   } catch (error) {
//     return rejectWithValue("Failed to create task");
//   }
// });

// Update addTask to include priority
export const addTask = createAsyncThunk(
    "tasks/add",
    async ({ task, token }: { task: Task; token: string }, { rejectWithValue }) => {
      try {
        return await createTask({ ...task, priority: task.priority || "medium" }, token);
      } catch {
        return rejectWithValue("Failed to add task: ");
      }
    }
  );

// Update a task
export const updateTask = createAsyncThunk(
    "tasks/edit",
    async ({ taskId, updates, token }: { taskId: string; updates: Partial<Task>; token: string }, { rejectWithValue }): Promise<unknown> => {
      try {
        return await apiUpdateTask(taskId, updates, token);
      } catch{
        return rejectWithValue("Failed to update task");
      }
    }
  );

// Delete a task
export const removeTask = createAsyncThunk("tasks/remove", async ({ taskId, token }: { taskId: string; token: string }, { rejectWithValue }) => {
  try {
    return await deleteTask(taskId, token);
  } catch{
    return rejectWithValue("Failed to delete task");
  }
});

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const updatedTask = action.payload as Task;
        state.tasks = state.tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task));
      })
      .addCase(removeTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((task) => task.id !== action.meta.arg.taskId);
      });
  },
});

export default taskSlice.reducer;
