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

const inviteForm = document.getElementById("inviteForm");
const inviteCodeInput = document.getElementById("inviteCode");
const lookupButton = document.getElementById("lookupButton");
const statusMessage = document.getElementById("statusMessage");

const welcomeModal = document.getElementById("welcomeModal");
const modalEyebrow = document.getElementById("modalEyebrow");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");
const reservedSeatCard = document.getElementById("reservedSeatCard");
const modalSeatCount = document.getElementById("modalSeatCount");
const modalContinueButton = document.getElementById("modalContinueButton");

const rsvpSection = document.getElementById("rsvpSection");
const rsvpForm = document.getElementById("rsvpForm");
const rsvpGuestName = document.getElementById("rsvpGuestName");
const seatSummary = document.getElementById("seatSummary");

const acceptanceFields = document.getElementById("acceptanceFields");
const attendingCountSelect = document.getElementById("attendingCount");
const maximumSeatsText = document.getElementById("maximumSeatsText");

const attendeeNamesSection =
    document.getElementById("attendeeNamesSection");

const attendeeFields = document.getElementById("attendeeFields");

const dietaryNone = document.getElementById("dietaryNone");
const dietaryOther = document.getElementById("dietaryOther");
const otherDietarySection =
    document.getElementById("otherDietarySection");

const otherDietaryInput = document.getElementById("otherDietary");
const formError = document.getElementById("formError");
const submitRsvpButton = document.getElementById("submitRsvpButton");

const thankYouSection = document.getElementById("thankYouSection");
const thankYouMessage = document.getElementById("thankYouMessage");

inviteForm.addEventListener("submit", handleInviteLookup);
rsvpForm.addEventListener("submit", handleRsvpSubmit);

modalContinueButton.addEventListener("click", handleModalContinue);

attendingCountSelect.addEventListener(
    "change",
    handleAttendingCountChange
);

dietaryOther.addEventListener(
    "change",
    handleOtherDietaryChange
);

document
    .querySelectorAll('input[name="attendance"]')
    .forEach((radio) => {
        radio.addEventListener(
            "change",
            handleAttendanceChange
        );
    });

document
    .querySelectorAll('input[name="dietary"]')
    .forEach((checkbox) => {
        checkbox.addEventListener(
            "change",
            handleDietarySelection
        );
    });

inviteCodeInput.addEventListener("input", () => {
    inviteCodeInput.value =
        inviteCodeInput.value.toUpperCase();

    clearStatusMessage();
});

async function handleInviteLookup(event) {
    event.preventDefault();

    const inviteCode =
        inviteCodeInput.value.trim().toUpperCase();

    if (!inviteCode) {
        showStatusMessage(
            "Please enter your invitation code.",
            "error"
        );

        inviteCodeInput.focus();
        return;
    }

    setLookupLoading(true);
    clearStatusMessage();

    try {
        const response = await fetch(
            `${API_URL}?code=${encodeURIComponent(inviteCode)}`
        );

        if (!response.ok) {
            throw new Error(
                `Lookup request failed with status ${response.status}.`
            );
        }

        const data = await response.json();

        if (!data.success) {
            showStatusMessage(
                "Sorry, we could not find that invitation code. Please check the code and try again.",
                "error"
            );

            return;
        }

        state.inviteCode = inviteCode;
        state.guestName = String(data.guest || "");
        state.reservedSeats =
            Number.parseInt(data.seats, 10) || 0;

        state.existingRSVP =
            Boolean(data.existingRSVP);

        state.existingData =
            data.existingData || null;

        state.rsvpClosed =
            Boolean(data.rsvpClosed);

        configureWelcomeModal();
        openModal();
    } catch (error) {
        console.error(error);

        showStatusMessage(
            "We could not connect to the RSVP system. Please refresh the page and try again.",
            "error"
        );
    } finally {
        setLookupLoading(false);
    }
}

function configureWelcomeModal() {
    modalTitle.textContent = state.guestName;

    if (state.rsvpClosed) {
        modalEyebrow.textContent = "RSVP Closed";

        modalMessage.innerHTML = `
            <p>
                Our RSVP deadline has passed.
            </p>

            <p>
                Please contact Jo or Shayne directly
                if you need to make changes.
            </p>
        `;

        reservedSeatCard.classList.add("hidden");
        modalContinueButton.classList.add("hidden");

        return;
    }

    reservedSeatCard.classList.remove("hidden");
    modalContinueButton.classList.remove("hidden");
    modalSeatCount.textContent = state.reservedSeats;

    if (state.existingRSVP) {
        modalEyebrow.textContent = "Welcome Back";

        modalMessage.innerHTML = `
            <p>
                An RSVP has already been submitted.
            </p>

            <p>
                You may update your RSVP until
                January 15, 2027.
            </p>
        `;

        modalContinueButton.textContent = "Update RSVP";
    } else {
        modalEyebrow.textContent = "Welcome";

        modalMessage.innerHTML = `
            <p>
                Thank you for being part of
                our special day.
            </p>

            <p>
                We have reserved
                <strong>${state.reservedSeats}</strong>
                ${state.reservedSeats === 1 ? "seat" : "seats"}
                for your party.
            </p>

            <p>
                Please continue below
                to confirm your attendance.
            </p>
        `;

        modalContinueButton.textContent = "Continue";
    }
}

function openModal() {
    welcomeModal.classList.remove("hidden");
    document.body.classList.add("modal-open");

    window.setTimeout(() => {
        modalContinueButton.focus();
    }, 50);
}

function closeModal() {
    welcomeModal.classList.add("hidden");
    document.body.classList.remove("modal-open");
}

function handleModalContinue() {
    if (state.rsvpClosed) {
        return;
    }

    closeModal();
    prepareRsvpForm();

    rsvpSection.classList.remove("hidden");
    thankYouSection.classList.add("hidden");

    rsvpSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function prepareRsvpForm() {
    resetRsvpForm();

    rsvpGuestName.textContent = state.guestName;

    seatSummary.textContent =
        `${state.reservedSeats} ` +
        `${state.reservedSeats === 1 ? "seat has" : "seats have"} ` +
        "been reserved for your party.";

    populateAttendingCountOptions();

    maximumSeatsText.textContent =
        `Maximum allowed: ${state.reservedSeats}`;

    if (state.existingRSVP && state.existingData) {
        prefillExistingRsvp();
    }
}

function resetRsvpForm() {
    rsvpForm.reset();

    acceptanceFields.classList.add("hidden");
    attendeeNamesSection.classList.add("hidden");
    attendeeFields.innerHTML = "";

    otherDietarySection.classList.add("hidden");
    otherDietaryInput.value = "";

    clearFormError();

    submitRsvpButton.disabled = false;
    submitRsvpButton.textContent = state.existingRSVP
        ? "Update RSVP"
        : "Submit RSVP";
}

function populateAttendingCountOptions() {
    attendingCountSelect.innerHTML = `
        <option value="">
            Select number attending
        </option>
    `;

    for (
        let number = 1;
        number <= state.reservedSeats;
        number += 1
    ) {
        const option = document.createElement("option");

        option.value = String(number);
        option.textContent = String(number);

        attendingCountSelect.appendChild(option);
    }
}

function prefillExistingRsvp() {
    const existing = state.existingData;

    const attendance =
        normaliseAttendance(existing.attendance);

    const matchingRadio = document.querySelector(
        `input[name="attendance"][value="${attendance}"]`
    );

    if (matchingRadio) {
        matchingRadio.checked = true;
    }

    handleAttendanceChange();

    if (attendance === "Accept") {
        const existingCount =
            Number.parseInt(
                existing.attendingCount,
                10
            ) || 1;

        const safeCount = Math.min(
            Math.max(existingCount, 1),
            state.reservedSeats
        );

        attendingCountSelect.value =
            String(safeCount);

        createAttendeeFields(safeCount);

        const names =
            parseStoredValues(
                existing.attendeeNames,
                "|"
            );

        const attendeeInputs =
            attendeeFields.querySelectorAll(
                ".attendee-name-input"
            );

        attendeeInputs.forEach((input, index) => {
            input.value = names[index] || "";
        });

        const dietaryValues =
            parseStoredValues(
                existing.dietaryRestrictions,
                ";"
            );

        prefillDietaryRestrictions(dietaryValues);
    }
}

function normaliseAttendance(value) {
    const normalised =
        String(value || "")
            .trim()
            .toLowerCase();

    return normalised === "accept"
        ? "Accept"
        : "Decline";
}

function parseStoredValues(value, separator) {
    if (!value) {
        return [];
    }

    return String(value)
        .split(separator)
        .map((item) => item.trim())
        .filter(Boolean);
}

function prefillDietaryRestrictions(values) {
    const knownValues = new Set([
        "None",
        "Vegetarian",
        "Vegan",
        "Seafood Allergy",
        "Nut Allergy",
        "Dairy Allergy",
        "Gluten-Free"
    ]);

    const unknownValues = [];

    values.forEach((value) => {
        const matchingCheckbox = Array
            .from(
                document.querySelectorAll(
                    'input[name="dietary"]'
                )
            )
            .find(
                (checkbox) =>
                    checkbox.value === value
            );

        if (
            matchingCheckbox &&
            matchingCheckbox.value !== "Other"
        ) {
            matchingCheckbox.checked = true;
        } else if (!knownValues.has(value)) {
            unknownValues.push(value);
        }
    });

    if (unknownValues.length > 0) {
        dietaryOther.checked = true;
        otherDietarySection.classList.remove("hidden");
        otherDietaryInput.value =
            unknownValues.join("; ");
    }

    handleDietarySelection();
}

function handleAttendanceChange() {
    const attendance = getSelectedAttendance();

    clearFormError();

    if (attendance === "Accept") {
        acceptanceFields.classList.remove("hidden");

        if (!attendingCountSelect.value) {
            attendingCountSelect.value = "1";
        }

        createAttendeeFields(
            Number.parseInt(
                attendingCountSelect.value,
                10
            ) || 1
        );
    } else {
        acceptanceFields.classList.add("hidden");
        attendeeNamesSection.classList.add("hidden");
        attendeeFields.innerHTML = "";
        attendingCountSelect.value = "";

        clearDietarySelections();
    }
}

function handleAttendingCountChange() {
    const count =
        Number.parseInt(
            attendingCountSelect.value,
            10
        );

    if (!count) {
        attendeeNamesSection.classList.add("hidden");
        attendeeFields.innerHTML = "";
        return;
    }

    createAttendeeFields(count);
}

function createAttendeeFields(count) {
    const existingNames = Array
        .from(
            attendeeFields.querySelectorAll(
                ".attendee-name-input"
            )
        )
        .map((input) => input.value);

    attendeeFields.innerHTML = "";

    for (
        let index = 0;
        index < count;
        index += 1
    ) {
        const wrapper =
            document.createElement("div");

        wrapper.className = "attendee-field";

        const label =
            document.createElement("label");

        label.setAttribute(
            "for",
            `attendeeName${index + 1}`
        );

        label.textContent =
            `Attendee ${index + 1}`;

        const input =
            document.createElement("input");

        input.type = "text";
        input.id = `attendeeName${index + 1}`;
        input.className = "attendee-name-input";
        input.placeholder =
            `Full name of attendee ${index + 1}`;

        input.autocomplete = "name";
        input.value = existingNames[index] || "";

        wrapper.appendChild(label);
        wrapper.appendChild(input);

        attendeeFields.appendChild(wrapper);
    }

    attendeeNamesSection.classList.remove("hidden");
}

function handleDietarySelection(event) {
    const dietaryCheckboxes = Array.from(
        document.querySelectorAll(
            'input[name="dietary"]'
        )
    );

    if (
        event &&
        event.target === dietaryNone &&
        dietaryNone.checked
    ) {
        dietaryCheckboxes.forEach((checkbox) => {
            if (checkbox !== dietaryNone) {
                checkbox.checked = false;
            }
        });
    } else if (
        event &&
        event.target !== dietaryNone &&
        event.target.checked
    ) {
        dietaryNone.checked = false;
    }

    handleOtherDietaryChange();
}

function handleOtherDietaryChange() {
    if (dietaryOther.checked) {
        otherDietarySection.classList.remove("hidden");
    } else {
        otherDietarySection.classList.add("hidden");
        otherDietaryInput.value = "";
    }
}

function clearDietarySelections() {
    document
        .querySelectorAll(
            'input[name="dietary"]'
        )
        .forEach((checkbox) => {
            checkbox.checked = false;
        });

    otherDietaryInput.value = "";
    otherDietarySection.classList.add("hidden");
}

function getSelectedAttendance() {
    const selected = document.querySelector(
        'input[name="attendance"]:checked'
    );

    return selected ? selected.value : "";
}

async function handleRsvpSubmit(event) {
    event.preventDefault();

    clearFormError();

    const attendance = getSelectedAttendance();

    if (!attendance) {
        showFormError(
            "Please select whether you will be attending."
        );

        return;
    }

    let attendingCount = 0;
    let attendeeNames = "";
    let dietaryRestrictions = "";

    if (attendance === "Accept") {
        const validation =
            validateAcceptedRsvp();

        if (!validation.valid) {
            showFormError(validation.message);
            return;
        }

        attendingCount = validation.attendingCount;

        attendeeNames =
            validation.attendeeNames.join("|");

        dietaryRestrictions =
            collectDietaryRestrictions().join(";");
    }

    const payload = {
        inviteCode: state.inviteCode,
        guestName: state.guestName,
        attendance,
        attendingCount,
        attendeeNames,
        dietaryRestrictions
    };

    setSubmitLoading(true);

    try {
        const response = await fetch(
            API_URL,
            {
                method: "POST",
                body: JSON.stringify(payload)
            }
        );

        if (!response.ok) {
            throw new Error(
                `Submission failed with status ${response.status}.`
            );
        }

        const result = await response.json();

        if (result.rsvpClosed) {
            showFormError(
                "The RSVP period has closed. Please contact Jo or Shayne directly if you need to make changes."
            );

            return;
        }

        if (!result.success) {
            throw new Error(
                result.message ||
                "The RSVP could not be saved."
            );
        }

        state.existingRSVP = true;
        state.existingData = {
            attendance,
            attendingCount,
            attendeeNames,
            dietaryRestrictions
        };

        showThankYouScreen(attendance);
    } catch (error) {
        console.error(error);

        showFormError(
            "We could not save your RSVP. Please check your connection and try again."
        );
    } finally {
        setSubmitLoading(false);
    }
}

function validateAcceptedRsvp() {
    const attendingCount =
        Number.parseInt(
            attendingCountSelect.value,
            10
        );

    if (
        !attendingCount ||
        attendingCount < 1 ||
        attendingCount > state.reservedSeats
    ) {
        return {
            valid: false,
            message:
                `Please select a number between 1 and ${state.reservedSeats}.`
        };
    }

    const attendeeNames = Array
        .from(
            attendeeFields.querySelectorAll(
                ".attendee-name-input"
            )
        )
        .map((input) => input.value.trim());

    if (
        attendeeNames.length !== attendingCount ||
        attendeeNames.some((name) => !name)
    ) {
        return {
            valid: false,
            message:
                "Please provide the name of every attendee."
        };
    }

    if (
        dietaryOther.checked &&
        !otherDietaryInput.value.trim()
    ) {
        return {
            valid: false,
            message:
                "Please specify the other dietary restriction."
        };
    }

    return {
        valid: true,
        attendingCount,
        attendeeNames
    };
}

function collectDietaryRestrictions() {
    const selected = Array
        .from(
            document.querySelectorAll(
                'input[name="dietary"]:checked'
            )
        )
        .map((checkbox) => checkbox.value)
        .filter((value) => value !== "Other");

    if (
        dietaryOther.checked &&
        otherDietaryInput.value.trim()
    ) {
        selected.push(
            otherDietaryInput.value.trim()
        );
    }

    return selected;
}

function showThankYouScreen(attendance) {
    rsvpSection.classList.add("hidden");

    thankYouMessage.textContent =
        attendance === "Accept"
            ? "Your attendance has been confirmed."
            : "Your response has been received. Thank you for letting us know.";

    thankYouSection.classList.remove("hidden");

    thankYouSection.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

function setLookupLoading(isLoading) {
    lookupButton.disabled = isLoading;
    inviteCodeInput.disabled = isLoading;

    lookupButton.textContent =
        isLoading ? "Checking..." : "Continue";

    if (isLoading) {
        showStatusMessage(
            "Checking your invitation code...",
            "loading"
        );
    }
}

function setSubmitLoading(isLoading) {
    submitRsvpButton.disabled = isLoading;

    submitRsvpButton.textContent =
        isLoading
            ? "Saving..."
            : state.existingRSVP
                ? "Update RSVP"
                : "Submit RSVP";
}

function showStatusMessage(message, type) {
    statusMessage.textContent = message;
    statusMessage.className =
        `status-message ${type || ""}`.trim();
}

function clearStatusMessage() {
    statusMessage.textContent = "";
    statusMessage.className = "status-message";
}

function showFormError(message) {
    formError.textContent = message;
    formError.classList.remove("hidden");

    formError.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

function clearFormError() {
    formError.textContent = "";
    formError.classList.add("hidden");
}
