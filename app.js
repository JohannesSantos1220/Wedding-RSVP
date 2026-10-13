const API_URL =
"https://script.google.com/macros/s/AKfycbwBggbroqqWC5UnjEXCyiTNkAir-pC2WP6s6rSVOThzUN4xD6tmfSm_g9DpkomzHmQRnw/exec";

function lookupGuest() {

    const code =
        document.getElementById("inviteCode")
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

        if (data.success) {

            document.getElementById("result")
            .innerHTML = `

            <div class="modal-overlay">

                <div class="modal-card">

                    <div class="welcome-title">
                        Welcome
                    </div>

                    <div class="guest-name">
                        ${data.guest}
                    </div>

                    <p class="welcome-message">

                        We are honored to celebrate
                        our special day with you.

                    </p>

                    <div class="reserved-box">

                        <div class="reserved-label">
                            Reserved Seats
                        </div>

                        <div class="reserved-number">
                            ${data.seats}
                        </div>

                    </div>

                    <button
                        class="continue-button"
                        onclick="showRSVPForm('${data.guest}',${data.seats})">

                        Continue to RSVP

                    </button>

                </div>

            </div>

            `;

        }

        else {

            document.getElementById("result")
            .innerHTML = `

            <div class="error-card">

             
