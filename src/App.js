// Модули
import React from "react";
import {Outlet, Route, Routes} from "react-router-dom";
// Компоненты
import Header from "./components/Header/Header.js";
import TasksPage from "./pages/TasksPage/TasksPage.js";
import ReportPage from "./pages/ReportPage/ReportPage.js";
import {CounterProvider} from "./components/Context/CounterContext.js";
// Стили
import "./App.css";

export default function App() {
  return (
    <Routes>
      <Route exact path={"/"} element={<Layout />}>
        <Route index element={<TasksPage />} />
        <Route path={"/Report"} element={<ReportPage />} />
      </Route>
    </Routes>
  );
}

function Layout() {
  return (
    <div className="App">
      <CounterProvider>
        <Header />
        <main>
          <Outlet />
        </main>
      </CounterProvider>
    </div>
  );
}
