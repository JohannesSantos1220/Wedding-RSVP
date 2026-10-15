const API_URL =
    "https://script.google.com/macros/s/AKfycbwBggbroqqWC5UnjEXCyiTNkAir-pC2WP6s6rSVOThzUN4xD6tmfSm_g9DpkomzHmQRnw/exec";

const state = {
    inviteCode: "",
    guestName: "",
    reservedSeats: 0,
    existingRSVP: false,
    existingData: null,
    rsvpClosed: false
};

const $ = (id) => document.getElementById(id);

const inviteForm = $("inviteForm");
const inviteCode = $("inviteCode");
const lookupButton = $("lookupButton");
const statusMessage = $("statusMessage");

const modal = $("welcomeModal");
const modalEyebrow = $("modalEyebrow");
const modalTitle = $("modalTitle");
const modalMessage = $("modalMessage");
const reservedSeatCard = $("reservedSeatCard");
const modalSeatCount = $("modalSeatCount");
const modalContinue = $("modalContinueButton");

const rsvpSection = $("rsvpSection");
const rsvpForm = $("rsvpForm");
const rsvpGuestName = $("rsvpGuestName");
const seatSummary = $("seatSummary");

const acceptanceFields = $("acceptanceFields");
const attendingCount = $("attendingCount");
const maximumSeatsText = $("maximumSeatsText");

const attendeeNamesSection = $("attendeeNamesSection");
const attendeeFields = $("attendeeFields");

const mobileNumber = $("mobileNumber");

const dietaryNone = $("dietaryNone");
const dietaryOther = $("dietaryOther");
const otherDietarySection = $("otherDietarySection");
const otherDietary = $("otherDietary");

const privateCarSection = $("privateCarSection");
const plateSection = $("plateSection");
const plateNumber = $("plateNumber");

const carpoolSection = $("carpoolSection");
const carpoolWith = $("carpoolWith");

const otherTransportationSection =
    $("otherTransportationSection");

const otherTransportation = $("otherTransportation");

const hairMakeupSection = $("hairMakeupSection");
const hairMakeupCount = $("hairMakeupCount");
const hairMakeupService = $("hairMakeupService");

const formError = $("formError");
const submitButton = $("submitRsvpButton");

const thankYouSection = $("thankYouSection");
const thankYouMessage = $("thankYouMessage");

inviteForm.addEventListener("submit", lookupGuest);
rsvpForm.addEventListener("submit", submitRsvp);
modalContinue.addEventListener("click", openForm);

attendingCount.addEventListener("change", () => {
    createAttendees(Number(attendingCount.value));

    if (
        Number(hairMakeupCount.value) >
        Number(attendingCount.value)
    ) {
        hairMakeupCount.value = "";
    }
});

inviteCode.addEventListener("input", () => {
    inviteCode.value =
        inviteCode.value.toUpperCase();
});

plateNumber.addEventListener("input", () => {
    plateNumber.value =
        plateNumber.value.toUpperCase();
});

document.addEventListener("change", (event) => {
    if (event.target.name === "attendance") {
        toggleAttendance();
    }

    if (event.target.name === "dietary") {
        handleDietary(event.target);
    }

    if (event.target.name === "transportation") {
        handleTransportation();
    }

    if (event.target.name === "privateCarType") {
        handlePrivateCarType();
    }

    if (
        event.target.name ===
        "hairMakeupInterested"
    ) {
        handleHairMakeup();
    }
});

function selected(name) {
    return (
        document.querySelector(
            `input[name="${name}"]:checked`
        )?.value || ""
    );
}

function setError(message) {
    formError.textContent = message;

    formError.classList.toggle(
        "hidden",
        !message
    );
}

function startCountdown() {
    const weddingDate =
        new Date("2027-03-18T13:00:00+08:00");

    function updateCountdown() {
        const now = new Date();
        const difference =
            weddingDate.getTime() - now.getTime();

        const daysElement = $("days");
        const hoursElement = $("hours");
        const minutesElement = $("minutes");

        if (
            !daysElement ||
            !hoursElement ||
            !minutesElement
        ) {
            return;
        }

        if (difference <= 0) {
            daysElement.textContent = "0";
            hoursElement.textContent = "0";
            minutesElement.textContent = "0";
            return;
        }

        const days = Math.floor(
            difference / (1000 * 60 * 60 * 24)
        );

        const hours = Math.floor(
            (
                difference %
                (1000 * 60 * 60 * 24)
            ) /
            (1000 * 60 * 60)
        );

        const minutes = Math.floor(
            (
                difference %
                (1000 * 60 * 60)
            ) /
            (1000 * 60)
        );

        daysElement.textContent =
            String(days);

        hoursElement.textContent =
            String(hours).padStart(2, "0");

        minutesElement.textContent =
            String(minutes).padStart(2, "0");
    }

    updateCountdown();

    window.setInterval(
        updateCountdown,
        60000
    );
}

async function lookupGuest(event) {
    event.preventDefault();

    const code =
        inviteCode.value
            .trim()
            .toUpperCase();

    if (!code) {
        statusMessage.textContent =
            "Please enter your invitation code.";

        statusMessage.className =
            "status-message error";

        return;
    }

    lookupButton.disabled = true;
    lookupButton.textContent = "Checking...";

    statusMessage.textContent = "";
    statusMessage.className =
        "status-message";

    try {
        const response = await fetch(
            `${API_URL}?code=${encodeURIComponent(code)}`
        );

        const data = await response.json();

        if (!data.success) {
            throw new Error(
                data.message ||
                "Invitation code not found."
            );
        }

        Object.assign(state, {
            inviteCode: code,
            guestName: data.guest,
            reservedSeats:
                Number(data.seats) || 0,
            existingRSVP:
                Boolean(data.existingRSVP),
            existingData:
                data.existingData || null,
            rsvpClosed:
                Boolean(data.rsvpClosed)
        });

        showModal();
    } catch (error) {
        statusMessage.textContent =
            error.message;

        statusMessage.className =
            "status-message error";
    } finally {
        lookupButton.disabled = false;
        lookupButton.textContent =
            "Continue";
    }
}

function showModal() {
    if (state.rsvpClosed) {
        modalEyebrow.textContent =
            "RSVP Closed";

        modalTitle.textContent =
            state.guestName;

        modalMessage.innerHTML = `
            <p>
                Our RSVP deadline has passed.
            </p>

            <p>
                Please contact Jo or Shayne
                directly if you need to make
                changes.
            </p>
        `;

        reservedSeatCard.classList.add(
            "hidden"
        );

        modalContinue.classList.add(
            "hidden"
        );
    } else {
        reservedSeatCard.classList.remove(
            "hidden"
        );

        modalContinue.classList.remove(
            "hidden"
        );

        modalSeatCount.textContent =
            state.reservedSeats;

        if (state.existingRSVP) {
            modalEyebrow.textContent =
                "Welcome Back";

            modalTitle.textContent =
                `Welcome back, ${state.guestName}!`;

            modalMessage.innerHTML = `
                <p>
                    An RSVP has already been
                    submitted.
                </p>

                <p>
                    You may update your RSVP
                    until January 15, 2027.
                </p>
            `;

            modalContinue.textContent =
                "Update RSVP";
        } else {
            modalEyebrow.textContent =
                "You're Invited";

            modalTitle.textContent =
                `Welcome, ${state.guestName}!`;

            modalMessage.innerHTML = `
                <p>
                    Thank you for being part
                    of our special day.
                </p>

                <p>
                    We have reserved
                    <strong>
                        ${state.reservedSeats}
                    </strong>
                    ${
                        state.reservedSeats === 1
                            ? "seat"
                            : "seats"
                    }
                    for your party.
                </p>

                <p>
                    Please continue below
                    to confirm your attendance.
                </p>
            `;

            modalContinue.textContent =
                "Continue";
        }
    }

    modal.classList.remove("hidden");
    document.body.classList.add(
        "modal-open"
    );
}

function openForm() {
    modal.classList.add("hidden");

    document.body.classList.remove(
        "modal-open"
    );

    prepareForm();

    rsvpSection.classList.remove("hidden");

    rsvpSection.scrollIntoView({
        behavior: "smooth"
    });
}

function prepareForm() {
    rsvpForm.reset();

    acceptanceFields.classList.add(
        "hidden"
    );

    rsvpGuestName.textContent =
        state.guestName;

    seatSummary.textContent =
        `${state.reservedSeats} ` +
        `${
            state.reservedSeats === 1
                ? "seat has"
                : "seats have"
        } been reserved for your party.`;

    populate(
        attendingCount,
        "Select number attending"
    );

    populate(
        hairMakeupCount,
        "Select number"
    );

    maximumSeatsText.textContent =
        `Maximum allowed: ${state.reservedSeats}`;

    submitButton.textContent =
        state.existingRSVP
            ? "Update RSVP"
            : "Submit RSVP";

    hideConditional();

    if (
        state.existingRSVP &&
        state.existingData
    ) {
        prefill(state.existingData);
    }
}

function populate(element, placeholder) {
    element.innerHTML =
        `<option value="">${placeholder}</option>`;

    for (
        let number = 1;
        number <= state.reservedSeats;
        number += 1
    ) {
        element.add(
            new Option(number, number)
        );
    }
}

function hideConditional() {
    attendeeNamesSection.classList.add(
        "hidden"
    );

    attendeeFields.innerHTML = "";

    otherDietarySection.classList.add(
        "hidden"
    );

    privateCarSection.classList.add(
        "hidden"
    );

    plateSection.classList.add(
        "hidden"
    );

    carpoolSection.classList.add(
        "hidden"
    );

    otherTransportationSection.classList.add(
        "hidden"
    );

    hairMakeupSection.classList.add(
        "hidden"
    );

    setError("");
}

function toggleAttendance() {
    const willAttend =
        selected("attendance") === "Accept";

    acceptanceFields.classList.toggle(
        "hidden",
        !willAttend
    );

    if (
        willAttend &&
        !attendingCount.value
    ) {
        attendingCount.value = "1";
        createAttendees(1);
    }
}

function createAttendees(count) {
    const previousNames = [
        ...document.querySelectorAll(
            ".attendee-name-input"
        )
    ].map((input) => input.value);

    attendeeFields.innerHTML = "";

    for (
        let index = 0;
        index < count;
        index += 1
    ) {
        attendeeFields.insertAdjacentHTML(
            "beforeend",
            `
            <div class="attendee-field">
                <label for="attendee${index}">
                    Attendee ${index + 1}
                </label>

                <input
                    type="text"
                    id="attendee${index}"
                    class="attendee-name-input"
                    placeholder="Full name of attendee ${index + 1}"
                    value="${previousNames[index] || ""}">
            </div>
            `
        );
    }

    attendeeNamesSection.classList.toggle(
        "hidden",
        !count
    );
}

function handleDietary(target) {
    const boxes = [
        ...document.querySelectorAll(
            'input[name="dietary"]'
        )
    ];

    if (
        target.value === "None" &&
        target.checked
    ) {
        boxes.forEach((box) => {
            if (box !== target) {
                box.checked = false;
            }
        });
    } else if (target.checked) {
        const noneBox = boxes.find(
            (box) => box.value === "None"
        );

        if (noneBox) {
            noneBox.checked = false;
        }
    }

    const otherBox = boxes.find(
        (box) => box.value === "Other"
    );

    const otherSelected =
        Boolean(otherBox?.checked);

    otherDietarySection.classList.toggle(
        "hidden",
        !otherSelected
    );

    if (!otherSelected) {
        otherDietary.value = "";
    }
}

function handleTransportation() {
    const transportation =
        selected("transportation");

    privateCarSection.classList.toggle(
        "hidden",
        transportation !== "Private car"
    );

    otherTransportationSection.classList.toggle(
        "hidden",
        transportation !== "Others"
    );

    if (
        transportation !== "Private car"
    ) {
        document
            .querySelectorAll(
                'input[name="privateCarType"]'
            )
            .forEach((input) => {
                input.checked = false;
            });

        plateSection.classList.add(
            "hidden"
        );

        carpoolSection.classList.add(
            "hidden"
        );

        plateNumber.value = "";
        carpoolWith.value = "";
    }

    if (transportation !== "Others") {
        otherTransportation.value = "";
    }
}

function handlePrivateCarType() {
    const privateCarType =
        selected("privateCarType");

    plateSection.classList.toggle(
        "hidden",
        privateCarType !==
            "Personal vehicle"
    );

    carpoolSection.classList.toggle(
        "hidden",
        privateCarType !== "Carpooling"
    );

    if (
        privateCarType !==
        "Personal vehicle"
    ) {
        plateNumber.value = "";
    }

    if (
        privateCarType !== "Carpooling"
    ) {
        carpoolWith.value = "";
    }
}

function handleHairMakeup() {
    const interested =
        selected(
            "hairMakeupInterested"
        ) === "Yes";

    hairMakeupSection.classList.toggle(
        "hidden",
        !interested
    );

    if (!interested) {
        hairMakeupCount.value = "";
        hairMakeupService.value = "";
    }
}

function normaliseMobile(value) {
    return value.replace(
        /[\s()-]/g,
        ""
    );
}

function validMobile(value) {
    return /^(09\d{9}|\+639\d{9})$/.test(
        normaliseMobile(value)
    );
}

function prefill(data) {
    const attendance =
        data.attendance === "Accept"
            ? "Accept"
            : "Decline";

    const attendanceOption =
        document.querySelector(
            `input[name="attendance"][value="${attendance}"]`
        );

    if (attendanceOption) {
        attendanceOption.checked = true;
    }

    toggleAttendance();

    if (attendance !== "Accept") {
        return;
    }

    attendingCount.value =
        String(
            Math.min(
                Math.max(
                    Number(data.attendingCount) ||
                    1,
                    1
                ),
                state.reservedSeats
            )
        );

    createAttendees(
        Number(attendingCount.value)
    );

    String(data.attendeeNames || "")
        .split("|")
        .forEach((name, index) => {
            const attendee =
                $(`attendee${index}`);

            if (attendee) {
                attendee.value = name;
            }
        });

    mobileNumber.value =
        data.mobileNumber || "";

    String(
        data.dietaryRestrictions || ""
    )
        .split(";")
        .filter(Boolean)
        .forEach((value) => {
            const knownOption = [
                ...document.querySelectorAll(
                    'input[name="dietary"]'
                )
            ].find(
                (box) =>
                    box.value === value
            );

            if (knownOption) {
                knownOption.checked = true;
            } else {
                dietaryOther.checked = true;
                otherDietary.value = value;

                otherDietarySection.classList.remove(
                    "hidden"
                );
            }
        });

    const transportation =
        data.transportation || "";

    const transportationOption =
        document.querySelector(
            `input[name="transportation"][value="${transportation}"]`
        );

    if (transportationOption) {
        transportationOption.checked = true;
    }

    handleTransportation();

    if (
        transportation === "Private car"
    ) {
        const privateCarType =
            data.privateCarType || "";

        const privateCarOption =
            document.querySelector(
                `input[name="privateCarType"][value="${privateCarType}"]`
            );

        if (privateCarOption) {
            privateCarOption.checked = true;
        }

        handlePrivateCarType();

        plateNumber.value =
            data.plateNumber || "";

        carpoolWith.value =
            data.carpoolWith || "";
    }

    if (transportation === "Others") {
        otherTransportation.value =
            data.otherTransportation || "";
    }

    const hairMakeupInterest =
        data.hairMakeupInterested ||
        "No";

    const hairMakeupOption =
        document.querySelector(
            `input[name="hairMakeupInterested"][value="${hairMakeupInterest}"]`
        );

    if (hairMakeupOption) {
        hairMakeupOption.checked = true;
    }

    handleHairMakeup();

    if (
        hairMakeupInterest === "Yes"
    ) {
        hairMakeupCount.value =
            String(
                data.hairMakeupCount || ""
            );

        hairMakeupService.value =
            data.hairMakeupService || "";
    }
}

async function submitRsvp(event) {
    event.preventDefault();

    setError("");

    const attendance =
        selected("attendance");

    if (!attendance) {
        setError(
            "Please select whether you will be attending."
        );

        return;
    }

    let payload = {
        inviteCode: state.inviteCode,
        guestName: state.guestName,
        attendance,
        attendingCount: 0,
        attendeeNames: "",
        mobileNumber: "",
        dietaryRestrictions: "",
        transportation: "",
        privateCarType: "",
        plateNumber: "",
        carpoolWith: "",
        otherTransportation: "",
        hairMakeupInterested: "",
        hairMakeupCount: 0,
        hairMakeupService: ""
    };

    if (attendance === "Accept") {
        const validation = validate();

        if (!validation.valid) {
            setError(validation.message);
            return;
        }

        Object.assign(
            payload,
            validation.data
        );
    }

    submitButton.disabled = true;
    submitButton.textContent = "Saving...";

    try {
        const response = await fetch(
            API_URL,
            {
                method: "POST",
                body: JSON.stringify(payload)
            }
        );

        const data = await response.json();

        if (!data.success) {
            throw new Error(
                data.rsvpClosed
                    ? "The RSVP period has closed."
                    : data.message ||
                      "Unable to save RSVP."
            );
        }

        rsvpSection.classList.add(
            "hidden"
        );

        const thankYouHeading =
            thankYouSection.querySelector("h2");

        if (thankYouHeading) {
            thankYouHeading.textContent =
                `Thank You, ${state.guestName}!`;
        }

        thankYouMessage.textContent =
            attendance === "Accept"
                ? "Your attendance has been confirmed. We can't wait to celebrate with you!"
                : "We appreciate your response and will miss celebrating with you in person.";

        thankYouSection.classList.remove(
            "hidden"
        );

        if (
            attendance === "Accept"
        ) {
            launchConfetti();
        }

        thankYouSection.scrollIntoView({
            behavior: "smooth"
        });
    } catch (error) {
        setError(error.message);
    } finally {
        submitButton.disabled = false;

        submitButton.textContent =
            state.existingRSVP
                ? "Update RSVP"
                : "Submit RSVP";
    }
}

function validate() {
    const count =
        Number(attendingCount.value);

    const names = [
        ...document.querySelectorAll(
            ".attendee-name-input"
        )
    ].map((input) =>
        input.value.trim()
    );

    if (
        !count ||
        names.some((name) => !name)
    ) {
        return {
            valid: false,
            message:
                "Please select the number attending and provide every attendee name."
        };
    }

    if (
        !validMobile(mobileNumber.value)
    ) {
        return {
            valid: false,
            message:
                "Please enter a valid Philippine mobile number, such as 09XXXXXXXXX or +639XXXXXXXXX."
        };
    }

    if (
        dietaryOther.checked &&
        !otherDietary.value.trim()
    ) {
        return {
            valid: false,
            message:
                "Please specify the other dietary restriction."
        };
    }

    const transportation =
        selected("transportation");

    if (!transportation) {
        return {
            valid: false,
            message:
                "Please select how your party will travel to the wedding."
        };
    }

    let privateCarType = "";

    if (
        transportation === "Private car"
    ) {
        privateCarType =
            selected("privateCarType");

        if (!privateCarType) {
            return {
                valid: false,
                message:
                    "Please select Personal vehicle or Carpooling."
            };
        }

        if (
            privateCarType ===
                "Personal vehicle" &&
            !plateNumber.value.trim()
        ) {
            return {
                valid: false,
                message:
                    "Please enter the vehicle plate number."
            };
        }

        if (
            privateCarType ===
                "Carpooling" &&
            !carpoolWith.value.trim()
        ) {
            return {
                valid: false,
                message:
                    "Please indicate whose car you will be carpooling with."
            };
        }
    }

    if (
        transportation === "Others" &&
        !otherTransportation.value.trim()
    ) {
        return {
            valid: false,
            message:
                "Please specify your transportation plan."
        };
    }

    const hairMakeupInterest =
        selected(
            "hairMakeupInterested"
        );

    if (!hairMakeupInterest) {
        return {
            valid: false,
            message:
                "Please indicate whether anyone wants hair and makeup service."
        };
    }

    if (
        hairMakeupInterest === "Yes" &&
        (
            !hairMakeupCount.value ||
            Number(
                hairMakeupCount.value
            ) > count ||
            !hairMakeupService.value
        )
    ) {
        return {
            valid: false,
            message:
                "Please complete the hair and makeup details. The number availing cannot exceed the number attending."
        };
    }

    const diets = [
        ...document.querySelectorAll(
            'input[name="dietary"]:checked'
        )
    ]
        .map((input) => input.value)
        .filter(
            (value) => value !== "Other"
        );

    if (dietaryOther.checked) {
        diets.push(
            otherDietary.value.trim()
        );
    }

    return {
        valid: true,
        data: {
            attendingCount: count,

            attendeeNames:
                names.join("|"),

            mobileNumber:
                normaliseMobile(
                    mobileNumber.value
                ),

            dietaryRestrictions:
                diets.join(";"),

            transportation,

            privateCarType,

            plateNumber:
                privateCarType ===
                "Personal vehicle"
                    ? plateNumber.value
                        .trim()
                        .toUpperCase()
                    : "",

            carpoolWith:
                privateCarType ===
                "Carpooling"
                    ? carpoolWith.value.trim()
                    : "",

            otherTransportation:
                transportation === "Others"
                    ? otherTransportation.value.trim()
                    : "",

            hairMakeupInterested:
                hairMakeupInterest,

            hairMakeupCount:
                hairMakeupInterest === "Yes"
                    ? Number(
                        hairMakeupCount.value
                    )
                    : 0,

            hairMakeupService:
                hairMakeupInterest === "Yes"
                    ? hairMakeupService.value
                    : ""
        }
    };
}

function launchConfetti() {
    const colors = [
        "#556B1E",
        "#E8CDD7",
        "#F5EFE3",
        "#D9E2B8",
        "#5B2D0F"
    ];

    for (
        let index = 0;
        index < 100;
        index += 1
    ) {
        const piece =
            document.createElement("span");

        piece.style.position = "fixed";
        piece.style.zIndex = "9999";

        piece.style.left =
            `${Math.random() * 100}vw`;

        piece.style.top = "-20px";

        piece.style.width =
            `${6 + Math.random() * 7}px`;

        piece.style.height =
            `${8 + Math.random() * 9}px`;

        piece.style.background =
            colors[
                Math.floor(
                    Math.random() *
                    colors.length
                )
            ];

        piece.style.borderRadius =
            Math.random() > 0.5
                ? "50%"
                : "2px";

        piece.style.pointerEvents =
            "none";

        document.body.appendChild(piece);

        const horizontalMovement =
            (Math.random() - 0.5) * 300;

        const rotation =
            Math.random() * 1080;

        const duration =
            2200 + Math.random() * 1800;

        const animation =
            piece.animate(
                [
                    {
                        transform:
                            "translate(0, 0) rotate(0deg)",
                        opacity: 1
                    },
                    {
                        transform:
                            `translate(${horizontalMovement}px, 105vh) rotate(${rotation}deg)`,
                        opacity: 0.85
                    }
                ],
                {
                    duration,
                    easing: "cubic-bezier(.2,.7,.3,1)",
                    fill: "forwards"
                }
            );

        animation.onfinish = () => {
            piece.remove();
        };
    }
}

startCountdown();
