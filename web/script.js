document.addEventListener("DOMContentLoaded", function () {
    const loadingScreen = document.getElementById("loading-screen");
    const content = document.getElementById("content");
    const popup = document.getElementById("popup-module");
    const showPopupButton = document.getElementById("show-popup");
    const closePopupButton = document.getElementById("popup-close");
    let canClosePopup = true;

    function togglePopup(show, canClose = true) {
        canClosePopup = canClose;
        if (show) {
            popup.style.display = "flex";
            if (!canClosePopup) {
                closePopupButton.style.display = "none";
            } else {
                closePopupButton.style.display = "block";
            }
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
