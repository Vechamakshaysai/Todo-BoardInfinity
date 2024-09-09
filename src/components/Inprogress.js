import React, { useState, useEffect } from "react";
import app from "../firebaseConfig";
import { getDatabase, ref, get, update } from "firebase/database";
import { useNavigate } from "react-router-dom";

function InProgress() {
  const navigate = useNavigate();
  const [fruitArray, setFruitArray] = useState([]);
  const [completedTodos, setCompletedTodos] = useState(
    JSON.parse(localStorage.getItem("completedTodos")) || []
  );
  const [inProgressTodos, setInProgressTodos] = useState(
    JSON.parse(localStorage.getItem("inProgressTodos")) || []
  );
  const [isCompleteScreen, setIsCompleteScreen] = useState(false);
  const [isInProgressScreen, setIsInProgressScreen] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem("completedTodos", JSON.stringify(completedTodos));
    localStorage.setItem("inProgressTodos", JSON.stringify(inProgressTodos));
  }, [completedTodos, inProgressTodos]);

  const fetchData = async () => {
    const db = getDatabase(app);
    const dbRef = ref(db, "nature/fruits");
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      setFruitArray(Object.values(snapshot.val()));
    } else {
      alert("Error fetching data");
    }
  };

  const handleComplete = async (index) => {
    // Update the completed status in Firebase (assuming "completed" field exists)
    const db = getDatabase(app);
    const fruitRef = ref(db, `nature/fruits/${fruitArray[index].id}`);
    try {
      await update(fruitRef, { completed: true });

      // Update local state for completed tasks
      const updatedFruitArray = [...fruitArray];
      updatedFruitArray[index].completed = true;
      updatedFruitArray[index].completedOn = new Date(); // Set completedOn to current date and time
      setFruitArray(updatedFruitArray);

      // Update completedTodos state and localStorage
      const updatedCompletedTodos = [
        ...completedTodos,
        updatedFruitArray[index],
      ];
      setCompletedTodos(updatedCompletedTodos);
      localStorage.setItem(
        "completedTodos",
        JSON.stringify(updatedCompletedTodos)
      );

      // Set isCompleteScreen to true to display completed tasks
      setIsCompleteScreen(true);
    } catch (error) {
      console.error("Error marking as completed:", error);
      alert("Error updating completed status.");
    }
  };

  const handleMarkInProgress = async (index) => {
    // Update the inProgress status in Firebase (assuming "inProgress" field exists)
    const db = getDatabase(app);
    const fruitRef = ref(db, `nature/fruits/${fruitArray[index].id}`);
    try {
      await update(fruitRef, { inProgress: true });

      // Update local state for in-progress tasks
      const updatedFruitArray = [...fruitArray];
      updatedFruitArray[index].inProgress = true;
      setFruitArray(updatedFruitArray);

      // Update inProgressTodos state and localStorage
      const updatedInProgressTodos = [
        ...inProgressTodos,
        updatedFruitArray[index],
      ];
      setInProgressTodos(updatedInProgressTodos);
      localStorage.setItem(
        "inProgressTodos",
        JSON.stringify(updatedInProgressTodos)
      );

      // Set isInProgressScreen to true to display in-progress tasks
      setIsInProgressScreen(true);
    } catch (error) {
      console.error("Error marking as in-progress:", error);
      alert("Error updating in-progress status.");
    }
  };

  const handleDisplayAllData = () => {
    setIsCompleteScreen(false);
    setIsInProgressScreen(false);
  };

  return (
    <div>
      <h1>Tasks</h1>
      <button onClick={fetchData}>Display All Data</button>
      <button onClick={() => setIsCompleteScreen(true)}>
        Display Completed Tasks
      </button>
      <button onClick={() => setIsInProgressScreen(true)}>
        Display In-Progress Tasks
      </button>
      <ul>
        {isCompleteScreen
          ? completedTodos.map((item, index) => (
              <li key={index}>
                {item.fruitName} - {item.fruitDefinition}
                <span>
                  {" "}
                  - Completed on: {item.completedOn.toLocaleString()}
                </span>
              </li>
            ))
          : isInProgressScreen
          ? inProgressTodos.map((item, index) => (
              <li key={index}>
                {item.fruitName} - {item.fruitDefinition}
                <span> - In Progress</span>
              </li>
            ))
          : fruitArray.map((item, index) => (
              <li key={index}>
                {item.fruitName} - {item.fruitDefinition}
                <button onClick={() => handleComplete(index)}>
                  Mark Complete
                </button>
                <button onClick={() => handleMarkInProgress(index)}>
                  Mark In-Progress
                </button>
              </li>
            ))}
      </ul>
    </div>
  );
}

export default InProgress;
