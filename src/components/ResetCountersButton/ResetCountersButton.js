// Модули
import React, {useContext, useState} from "react";
import PropTypes from "prop-types";
// Компоненты
import {CounterContext} from "../Context/CounterContext";
// Стили
import "./ResetCountersButton.css";

export default function ResetCountersButton({counterIds}) {
  const {resetCounters} = useContext(CounterContext);
  const [isRotated, setIsRotated] = useState(false);

  const handleResetCounters = () => {
    // Передаем список идентификаторов счетчиков, которые нужно сбросить
    resetCounters(counterIds);
    // Запускаем анимацию поворота
    setIsRotated(true);

    // Убираем класс с анимацией после завершения анимации
    setTimeout(() => setIsRotated(false), 1000);
  };

  return (
    <div className="reset__button_container">
      <button onClick={handleResetCounters} className="counter__button">
        {/* Иконка Сброс */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className={`reset__button ${isRotated ? "rotate" : ""}`}
        >
          <path
            d="M17.7507 4.04225C15.9264 2.72388 13.7044 2.07237 11.457 2.19685C9.2096 2.32133 7.0732 3.21424 5.40561 4.72603C4.95924 5.13069 4.26934 5.09689 3.86468 4.65052C3.46001 4.20415 3.49382 3.51426 3.94019 3.10959C5.97835 1.26185 8.58951 0.170517 11.3364 0.018374C14.0832 -0.133769 16.7989 0.662515 19.0287 2.27387C21.2584 3.88522 22.8668 6.21378 23.5845 8.86957C24.3021 11.5254 24.0855 14.3471 22.9708 16.8622C21.8561 19.3773 19.9111 21.433 17.4615 22.6851C15.0119 23.9372 12.2064 24.3096 9.51502 23.7399C6.82361 23.1702 4.40965 21.693 2.67745 19.5558C0.945255 17.4186 0 14.751 0 12C0 11.3975 0.488417 10.9091 1.09091 10.9091C1.6934 10.9091 2.18182 11.3975 2.18182 12C2.18182 14.2509 2.95521 16.4334 4.37246 18.182C5.78972 19.9307 7.76477 21.1392 9.96684 21.6053C12.1689 22.0715 14.4643 21.7668 16.4685 20.7424C18.4727 19.7179 20.0641 18.036 20.9761 15.9782C21.8881 13.9204 22.0654 11.6117 21.4782 9.43874C20.891 7.26582 19.5751 5.36063 17.7507 4.04225Z"
            fill="#F6F6F6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4.36364 0C4.96613 0 5.45455 0.488417 5.45455 1.09091V4.36364C5.45455 4.96613 4.96613 5.45455 4.36364 5.45455C3.76114 5.45455 3.27273 4.96613 3.27273 4.36364V1.09091C3.27273 0.488417 3.76114 0 4.36364 0Z"
            fill="#F6F6F6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.27273 4.36364C3.27273 3.76114 3.76114 3.27273 4.36364 3.27273H7.63636C8.23886 3.27273 8.72727 3.76114 8.72727 4.36364C8.72727 4.96613 8.23886 5.45455 7.63636 5.45455H4.36364C3.76114 5.45455 3.27273 4.96613 3.27273 4.36364Z"
            fill="#F6F6F6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

ResetCountersButton.propTypes = {
  counterIds: PropTypes.arrayOf(PropTypes.string).isRequired,
};
