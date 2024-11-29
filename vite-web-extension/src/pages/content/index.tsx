import { createRoot } from "react-dom/client";
import "./style.css";
import MyButton from "./MyButton"; // Import the custom component

// Create a container for the React app
const div = document.createElement("div");
div.id = "__root";
document.body.appendChild(div);

// Select the container and handle potential errors
const rootContainer = document.querySelector("#__root");
if (!rootContainer) {
  throw new Error("Can't find content root element");
}

// Initialize React root
const root = createRoot(rootContainer);

// Render the imported React component
root.render(<MyButton />);

try {
  console.log("Content script loaded successfully");
} catch (e) {
  console.error(e);
}
