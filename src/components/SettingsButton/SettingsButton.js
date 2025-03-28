// Модули
import React, {useContext, useState} from "react";
import Modal from "react-modal";
import PropTypes from "prop-types";
// Компоненты
import ResetCountersButton from "../ResetCountersButton/ResetCountersButton";
import {CounterContext} from "../Context/CounterContext";
// Стили
import "./SettingsButton.css";

export default function SettingsButton({updateTabs, activeLinks}) {
  const {counters} = useContext(CounterContext);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const allCounterIds = counters.map((counter) => counter.id);
  const [isListOpen, setIsListOpen] = useState({
    activeTabs: false,
  });
  const openModal = () => {
    setModalIsOpen(true);
    document.body.classList.add("modal-open");
  };

  const closeModal = () => {
    setModalIsOpen(false);
    document.body.classList.remove("modal-open");
  };

  const toggleActiveTabs = (index) => {
    const updatedTabs = [...activeLinks];
    updatedTabs[index].active = !updatedTabs[index].active;
    updateTabs(updatedTabs);
  };

  const toggleList = (listName) => {
    setIsListOpen({...isListOpen, [listName]: !isListOpen[listName]});
  };

  return (
    <>
      <button className="settings__button" onClick={openModal}>
        {/* Иконка Настройки */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="23"
          height="22"
          viewBox="0 0 23 22"
          fill="none"
        >
          <path
            d="M15 11C15 13.2091 13.2091 15 11 15C8.79087 15 7.00001 13.2091 7.00001 11C7.00001 8.79086 8.79087 7 11 7C13.2091 7 15 8.79086 15 11Z"
            stroke="#F6F6F6"
          />
          <path
            d="M11.752 1H10.248C9.2494 1 8.40705 1.74361 8.28319 2.73452C8.13373 3.93022 6.95989 4.71633 5.79735 4.39928L4.08184 3.93141C3.16207 3.68056 2.19311 4.1138 1.76675 4.96651L1.23326 6.03349C0.806904 6.8862 1.0417 7.92131 1.79423 8.50662L2.97024 9.4213C3.99974 10.222 3.99973 11.778 2.97024 12.5787L1.79423 13.4934C1.04169 14.0787 0.806904 15.1138 1.23326 15.9665L1.76675 17.0335C2.19311 17.8862 3.16207 18.3194 4.08184 18.0686L5.79735 17.6007C6.95989 17.2837 8.13373 18.0698 8.28319 19.2655C8.40705 20.2564 9.2494 21 10.248 21H11.752C12.7506 21 13.593 20.2564 13.7168 19.2655C13.8663 18.0698 15.0401 17.2837 16.2027 17.6007L17.9182 18.0686C18.8379 18.3194 19.8069 17.8862 20.2333 17.0335L20.7668 15.9665C21.1931 15.1138 20.9583 14.0787 20.2058 13.4934L19.1387 12.6634C18.0762 11.837 18.1169 10.2182 19.2196 9.44625L20.4448 8.58864C21.3165 7.97844 21.5578 6.79252 20.9939 5.89018L20.2879 4.7607C19.8202 4.01229 18.9172 3.65895 18.0657 3.89117L16.2027 4.39927C15.0401 4.71633 13.8663 3.93022 13.7168 2.73452C13.593 1.74361 12.7506 1 11.752 1Z"
            stroke="#F6F6F6"
          />
        </svg>
      </button>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Настройки"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <h2>Настройки</h2>
        <div className="paragraph__container inline">
          <h3>Сброс всех счётчиков</h3>
          <ResetCountersButton
            counterIds={allCounterIds}
            textareaIds={["CategoryName_submit", "CategoryName_accepted"]}
          />
        </div>

        <div className="paragraph__container">
          <h3 onClick={() => toggleList("activeTabs")}>
            Активные вкладки
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`arrow-icon ${isListOpen.activeTabs ? "open" : ""}`}
              width="8"
              height="14"
              viewBox="0 0 8 14"
              strokeWidth="2"
              fill="none"
            >
              <path d="M7 1L1 7L7 13" stroke="#F6F6F6" />
            </svg>
          </h3>
          <ul className={`slide-down ${isListOpen.activeTabs ? "open" : ""}`}>
            {activeLinks.map((link, index) => (
              <li key={link.to}>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    className="hidden-checkbox"
                    checked={link.active}
                    onChange={() => toggleActiveTabs(index)}
                  />
                  {link.label}
                  <div className="custom-checkbox__container">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                      <path
                        className="custom-checkbox"
                        d="M1 15V5C1 2.79086 2.79086 1 5 1H15C17.2091 1 19 2.79086 19 5V15C19 17.2091 17.2091 19 15 19H5C2.79086 19 1 17.2091 1 15Z"
                        stroke="#F6F6F6"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      <path
                        className="custom-marker"
                        d="M3 10L9 16L18 4"
                        stroke="#16ff65"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </Modal>
    </>
  );
}

SettingsButton.propTypes = {
  updateTabs: PropTypes.func.isRequired,
  activeLinks: PropTypes.array.isRequired,
};
