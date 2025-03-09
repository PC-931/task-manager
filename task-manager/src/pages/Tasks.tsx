import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTasks, addTask, removeTask } from "../store/taskSlice"; //need to include edit task
import { RootState, AppDispatch } from "../store/store";

const Tasks = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, loading, error } = useSelector((state: RootState) => state.tasks);
  const token = useSelector((state: RootState) => state.auth.token);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    if (token) {
      dispatch(fetchTasks(token));
    }
  }, [dispatch, token]);

  const filteredTasks = tasks.filter((task) => {
    return priorityFilter === "all" || task.priority === priorityFilter;
  });

  const handleAddTask = () => {
    if (title.trim() && description.trim()) {
      const newTask = { id: Date.now().toString(), title, description, completed: false, priority };
      dispatch(addTask({ task: newTask, token: token as string }));
      setTitle("");
      setDescription("");
      setPriority("medium");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Tasks</h2>

      {/* Task Form */}
      <div className="mb-4 flex gap-2">
        <input type="text" placeholder="Task Title" className="border p-2 flex-1" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="text" placeholder="Description" className="border p-2 flex-1" value={description} onChange={(e) => setDescription(e.target.value)} />
        <select className="border p-2" value={priority} onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button className="bg-blue-500 text-white p-2" onClick={handleAddTask}>Add Task</button>
      </div>

      {/* Priority Filter */}
      <div className="mb-4">
        <select className="border p-2" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* Display Tasks */}
      {loading && <p>Loading tasks...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <ul>
        {filteredTasks.map((task) => (
          <li key={task.id} className={`border p-3 mb-2 flex justify-between items-center ${task.priority === "high" ? "border-red-500" : task.priority === "medium" ? "border-yellow-500" : "border-green-500"}`}>
            <div>
              <h3 className="text-lg">{task.title}</h3>
              <p className="text-sm">{task.description}</p>
              <p className={`text-sm ${task.completed ? "text-green-500" : "text-gray-500"}`}>
                {task.completed ? "Completed" : "Pending"}
              </p>
              <p className="text-sm font-bold">Priority: {task.priority.toUpperCase()}</p>
            </div>
            <button className="bg-red-500 text-white p-2" onClick={() => dispatch(removeTask({ taskId: task.id, token: token as string }))}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tasks;
