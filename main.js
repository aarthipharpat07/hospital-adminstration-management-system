/* =========================================
   MEDICARE HOSPITAL MANAGEMENT SYSTEM
   MAIN JAVASCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {

        loginForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const username =
                document.getElementById("username").value.trim();

            const password =
                document.getElementById("password").value.trim();


            // Temporary login for website testing
            if (username === "" || password === "") {

                alert("Please enter your username and password.");

                return;
            }


            // Save login status
            localStorage.setItem("isLoggedIn", "true");

            // Open dashboard
            window.location.href = "dashboard.html";

        });

    }

});