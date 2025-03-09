import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTasks, updateTask } from "../store/taskSlice";
import { RootState, AppDispatch } from "../store/store";
import { logout } from "../store/authSlice";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, loading, error } = useSelector((state: RootState) => state.tasks);
  const token = useSelector((state: RootState) => state.auth.token);

  // ✅ State for search, filter, and editing tasks
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [isEditing, setIsEditing] = useState(false);
  const [editTask, setEditTask] = useState({ id: "", title: "", completed: false });

  useEffect(() => {
    if (token) dispatch(fetchTasks(token));
  }, [dispatch, token]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // ✅ Handle Edit Button Click
  const handleEditClick = (task: { id: string; title: string; completed: boolean }) => {
    setEditTask(task);
    setIsEditing(true);
  };

  // ✅ Handle Task Update
  const handleUpdateTask = async () => {
    if (editTask.title.trim() === "") return;
    if (token) {
      await dispatch(updateTask({ taskId: editTask.id, updates: { title: editTask.title, completed: editTask.completed }, token }));
    }
    setIsEditing(false);
  };

  // ✅ Search & Filter Logic
  const filteredTasks = tasks
    .filter((task) => task.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((task) => (filter === "completed" ? task.completed : filter === "pending" ? !task.completed : true));

  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = tasks.length - completedTasks;

  return (
    <div className="p-6">
      {/* ✅ Logout Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={handleLogout}>Logout</button>
      </div>

      {/* ✅ Search & Filter */}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search tasks..."
          className="p-2 border rounded w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="p-2 border rounded"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {loading && <p>Loading tasks...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* ✅ Dashboard Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-500 text-white p-4 rounded shadow-md">
          <h3 className="text-lg font-semibold">Completed Tasks</h3>
          <p className="text-3xl font-bold">{completedTasks}</p>
        </div>
        <div className="bg-red-500 text-white p-4 rounded shadow-md">
          <h3 className="text-lg font-semibold">Pending Tasks</h3>
          <p className="text-3xl font-bold">{pendingTasks}</p>
        </div>
      </div>

      {/* ✅ Task List */}
      <div className="bg-white p-4 rounded shadow-md">
        <h3 className="text-lg font-bold mb-2">Task List</h3>
        {filteredTasks.map((task) => (
          <div key={task.id} className={`p-3 border mb-2 rounded ${task.completed ? "bg-green-100" : "bg-red-100"}`}>
            <div className="flex justify-between items-center">
              <span>{task.title}</span>
              <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => handleEditClick(task)}>
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Edit Task Modal */}
      {isEditing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-bold mb-2">Edit Task</h3>
            <input
              type="text"
              className="p-2 border rounded w-full mb-2"
              value={editTask.title}
              onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
            />
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                className="mr-2"
                checked={editTask.completed}
                onChange={(e) => setEditTask({ ...editTask, completed: e.target.checked })}
              />
              <label>Mark as Completed</label>
            </div>
            <div className="flex justify-end gap-2">
              <button className="bg-gray-400 text-white px-3 py-1 rounded" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={handleUpdateTask}>
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
