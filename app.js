const API_URL =
"https://script.google.com/macros/s/AKfycbwBggbroqqWC5UnjEXCyiTNkAir-pC2WP6s6rSVOThzUN4xD6tmfSm_g9DpkomzHmQRnw/exec";

function lookupGuest() {

    const code =
        document.getElementById("inviteCode")
        .value
        .trim();

    fetch(
        API_URL +
        "?code=" +
        encodeURIComponent(code)
    )

    .then(response => response.json())

    .then(data => {

        alert(
            `${data.guest}\nSeats: ${data.seats}`
        );

    });

}
