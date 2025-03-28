//Модули
import React from "react";
// Компоненты
import Counter from "../../components/Counter/Counter";
import ResetCountersButton from "../../components/ResetCountersButton/ResetCountersButton";

export default function TasksPage() {
  return (
    <section className="counter__section FP">
      <ResetCountersButton
        counterIds={[
          "Reviewed",
          "VSD__Reviewed",
          "CHZ__Reviewed",
          "Verified",
          "VSD__Verified",
          "SDIZ__Verified",
          "Cells",
          "Marriage__SKU",
          "Marriage__Pieces",
          "Marriage__Categories",
          "Bargain",
        ]}
      />
      <div className="counters__container">
        <div className="container__FP">
          Досмотрено поставок
          <Counter id="Reviewed" targetIds={["VSD__Reviewed", "CHZ__Reviewed"]} />
        </div>
        <div className="thematic__container">
          <div className="container__FP">
            ВСД
            <Counter id="VSD__Reviewed" />
          </div>
          <div className="container__FP">
            ЧЗ
            <Counter id="CHZ__Reviewed" />
          </div>
        </div>

        <div className="container__FP">
          Сверено поставок
          <Counter id="Verified" targetIds={["VSD__Verified", "SDIZ__Verified"]} />
        </div>
        <div className="thematic__container">
          <div className="container__FP">
            ВСД
            <Counter id="VSD__Verified" />
          </div>
          <div className="container__FP">
            СДИЗ
            <Counter id="SDIZ__Verified" />
          </div>
        </div>

        <div className="container__FP">
          Ячеек
          <Counter id="Cells" />
        </div>
        <div className="thematic__container">
          <div className="container__FP">
            Брак, SKU
            <Counter id="Marriage__SKU" />
          </div>
          <div className="container__FP">
            Брак, ШТ
            <Counter id="Marriage__Pieces" />
          </div>
        </div>

        <div className="thematic__container">
          <div className="container__FP">
            Брак категории
            <Counter id="Marriage__Categories" />
          </div>
          <div className="container__FP">
            Торг 2
            <Counter id="Bargain" />
          </div>
        </div>
      </div>
    </section>
  );
}
