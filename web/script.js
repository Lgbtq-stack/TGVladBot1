document.addEventListener("DOMContentLoaded", function () {
    const loadingScreen = document.getElementById("loading-screen");
    const content = document.getElementById("content");
    const popup = document.getElementById("popup-module");
    const showPopupButton = document.getElementById("show-popup");
    const closePopupButton = document.getElementById("popup-close");

    setTimeout(() => {
        loadingScreen.classList.add("hidden");
        setTimeout(() => {
            loadingScreen.style.display = "none";
            content.classList.add("show");
        }, 500);
    }, 2000);

    function showPopup() {
        popup.style.display = "flex";
    }

    function hidePopup() {
        popup.style.display = "none";
    }

    showPopupButton.addEventListener("click", showPopup);
    closePopupButton.addEventListener("click", hidePopup);

    popup.addEventListener("click", function (e) {
        if (e.target.id === "popup-module") {
            hidePopup();
        }
    });
});
