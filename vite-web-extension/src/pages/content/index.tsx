import { createRoot } from "react-dom/client";
import "./style.css";
import TranscriptSummaryUI from "./TranscriptSummaryUI"; // Import the custom component

const initializeReactApp = () => {
  const secondarySection = document.querySelector("#secondary");

  if (!secondarySection) {
    throw new Error("Can't find the secondary section element");
  }

  // Create a container for the React app
  const appContainer = document.createElement("div");
  appContainer.id = "__root";
  secondarySection.prepend(appContainer);

  // Initialize React root and render the component
  const root = createRoot(appContainer);
  root.render(<TranscriptSummaryUI />);
};

// Run the function after a delay
setTimeout(initializeReactApp, 1000);
