const API_URL =
"https://script.google.com/macros/s/AKfycbwBggbroqqWC5UnjEXCyiTNkAir-pC2WP6s6rSVOThzUN4xD6tmfSm_g9DpkomzHmQRnw/exec";

function lookupGuest() {

    const code = document
        .getElementById("inviteCode")
        .value
        .trim();

    if (!code) {
        alert("Please enter your invitation code.");
        return;
    }

    fetch(
        API_URL +
        "?code=" +
        encodeURIComponent(code)
    )
    .then(response => response.json())
    .then(data => {

        console.log(data);

        if (data.success) {

            document.getElementById("result").innerHTML = `

                <div class="welcome-card">

                    <h2 class="welcome-heading">
                        Welcome
                    </h2>

                    <div class="guest-name">
                        ${data.guest}
                    </div>

                    <p class="welcome-message">
                        We are honored to celebrate
                        our special day with you.
                    </p>

                    <div class="seat-box">

                        <div class="seat-label">
                            Reserved Seats
                        </div>

                        <div class="seat-number">
                            ${data.seats}
                        </div>

                    </div>

                    <button
                        class="continue-button"
                        onclick="showRSVPForm('${data.guest}', ${data.seats})">

                        Continue to RSVP

                    </button>

                </div>

            `;

        } else {

            document.getElementById("result").innerHTML = `

                <div class="error-card">
                    Sorry, we could not find that invitation code.
                </div>

            `;

        }

    })
    .catch
