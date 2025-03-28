// Модули
import React, {useContext, useEffect, useState} from "react";
// Компоненты
import {CounterContext} from "../../components/Context/CounterContext";
//Стили
import "./ReportPage.css";

export default function ReportPage() {
  const {counters} = useContext(CounterContext);
  const [name, setName] = useState(localStorage.getItem("username") || "");
  const [isNameEntered, setIsNameEntered] = useState(false);
  const [report, setReport] = useState("");
  const currentDate = new Date().toLocaleDateString();

  useEffect(() => {
    setIsNameEntered(name.trim() !== "");
  }, [name]);

  useEffect(() => {
    localStorage.setItem("username", name);
  }, [name]);

  const handleNameChange = (event) => {
    const enteredName = event.target.value;
    setName(enteredName);
    setIsNameEntered(enteredName.trim() !== ""); // Устанавливаем флаг isNameEntered, если введено имя
  };

  const generateReport = () => {
    if (!name.trim()) {
      return;
    }

    let reportText = `/#отчет_ТОВ_${name} ${currentDate}\n`;

    const groups = {
      tasks_group: [
        {text: "**1. Кол-во досмотренных поставок (Общее):**", id: "Reviewed"},
        {text: "**1.2. ВСД:**", id: "VSD__Reviewed"},
        {text: "**1.3. ЧЗ:**", id: "CHZ__Reviewed"},
        {text: "**2. Кол-во сведённых поставок (Общее):**", id: "Verified"},
        {text: "**2.2. ВСД:**", id: "VSD__Reviewed"},
        {text: "**2.3. СДИЗ:**", id: "SDIZ__Verified"},
        {text: "**3. Кол-во проверенных ячеек:**", id: "Cells"},
        {text: "**4. Кол-во перемещений в брак, SKU:**", id: "Marriage__SKU"},
        {text: "**5. Кол-во перемещений в брак, кол-во:**", id: "Marriage__Pieces"},
        {text: "**6. Проверка брак категории:**", id: "Marriage__Categories"},
        {text: "**5. Кол-во сформированных актов ТОРГ2:**", id: "Bargain"},
      ],
    };

    // Проходимся по каждой группе
    Object.keys(groups).forEach((groupKey) => {
      const group = groups[groupKey];

      group.forEach((item) => {
        const counter = counters.find((counter) => counter.id === item.id);
        if (counter) {
          reportText += `${item.text} ${counter.value}\n`;
        } else if (!item.id) {
          reportText += `${item.text}\n`;
        }
      });
    });

    setReport(reportText);
    copyReport(reportText);
  };

  const copyReport = (reportText) => {
    if (reportText) {
      navigator.clipboard.writeText(reportText).catch(() => {});
    }
  };

  return (
    <section className="report__section">
      <div className="label__container">
        <label className="report__label">
          Имя:
          <input
            className="report__input"
            type="text"
            id="username"
            name="username"
            placeholder="Введите Ваше имя"
            value={name}
            onChange={handleNameChange}
          />
        </label>
      </div>

      <div className="button__container">
        <button className="report__button" onClick={generateReport} disabled={!isNameEntered}>
          Создать
        </button>
        <button className="report__button" onClick={() => copyReport(report)} disabled={!report}>
          Копировать
        </button>
      </div>

      <pre className="report__text">{report}</pre>
    </section>
  );
}
