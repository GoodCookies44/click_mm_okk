chrome.runtime.onInstalled.addListener(() => {
  // == Определяем, какой браузер используется == //
  const userAgent = navigator.userAgent.toLowerCase();

  // Если это Google Chrome, открываем как side panel
  if (userAgent.includes("chrome") || userAgent.includes("edg")) {
    chrome.sidePanel.setPanelBehavior({openPanelOnActionClick: true});
  } else {
    // Для других браузеров, таких как Opera или Yandex Browser, открываем как вкладку
    chrome.action.onClicked.addListener(() => {
      chrome.tabs.create({
        url: chrome.runtime.getURL("index.html"), // Страница для вкладки
      });
    });
  }
});

let isContentScriptReady = {};

// == Обработчик сообщений от контентного скрипта == //
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "contentScriptReady") {
    if (sender.tab && sender.tab.id) {
      isContentScriptReady[sender.tab.id] = true;
    } else {
      console.error("sender.tab не определён или не содержит id");
    }
  } else if (message.type === "openLink") {
    handleSelectedText(message.selectedText);
  } else if (message.type === "openInvoice") {
    handleSelectedText(message.selectedText);
  } else if (message.type === "openGrafana") {
    handleSelectedText(message.selectedText);
  }
});

let contextMenuCreated = false;

// == Создаем контекстное меню при установке расширения == //
chrome.runtime.onInstalled.addListener(function () {
  if (!contextMenuCreated) {
    chrome.contextMenus.create({
      id: "toggleCase",
      title: "Первое слово с заглавной буквы (Alt+Z)",
      contexts: ["selection"],
    });

    chrome.contextMenus.create({
      id: "capitalizeWords",
      title: "Первая буква каждого слова заглавная (Alt+X)",
      contexts: ["selection"],
    });

    chrome.contextMenus.create({
      id: "lowerCase",
      title: "Все слова строчными (Alt+C)",
      contexts: ["selection"],
    });

    chrome.contextMenus.create({
      id: "addQuotes",
      title: "Добавить кавычки (Alt+2)",
      contexts: ["selection"],
    });

    chrome.contextMenus.create({
      id: "openLink",
      title: "Открыть ШК или ID в админке",
      contexts: ["selection"],
    });

    chrome.contextMenus.create({
      id: "openInvoice",
      title: "Открыть накладную в админке",
      contexts: ["selection"],
    });

    chrome.contextMenus.create({
      id: "openGrafana",
      title: "Открыть ШК в Grafana",
      contexts: ["selection"],
    });

    contextMenuCreated = true;
  }
});

// == Добавляем обработчик горячих клавиш == //
chrome.commands.onCommand.addListener(function (command) {
  chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
    switch (command) {
      case "01toggleCaseCommand":
        chrome.tabs.sendMessage(tabs[0].id, {action: "toggleCase"});
        break;
      case "02capitalizeWordsCommand":
        chrome.tabs.sendMessage(tabs[0].id, {action: "capitalizeWords"});
        break;
      case "03lowerCaseCommand":
        chrome.tabs.sendMessage(tabs[0].id, {action: "lowerCase"});
        break;
      case "04addQuotesCommand":
        chrome.tabs.sendMessage(tabs[0].id, {action: "addQuotes"});
        break;
      case "05createListCommand":
        chrome.tabs.sendMessage(tabs[0].id, {action: "createList"});
        break;
      case "05openLinkCommand":
        chrome.tabs.sendMessage(tabs[0].id, {action: "getSelectedText", linkType: "product"});
        break;
      case "06openInvoiceCommand":
        chrome.tabs.sendMessage(tabs[0].id, {action: "getSelectedText", linkType: "invoice"});
        break;
      case "07openGrafanaCommand":
        chrome.tabs.sendMessage(tabs[0].id, {action: "getSelectedText", linkType: "Grafana"});
        break;
      default:
        break;
    }
  });
});

// == Обработчик клика по пунктам контекстного меню == //
chrome.contextMenus.onClicked.addListener(function (info, tab) {
  const selectedText = info.selectionText;
  switch (info.menuItemId) {
    case "toggleCase":
      sendMessageToTab({action: "toggleCase"});
      break;
    case "lowerCase":
      sendMessageToTab({action: "lowerCase"});
      break;
    case "capitalizeWords":
      sendMessageToTab({action: "capitalizeWords"});
      break;
    case "addQuotes":
      sendMessageToTab({action: "addQuotes"});
      break;
    case "openLink":
      sendMessageToTab({action: "getSelectedText", linkType: "product"});
      break;
    case "openInvoice":
      sendMessageToTab({action: "getSelectedText", linkType: "invoice"});
      break;
    case "openGrafana":
      sendMessageToTab({action: "getSelectedText", linkType: "Grafana"});
      break;
    default:
      break;
  }
});

// == Обработка выделенного текста и открытие ссылок == //
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "sendSelectedText") {
    let selectedText = message.text.trim();
    if (!isNaN(selectedText) && selectedText !== "") {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const activeTab = tabs[0];
        const tabIndex = activeTab.index; // Получаем индекс активной вкладки

        const url = constructUrl(selectedText, message.linkType);

        // Создаем новую вкладку слева от активной
        chrome.tabs.create({
          url: url,
          index: tabIndex,
          active: false,
        });
      });
    }
  }
});

function constructUrl(selectedText, linkType) {
  let url = "";
  switch (linkType) {
    case "product":
      url =
        selectedText.length < 10
          ? `https://admin.market.corp/kazanexpress/product/${selectedText}/change/`
          : `https://admin.market.corp/kazanexpress/product/?search_field=sku__barcode&search_value=${selectedText}`;
      break;
    case "invoice":
      //Если длина больше 7, то берем подстроку, иначе берем полный текст
      const invoiceId = selectedText.length > 7 ? selectedText.slice(5, -1) : selectedText;
      url = `https://admin.market.corp/kazanexpress/invoice/${invoiceId}/change/`;
      break;
    case "Grafana":
      //Вынесли общую часть ссылки
      const grafanaBaseUrl = `https://grafana.infra.cluster.kznexpess.com/d/AidbrXgnz/identifikatory?orgId=1&var-identifier=&var-inn=`;
      url =
        selectedText.length < 10
          ? `${grafanaBaseUrl}&var-barcode=&var-product=${selectedText}&var-invoice_id=&var-seller_id=&var-order=&from=now-2y&to=now`
          : `${grafanaBaseUrl}&var-barcode=${selectedText}&var-product=&var-invoice_id=&var-seller_id=&var-order=&from=now-2y&to=now`;
      break;
    default:
      console.error(`Неизвестный тип ссылки: ${linkType}`);
      break;
  }
  return url;
}

// == Функция для отправки сообщения контентному скрипту текущей вкладки == //
function sendMessageToTab(message) {
  chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, message);
  });
}

// == Google Sheet API == //
const CLIENT_ID = "899506669224-e3ee96lkktlocp3pbp0pi5mr7t6gg8t6.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

// Функция для создания URL авторизации
function createAuthUrl() {
  const redirectUri = chrome.identity.getRedirectURL();
  const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=token&scope=${encodeURIComponent(SCOPES)}&include_granted_scopes=true`;
  return authUrl;
}

// == Получение токена == //
async function getToken() {
  return new Promise((resolve, reject) => {
    // Проверяем, есть ли токен в chrome.storage
    chrome.storage.local.get(["accessToken", "tokenExpiry"], async (result) => {
      const now = new Date().getTime();

      // Если токен существует и еще не истек
      if (result.accessToken && result.tokenExpiry > now) {
        resolve(result.accessToken);
      } else {
        const authUrl = createAuthUrl();
        chrome.identity.launchWebAuthFlow(
          {url: authUrl, interactive: true},
          async (redirectUrl) => {
            if (chrome.runtime.lastError || !redirectUrl) {
              reject(new Error(chrome.runtime.lastError.message));
              return;
            }

            const params = new URLSearchParams(new URL(redirectUrl).hash.substring(1));
            const accessToken = params.get("access_token");
            const expiresIn = parseInt(params.get("expires_in"), 10);
            const tokenExpiry = now + expiresIn * 1000; // Вычисляем время истечения токена

            // Сохраняем токен и его время истечения в chrome.storage
            chrome.storage.local.set({accessToken, tokenExpiry});

            resolve(accessToken);
          }
        );
      }
    });
  });
}

// == Получение данных из Google Sheets == //
async function fetchGoogleSheetsData(spreadsheetId, sheetName) {
  try {
    const token = await getToken();
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Ошибка при получении данных: ${response.status} ${errorDetails}`);
    }

    const data = await response.json();
    return data.values ? data.values.slice(1) : []; // Удаляем первую строку (заголовки)
  } catch (error) {
    console.error("Ошибка в fetchGoogleSheetsData:", error);
    throw error; // Пробрасываем ошибку дальше
  }
}

// == Функция для преобразования индекса в букву столбца == //
function getColumnLetter(columnIndex) {
  let letter = "";
  while (columnIndex >= 0) {
    letter = String.fromCharCode((columnIndex % 26) + 65) + letter;
    columnIndex = Math.floor(columnIndex / 26) - 1;
  }
  return letter;
}

// == Функция отправки данных в Google Sheets == //
async function updateGoogleSheet(spreadsheetId, sheetName, rowIndex, columnIndex, newValue) {
  try {
    const token = await getToken();
    const columnLetter = getColumnLetter(columnIndex);
    const range = `${sheetName}!${columnLetter}${rowIndex}`;
    const body = {
      values: [[newValue]], // Значение для обновления
    };

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Ошибка при обновлении данных: ${response.status} ${errorDetails}`);
    }
  } catch (error) {
    console.error("Ошибка в updateGoogleSheet:", error);
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateGoogleSheet") {
    const {spreadsheetId, sheetName, rowIndex, columnIndex, newValue} = request.data;
    updateGoogleSheet(spreadsheetId, sheetName, rowIndex, columnIndex, newValue)
      .then(() => sendResponse({success: true}))
      .catch((error) => sendResponse({success: false, error: error.message}));
    return true; // Позволяет асинхронный ответ
  }
});

// Обработка сообщений от контентного скрипта
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchGoogleSheetsData") {
    fetchGoogleSheetsData(request.spreadsheetId, request.sheetName)
      .then((data) => {
        sendResponse({success: true, data: data});
      })
      .catch((error) => {
        console.error("Ошибка:", error);
        sendResponse({success: false, error: error.message});
      });
    return true; // Возвращаем true, чтобы обработать асинхронный ответ
  }

  if (request.action === "getSpreadsheetSheets") {
    getSpreadsheetSheets(request.spreadsheetId)
      .then((sheets) => {
        sendResponse({success: true, sheets: sheets});
      })
      .catch((error) => {
        console.error("Ошибка:", error);
        sendResponse({success: false, error: error.message});
      });
    return true; // Возвращаем true для асинхронного ответа
  }
});

// // == Получение данных из карточки и переход к следующей == //
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.type === "processLinks") {
//     const {spreadsheetId, sheetName, startRow} = message.data;
//     processLinks(spreadsheetId, sheetName, startRow);
//   }
// });

// // Массив для хранения обработанных ссылок
// const processedLinks = new Set(); // Используем Set, чтобы уникальные ссылки не повторялись

// // Функция для обработки ссылок по одной
// const processLinks = async (spreadsheetId, sheetName, startRow) => {
//   try {
//     let rowIndex = startRow;

//     // Читаем ссылки из столбца V (столбец 22)
//     const links = await getLinksFromGoogleSheet(spreadsheetId, sheetName, rowIndex);

//     // Открываем первую ссылку
//     openLinkInTab(links, spreadsheetId, sheetName, rowIndex);
//   } catch (error) {
//     console.error("Ошибка при обработке ссылок:", error);
//   }
// };

// // Открытие первой ссылки и обработка данных
// const openLinkInTab = (links, spreadsheetId, sheetName, rowIndex) => {
//   if (links.length === 0) {
//     console.log("Нет ссылок для обработки");
//     return;
//   }

//   const link = links[0]; // Берем первую ссылку

//   chrome.tabs.create({url: link, active: true}, (tab) => {
//     let timeoutId; // Переменная для отслеживания времени загрузки

//     const clearListenersAndTimeout = () => {
//       clearTimeout(timeoutId); // Очистка таймера
//       chrome.tabs.onUpdated.removeListener(onTabUpdate); // Удаление слушателя обновления вкладки
//     };

//     const onTabUpdate = (tabId, info) => {
//       if (tabId === tab.id && info.status === "complete") {
//         clearListenersAndTimeout(); // Очистить таймер и слушатель, так как страница загрузилась

//         // Страница загружена, извлекаем данные
//         chrome.tabs.sendMessage(tab.id, {action: "getCardData"}, (response) => {
//           if (response && response.data) {
//             const {brand, sizeAndColorData, composition} = response.data;

//             // Получаем SKU из таблицы в столбце L (столбец 12)
//             getSkuFromGoogleSheet(spreadsheetId, sheetName, rowIndex)
//               .then((skuFromSheet) => {
//                 let combinedData = "";

//                 // Формируем строку с данными SKU и размера, если SKU из карточки совпадает с SKU в таблице
//                 sizeAndColorData.forEach((data) => {
//                   const {sku, size} = data;

//                   // Проверяем, совпадает ли SKU из карточки с SKU из таблицы
//                   if (sku === skuFromSheet) {
//                     combinedData += `${size}`;
//                   }
//                 });

//                 combinedData = combinedData.trim();

//                 // Обновляем бренд в столбце W (22-й столбец)
//                 updateGoogleSheet(spreadsheetId, sheetName, rowIndex, 22, brand);
//                 // Обновляем состав в столбце Y (25-й столбец)
//                 updateGoogleSheet(spreadsheetId, sheetName, rowIndex, 24, composition);
//                 // Записываем данные размер и SKU в столбец X (23-й столбец)
//                 updateGoogleSheet(spreadsheetId, sheetName, rowIndex, 23, combinedData);

//                 console.log("Данные успешно обновлены в Google Sheets");

//                 // Закрываем вкладку после обработки данных
//                 chrome.tabs.remove(tab.id, () => {
//                   // Переходим к следующей ссылке после закрытия вкладки
//                   links.shift(); // Убираем первую ссылку из массива
//                   if (links.length > 0) {
//                     openLinkInTab(links, spreadsheetId, sheetName, rowIndex + 1); // Открываем следующую ссылку
//                   }
//                 });
//               })
//               .catch((error) => {
//                 console.error("Ошибка при получении SKU из таблицы:", error);
//                 chrome.tabs.remove(tab.id);
//               });
//           } else {
//             console.error("Ошибка при получении данных с карточки.");
//             chrome.tabs.remove(tab.id);
//           }
//         });
//       }
//     };

//     // Добавляем слушателя обновления вкладки
//     chrome.tabs.onUpdated.addListener(onTabUpdate);

//     // Устанавливаем таймер на 5 секунд
//     timeoutId = setTimeout(() => {
//       console.log(
//         `Время ожидания загрузки страницы превысило 5 секунд. Перезапускаем вкладку: ${link}`
//       );
//       clearListenersAndTimeout(); // Очистка таймера и слушателя
//       chrome.tabs.remove(tab.id, () => {
//         // Пробуем заново открыть ту же строку
//         openLinkInTab(links, spreadsheetId, sheetName, rowIndex); // Открываем ту же ссылку снова
//       });
//     }, 5000); // 5 секунд
//   });
// };

// // Получаем SKU из таблицы Google (столбец L - 12-й столбец)
// const getSkuFromGoogleSheet = async (spreadsheetId, sheetName, rowIndex) => {
//   const token = await getToken();
//   try {
//     const response = await fetch(
//       `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!L${rowIndex}:L${rowIndex}`,
//       {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
//     const data = await response.json();
//     return data.values ? data.values[0][0] : "";
//   } catch (error) {
//     console.error("Ошибка при получении SKU из таблицы:", error);
//     throw error;
//   }
// };

// // Получаем ссылки из Google Sheets (столбец V)
// const getLinksFromGoogleSheet = async (spreadsheetId, sheetName, startRow) => {
//   try {
//     const response = await fetch(
//       `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!V${startRow}:V`,
//       {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${await getToken()}`,
//         },
//       }
//     );
//     const data = await response.json();
//     return data.values ? data.values.map((row) => row[0]) : [];
//   } catch (error) {
//     console.error("Ошибка при получении ссылок:", error);
//     throw error;
//   }
// };
