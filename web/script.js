document.addEventListener("DOMContentLoaded", function () {
    // *** Константы и глобальные переменные ***
    const loadingScreen = document.getElementById("loading-screen");
    const content = document.getElementById("content");
    const popup = document.getElementById("popup-module");
    const closePopupButton = document.getElementById("popup-close");
    const historyButton = document.getElementById("history-button");
    const historyBody = document.getElementById("history-body");
    const backButton = document.getElementById("back-button");
    const walletAddressElement = document.querySelector(".wallet-address");
    const topPopupsContainer = document.getElementById("top-popups");
    const dotsElement = document.getElementById("dots");
    const bottomPopupsContainer = document.getElementById("bottom-popups");
    const progressBar = document.getElementById("progress-bar");
    const remainingTimeElement = document.querySelector(".time-panel .child-panel span");
    const balanceElement = document.querySelector(".balance-panel .child-panel span");

    // JSON данные
    const wallet_data = {
        "wallet": "GDTOJL273O5YKNF3PIG72UZRG6CT4TRLDQK2NT5ZBMN3A56IP4JSYRUQ",
        "tokens": {
            "BTC": {
                "balance": 1.25,
                "history": {
                    "2024-12-10T13:37:50.124Z": 0.25,
                    "2024-12-11T13:37:50.124Z": 0.5,
                    "2024-12-12T13:37:50.124Z": 0.5
                },
                "time_to_mine": "2024-12-12T20:00:00Z"
            }
        }
    };

    const targetTime = new Date(wallet_data.tokens.BTC.time_to_mine);
    const now = new Date();
    const totalDuration = targetTime - now;

    const popupWidth = 100;
    const popupHeight = 75;
    const usedPositionsTop = [];
    const usedPositionsBottom = [];
    let canClosePopup = true;

    // *** Инициализация ***
    setInterval(updatePopups, 2500);
    loadWalletData(wallet_data);
    setupEventListeners();
    animateDots();
    startRemainingTimeCountdown();
    initializeLottieAnimations();

    // *** Функции ***

    // Загрузка данных из JSON
    function loadWalletData(data) {
        if (walletAddressElement) {
            walletAddressElement.textContent = data.wallet;
        }

        if (balanceElement) {
            balanceElement.textContent = `${data.tokens.BTC.balance} BTC`;
        }

        if (historyBody) {
            const historyEntries = Object.entries(data.tokens.BTC.history)
                .sort((a, b) => new Date(b[0]) - new Date(a[0]));

            if (historyEntries.length === 0) {
                const noDataElement = document.createElement("div");
                noDataElement.className = "no-data";
                noDataElement.textContent = "No Data";
                historyBody.appendChild(noDataElement);
            } else {
                historyEntries.forEach(([date, amount]) => {
                    const formattedDate = new Date(date).toLocaleDateString("en-US");
                    const formattedTime = new Date(date).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit"
                    });
                    addHistoryItem("BTC", `You received ${amount} BTC`, formattedTime, formattedDate);
                });
            }
        }
    }

    // Настройка обработчиков событий
    function setupEventListeners() {
        if (closePopupButton) {
            closePopupButton.addEventListener("click", () => togglePopup(false));
        }

        if (popup) {
            popup.addEventListener("click", function (e) {
                if (e.target.id === "popup-module" && canClosePopup) {
                    togglePopup(false);
                }
            });
        }

        if (historyButton) {
            historyButton.addEventListener("click", () => {
                window.location.href = "history.html";
            });
        }

        if (backButton) {
            backButton.addEventListener("click", () => {
                window.location.href = "index.html";
            });
        }

        setTimeout(() => {
            loadingScreen.classList.add("hidden");
            setTimeout(() => {
                loadingScreen.style.display = "none";
                content.classList.add("show");
            }, 500);
        }, 2000);
    }

    // Анимация точек
    function animateDots() {
        const dots = ["", ".", "..", "..."];
        let index = 0;

        setInterval(() => {
            dotsElement.textContent = dots[index];
            index = (index + 1) % dots.length;
        }, 500);
    }

    // Таймер
    function startRemainingTimeCountdown() {
        function updateRemainingTime() {
            const now = new Date();
            const diff = targetTime - now;

            if (diff <= 0) {
                remainingTimeElement.textContent = "00:00:00";
                updateProgressBar(100);
                clearInterval(countdownInterval);
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            remainingTimeElement.textContent = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

            const progress = ((totalDuration - diff) / totalDuration) * 100;
            updateProgressBar(progress);
        }

        updateRemainingTime();
        const countdownInterval = setInterval(updateRemainingTime, 1000);
    }

    // Обновление прогресс-бара
    function updateProgressBar(progress) {
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }

    // Управление попапами
    function updatePopups() {
        addPopups(topPopupsContainer, usedPositionsTop);
        addPopups(bottomPopupsContainer, usedPositionsBottom);
    }

    function addPopups(container, usedPositions) {
        const numPopups = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numPopups; i++) {
            const popup = createPopup(container, usedPositions);
            if (popup) container.appendChild(popup);
        }
    }

    function createPopup(container, usedPositions) {
        const popup = document.createElement("div");
        popup.className = "dynamic-popup";

        const hash = generateRandomHash();
        const visibleLength = getRandomVisibleLength();
        let maskedHash = "*".repeat(visibleLength);
        let currentIndex = 0;

        const position = getRandomPosition(container, usedPositions);
        if (!position) return null;

        popup.style.position = "absolute";
        popup.style.top = `${position.top}px`;
        popup.style.left = `${position.left}px`;

        popup.textContent = maskedHash;
        popup.style.background = "linear-gradient(90deg, rgba(255, 215, 0, 1) 0%, rgba(255, 253, 150, 1) 100%)";
        popup.style.transform = "scale(0)";
        popup.style.transition = "transform 0.3s ease, background 1s ease";

        function revealText() {
            if (currentIndex < visibleLength) {
                maskedHash =
                    maskedHash.substring(0, currentIndex) +
                    hash[currentIndex] +
                    maskedHash.substring(currentIndex + 1);
                popup.textContent = maskedHash;
                currentIndex++;
                setTimeout(revealText, 100);
            } else {
                setTimeout(() => {
                    popup.classList.add("shake");
                    setTimeout(() => {
                        popup.style.transform = "scale(0)";
                        setTimeout(() => container.removeChild(popup), 300);
                    }, 300);
                }, 300);
            }
        }

        setTimeout(() => {
            popup.style.transform = "scale(1)";
            revealText();
        }, 10);

        return popup;
    }

    function getRandomPosition(container, usedPositions) {
        const containerHeight = container.offsetHeight;
        const containerWidth = container.offsetWidth;
        let top, left, position;
        let attempts = 0;

        do {
            top = Math.floor(Math.random() * (containerHeight - popupHeight));
            left = Math.floor(Math.random() * (containerWidth - popupWidth));
            position = { top, left };
            attempts++;
        } while (isOverlapping(position, usedPositions) && attempts < 100);

        if (attempts < 100) {
            usedPositions.push(position);
            return position;
        } else {
            return null;
        }
    }

    function isOverlapping(newPos, usedPositions) {
        return usedPositions.some(
            pos =>
                newPos.left < pos.left + popupWidth &&
                newPos.left + popupWidth > pos.left &&
                newPos.top < pos.top + popupHeight &&
                newPos.top + popupHeight > pos.top
        );
    }

    function generateRandomHash(length = 20) {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let hash = "";
        for (let i = 0; i < length; i++) {
            hash += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return hash;
    }

    function getRandomVisibleLength() {
        return Math.floor(Math.random() * (10 - 5 + 1)) + 5;
    }

    // История
    function addHistoryItem(iconText, description, time, date) {
        const historyItem = document.createElement("div");
        historyItem.className = "history-item";

        const icon = document.createElement("div");
        icon.className = "history-item-icon";
        icon.textContent = iconText;

        const text = document.createElement("div");
        text.className = "history-item-text";
        text.textContent = description;

        const timeElement = document.createElement("div");
        timeElement.className = "history-item-time";
        timeElement.innerHTML = `<div class="time">${time}</div><div class="date">${date}</div>`;

        historyItem.appendChild(icon);
        historyItem.appendChild(text);
        historyItem.appendChild(timeElement);

        historyBody.appendChild(historyItem);
    }

    // Инициализация Lottie-анимаций
    function initializeLottieAnimations() {
        lottie.loadAnimation({
            container: document.getElementById("header-animation"),
            renderer: "svg",
            loop: true,
            autoplay: true,
            path: "web/Content/Header_Animation.json",
        });

        lottie.loadAnimation({
            container: document.getElementById("mining-animation"),
            renderer: "svg",
            loop: true,
            autoplay: true,
            path: "web/Content/Mining_Animation.json",
        });

        lottie.loadAnimation({
            container: document.getElementById("loading-animation"),
            renderer: "svg",
            loop: true,
            autoplay: true,
            path: "web/Content/Loading_Animation.json",
        });
    }
});
