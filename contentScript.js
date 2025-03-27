// Отправка сообщения о готовности контентного скрипта
chrome.runtime.sendMessage({type: "contentScriptReady"});

// == Функция для изменения контента в зависимости от действия == //
function changeContent(action) {
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    let selectedText = selection.toString();
    if (selectedText.trim() !== "") {
      switch (action) {
        case "createList":
          const listFragment = convertToBulletList(selectedText);
          document.execCommand("insertHTML", false, listFragment);
          break;
        default:
          changeCase(action, selectedText, range);
          break;
      }
    }
  }
}

//== Функция для изменения регистра слов в выделенном тексте == //
function changeCase(type, selectedText, range) {
  switch (type) {
    case "toggleCase":
      selectedText = toggleCase(selectedText);
      break;
    case "lowerCase":
      selectedText = selectedText.toLowerCase();
      break;
    case "capitalizeWords":
      selectedText = capitalizeWords(selectedText);
      break;
    case "addQuotes":
      selectedText = addQuotes(selectedText);
      break;
    default:
      break;
  }

  document.execCommand("insertText", false, selectedText);
}

// == Функция для изменения регистра первой буквы в 1 слове == //
function toggleCase(text) {
  const words = text.split(" ");
  const toggledWords = words.map((word, index) => {
    if (index === 0) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    } else {
      return word.toLowerCase();
    }
  });
  return toggledWords.join(" ");
}

// == Функция для приведения первой буквы каждого слова к заглавной == //
function capitalizeWords(text) {
  const words = text.split(" ");
  const capitalizedWords = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  return capitalizedWords.join(" ");
}

// == Функция для добавления кавычек в начале и конце выделенного текста == //
function addQuotes(text) {
  text = text.trim();

  // Убираем кавычки если они есть
  if (text.startsWith("«") && text.endsWith("»")) {
    // Если текст в кавычках « », заменяем их на обычные кавычки и меняем регистр
    text = text.slice(1, -1).trim();
    text = toggleCase(text);
    text = `"${text}"`;
  } else if (text.startsWith('"') && text.endsWith('"')) {
    // Если текст в обычных кавычках, просто убираем их
    text = text.slice(1, -1).trim();
  } else {
    // Если текст без кавычек, добавляем обычные кавычки и меняем регистр
    text = toggleCase(text);
    text = `"${text}"`;
  }

  return text;
}

// Обработчик сообщений от фонового скрипта
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  changeContent(request.action);
});

// Обработчик сообщений от фонового скрипта
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "toggleCase") {
    changeContent("toggle");
  } else if (request.action === "lowerCase") {
    changeContent("lower");
  } else if (request.action === "capitalizeWords") {
    changeContent("capitalize");
  } else if (request.action === "addQuotes") {
    changeContent("addQuotes");
  }
});

// == Функция для получения выделенного текста == //
function getSelectedText() {
  const activeElement = document.activeElement;
  const isGoogleSheets =
    window.location.hostname === "docs.google.com" &&
    window.location.pathname.includes("/spreadsheets");

  // Проверяем, является ли активный элемент частью Google Таблиц
  if (isGoogleSheets) {
    const selectedCell = document.querySelector(".cell-input");
    if (selectedCell) {
      const selectedText = selectedCell.innerText || selectedCell.textContent;
      return selectedText.split(/[, ]/)[0].trim(); // Используем только первую часть текста до запятой или пробела
    }
  }

  // В остальных случаях пытаемся получить выделенный текст
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const selectedText = selection.toString().trim();
    if (selectedText) {
      // Разделяем текст по запятой или пробелу и возвращаем первую часть
      const firstPart = selectedText.split(/[, ]/)[0];
      return firstPart.trim();
    }
  }
  return "";
}

// == Функция коприрования выделенного текста в буфер обмена == //
function copyToClipboard(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

// == Обработчик сообщений от фонового скрипта копирования == //
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getSelectedText") {
    const selectedText = getSelectedText();
    if (selectedText) {
      if (selectedText.length > 10) {
        copyToClipboard(selectedText);
      }
      chrome.runtime.sendMessage({
        action: "sendSelectedText",
        text: selectedText,
        linkType: message.linkType,
      });
    }
  }
});

// == Функция для создания элемента, который будет содержать QR-код == //
function createTooltipElement() {
  const tooltip = document.createElement("div");
  tooltip.style.position = "absolute";
  tooltip.style.zIndex = "9999";
  tooltip.style.display = "flex";
  tooltip.style.justifyContent = "center";
  tooltip.style.alignItems = "center";
  tooltip.style.width = "150px"; // Размер окна для QR-кода
  tooltip.style.height = "150px";
  return tooltip;
}

// == Функция для генерации DataMatrix QR-кода == //
function generateDataMatrix(text) {
  const baseUrl = "https://barcode.tec-it.com/barcode.ashx?";
  const params = new URLSearchParams({
    data: text,
    code: "DataMatrix",
    "translate-esc": "on",
    dmsize: "Default",
  });

  return `${baseUrl}${params}`;
}

// Создаем одно окно для отображения QR-кода
const tooltip = createTooltipElement();

// == Функция для обновления содержимого окна с QR-кодом == //
async function updateTooltipContent(tooltip, text, event) {
  const qrUrl = generateDataMatrix(text); // Генерируем URL для QR-кода

  const img = document.createElement("img");
  img.src = qrUrl;
  img.alt = "QR Code";
  img.style.width = "100%";
  img.style.height = "100%";
  img.style.border = "20px solid white";

  tooltip.style.left = `${event.pageX + 30}px`;
  tooltip.style.top = `${event.pageY - 125}px`;

  tooltip.innerHTML = ""; // Очищаем предыдущий контент
  tooltip.appendChild(img);

  if (!tooltip.parentNode) {
    document.body.appendChild(tooltip);
  }
}

// == Обработчик для отображения QR-кода при выделении текста и нажатии Alt + Shift == //
document.addEventListener("mouseup", function (event) {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText && event.altKey && event.ctrlKey) {
    updateTooltipContent(tooltip, selectedText, event);
  } else {
    if (tooltip.parentNode) {
      tooltip.parentNode.removeChild(tooltip); // Удаляем окно, если текст не выделен или Alt + Shift не зажаты
    }
  }
});

// == Обработчик для закрытия QR-кода при отпускании Alt или Shift == //
document.addEventListener("keydown", function (event) {
  if ((!event.altKey || !event.ctrlKey) && tooltip.parentNode) {
    tooltip.parentNode.removeChild(tooltip); // Убираем окно, если Alt или Shift отпущен
  }
});

// // == Получение данных из карточки == //
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.action === "getCardData") {
//     // Извлекаем данные с карточки
//     const cardData = getCardDetails();

//     // Отправляем полученные данные обратно в background.js
//     sendResponse({data: cardData});
//   }
// });

// // Функция для извлечения данных с карточки
// const getCardDetails = () => {
//   // Извлекаем бренд
//   const brandElement = document.querySelector(".form-row.field-brand_value .readonly");
//   const brand = brandElement ? brandElement.textContent.trim() : "Не указан";

//   // Извлекаем данные (ШК, размер, цвет) из таблицы
//   const rows = document.querySelectorAll("tbody tr"); // Все строки таблицы

//   const sizeAndColorData = [];

//   rows.forEach((row, index) => {
//     // Извлекаем ШК (второй столбец)
//     const sku = row.cells[1]?.textContent.trim(); // Ищем ШК во втором столбце

//     // Извлекаем размер (шестой столбец), ищем текст "Размер:"
//     const sizeCell = row.cells[5];
//     const sizeText = sizeCell ? sizeCell.textContent.trim() : "";

//     const sizeMatch = sizeText.match(/\s*([0-9A-Za-z\-]+)/);
//     if (sku && sizeMatch) {
//       const size = sizeMatch[1]; // Извлекаем размер

//       // Добавляем данные в массив
//       sizeAndColorData.push({
//         sku: sku,
//         size: size,
//       });
//     }
//   });

//   // Извлекаем состав
//   const compositionElement = document.querySelector(".form-row.field-ingredients .readonly");
//   const composition = compositionElement ? compositionElement.textContent.trim() : "Не указан";

//   return {
//     brand,
//     sizeAndColorData,
//     composition,
//   };
// };
