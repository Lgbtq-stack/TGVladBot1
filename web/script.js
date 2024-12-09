document.addEventListener("DOMContentLoaded", function () {
    const loadingScreen = document.getElementById("loading-screen");
    const content = document.getElementById("content");
    const popup = document.getElementById("popup-module");
    const showPopupButton = document.getElementById("show-popup");
    const closePopupButton = document.getElementById("popup-close");
    const walletAddressElement = document.querySelector(".wallet-address");
    const rawAddress = walletAddressElement.textContent.trim();
    const formattedAddress = rawAddress.slice(0, 15) + " ..... " + rawAddress.slice(-15);
    const topPopupsContainer = document.getElementById("top-popups");
    const bottomPopupsContainer = document.getElementById("bottom-popups");

    const popupWidth = 100; // Ширина попапа
    const popupHeight = 75; // Высота попапа

    const usedPositionsTop = [];
    const usedPositionsBottom = [];

    walletAddressElement.textContent = formattedAddress;

    let canClosePopup = true;

    function togglePopup(show, canClose = true) {
        canClosePopup = canClose;
        if (show) {
            popup.style.display = "flex";
            closePopupButton.style.display = canClose ? "block" : "none";
        } else {
            if (canClosePopup) {
                popup.style.display = "none";
            }
        }
    }

    setTimeout(() => {
        loadingScreen.classList.add("hidden");
        setTimeout(() => {
            loadingScreen.style.display = "none";
            content.classList.add("show");
        }, 500);
    }, 2000);

    showPopupButton.addEventListener("click", () => togglePopup(true));
    closePopupButton.addEventListener("click", () => togglePopup(false));

    popup.addEventListener("click", function (e) {
        if (e.target.id === "popup-module" && canClosePopup) {
            togglePopup(false);
        }
    });

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

    function isOverlapping(newPos, usedPositions) {
        for (const pos of usedPositions) {
            const overlapping =
                newPos.left < pos.left + popupWidth &&
                newPos.left + popupWidth > pos.left &&
                newPos.top < pos.top + popupHeight &&
                newPos.top + popupHeight > pos.top;
            if (overlapping) return true;
        }
        return false;
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
        const interval = setInterval(() => {
            if (currentIndex < visibleLength) {
                maskedHash =
                    maskedHash.substring(0, currentIndex) +
                    hash[currentIndex] +
                    maskedHash.substring(currentIndex + 1);
                popup.textContent = maskedHash;
                currentIndex++;
            } else {
                clearInterval(interval);
            }
        }, 250);
        popup.textContent = maskedHash;
        return popup;
    }

    function addPopups(container, usedPositions) {
        const numPopups = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numPopups; i++) {
            setTimeout(() => {
                const popup = createPopup(container, usedPositions);
                if (popup) {
                    container.appendChild(popup);
                    requestAnimationFrame(() => {
                        popup.classList.add("show"); // Анимация увеличения
                    });
                    setTimeout(() => {
                        popup.classList.remove("show");
                        popup.classList.add("hide");
                        setTimeout(() => {
                            container.removeChild(popup);
                            const index = usedPositions.findIndex(
                                pos =>
                                    parseInt(popup.style.top) === pos.top &&
                                    parseInt(popup.style.left) === pos.left
                            );
                            if (index !== -1) usedPositions.splice(index, 1);
                        }, 300);
                    }, 5000);
                }
            }, Math.random() * 3000);
        }
    }


    function updatePopups() {
        addPopups(topPopupsContainer, usedPositionsTop);
        addPopups(bottomPopupsContainer, usedPositionsBottom);
    }

    setInterval(updatePopups, 5000);
    updatePopups();

    lottie.loadAnimation({
        container: document.getElementById('mining-animation'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'web/Content/Mining_Animation.json',
    });

    lottie.loadAnimation({
        container: document.getElementById('loading-animation'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'web/Content/Loading_Animation.json',
    });
});
