import React, { useState, useEffect } from "react";
import app from "../firebaseConfig";
import { getDatabase, ref, get, update } from "firebase/database";
import { useNavigate } from "react-router-dom";

function Completed() {
  const navigate = useNavigate();
  const [fruitArray, setFruitArray] = useState([]);
  const [completedTodos, setCompletedTodos] = useState(
    JSON.parse(localStorage.getItem("completedTodos")) || []
  );
  const [isCompleteScreen, setIsCompleteScreen] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem("completedTodos", JSON.stringify(completedTodos));
  }, [completedTodos]);

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

  const handleComplete = (index) => {
    // Update the completed status in Firebase (assuming "completed" field exists)
    const db = getDatabase(app);
    const fruitRef = ref(db, `nature/fruits/${fruitArray[index].id}`);
    update(fruitRef, { completed: true });

    // Update local state for completed tasks
    const updatedFruitArray = [...fruitArray];
    updatedFruitArray[index].completed = true;
    updatedFruitArray[index].completedOn = new Date(); // Set completedOn to current date and time
    setFruitArray(updatedFruitArray);

    // Update completedTodos state and localStorage
    const updatedCompletedTodos = [...completedTodos, updatedFruitArray[index]];
    setCompletedTodos(updatedCompletedTodos);
    localStorage.setItem(
      "completedTodos",
      JSON.stringify(updatedCompletedTodos)
    );

    // Set isCompleteScreen to true to display completed tasks
    setIsCompleteScreen(true);
  };

  const handleDisplayAllData = () => {
    setIsCompleteScreen(false);
  };

  return (
    <div>
      <h1>COMPLETED</h1>
      <button onClick={fetchData}>Display All Data</button>
      <button onClick={() => setIsCompleteScreen(true)}>
        Display Completed Tasks
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
          : fruitArray.map((item, index) => (
              <li key={index}>
                {item.fruitName} - {item.fruitDefinition}
                <button onClick={() => handleComplete(index)}>
                  Mark Complete
                </button>
              </li>
            ))}
      </ul>
    </div>
  );
}

export default Completed;
