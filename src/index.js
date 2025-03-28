// Модули
import React from "react";
import {createRoot} from "react-dom/client";
import {MemoryRouter} from "react-router-dom";
import Modal from "react-modal";
// Компоненты
import App from "./App";

// Устанавливаем основной элемент приложения
Modal.setAppElement("#root");

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <MemoryRouter>
      <App />
    </MemoryRouter>
  </React.StrictMode>
);
