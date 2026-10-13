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

const byId = (id) => document.getElementById(id);
const inviteForm = byId("inviteForm");
const inviteCodeInput = byId("inviteCode");
const lookupButton = byId("lookupButton");
const statusMessage = byId("statusMessage");
const welcomeModal = byId("welcomeModal");
const modalEyebrow = byId("modalEyebrow");
const modalTitle = byId("modalTitle");
const modalMessage = byId("modalMessage");
const reservedSeatCard = byId("reservedSeatCard");
const modalSeatCount = byId("modalSeatCount");
const modalContinueButton = byId("modalContinueButton");
const rsvpSection = byId("rsvpSection");
const rsvpForm = byId("rsvpForm");
const rsvpGuestName = byId("rsvpGuestName");
const seatSummary = byId("seatSummary");
const acceptanceFields = byId("acceptanceFields");
const attendingCountSelect = byId("attendingCount");
const maximumSeatsText = byId("maximumSeatsText");
const attendeeNamesSection = byId("attendeeNamesSection");
const attendeeFields = byId("attendeeFields");
const dietaryNone = byId("dietaryNone");
const dietaryOther = byId("dietaryOther");
const otherDietarySection = byId("otherDietarySection");
const otherDietaryInput = byId("otherDietary");
const plateSection = byId("plateSection");
const plateNumberInput = byId("plateNumber");
const hairMakeupSection = byId("hairMakeupSection");
const hairMakeupCountSelect = byId("hairMakeupCount");
const hairMakeupServiceSelect = byId("hairMakeupService");
const formError = byId("formError");
const submitRsvpButton = byId("submitRsvpButton");
const thankYouSection = byId("thankYouSection");
const thankYouMessage = byId("thankYouMessage");

inviteForm.addEventListener("submit", handleInviteLookup);
rsvpForm.addEventListener("submit", handleRsvpSubmit);
modalContinueButton.addEventListener("click", handleModalContinue);
attendingCountSelect.addEventListener("change", handleAttendingCountChange);
dietaryOther.addEventListener("change", handleOtherDietaryChange);

document.querySelectorAll('input[name="attendance"]').forEach((radio) => {
    radio.addEventListener("change", handleAttendanceChange);
});

document.querySelectorAll('input[name="dietary"]').forEach((checkbox) => {
    checkbox.addEventListener("change", handleDietarySelection);
});

document.querySelectorAll('input[name="transportation"]').forEach((radio) => {
    radio.addEventListener("change", handleTransportationChange);
});

document.querySelectorAll('input[name="hairMakeupInterested"]').forEach((radio) => {
    radio.addEventListener("change", handleHairMakeupInterestChange);
});

inviteCodeInput.addEventListener("input", () => {
    inviteCodeInput.value = inviteCodeInput.value.toUpperCase();
    clearStatusMessage();
});

plateNumberInput.addEventListener("input", () => {
    plateNumberInput.value = plateNumberInput.value.toUpperCase();
});

function getCheckedValue(name) {
    return document.querySelector(`input[name="${name}"]:checked`)?.value || "";
}

async function handleInviteLookup(event) {
    event.preventDefault();
    const inviteCode = inviteCodeInput.value.trim().toUpperCase();
    if (!inviteCode) {
        showStatusMessage("Please enter your invitation code.", "error");
        inviteCodeInput.focus();
        return;
    }
    setLookupLoading(true);
    clearStatusMessage();
    try {
        const response = await fetch(`${API_URL}?code=${encodeURIComponent(inviteCode)}`);
        if (!response.ok) throw new Error(`Lookup failed with status ${response.status}.`);
        const data = await response.json();
        if (!data.success) {
            showStatusMessage("Sorry, we could not find that invitation code. Please check the code and try again.", "error");
            return;
        }
        Object.assign(state, {
            inviteCode,
            guestName: String(data.guest || ""),
            reservedSeats: Number.parseInt(data.seats, 10) || 0,
            existingRSVP: Boolean(data.existingRSVP),
            existingData: data.existingData || null,
            rsvpClosed: Boolean(data.rsvpClosed)
        });
        configureWelcomeModal();
        openModal();
    } catch (error) {
        console.error(error);
        showStatusMessage("We could not connect to the RSVP system. Please refresh the page and try again.", "error");
    } finally {
        setLookupLoading(false);
    }
}

function configureWelcomeModal() {
    modalTitle.textContent = state.guestName;
    if (state.rsvpClosed) {
        modalEyebrow.textContent = "RSVP Closed";
        modalMessage.innerHTML = "<p>Our RSVP deadline has passed.</p><p>Please contact Jo or Shayne directly if you need to make changes.</p>";
        reservedSeatCard.classList.add("hidden");
        modalContinueButton.classList.add("hidden");
        return;
    }
    reservedSeatCard.classList.remove("hidden");
    modalContinueButton.classList.remove("hidden");
    modalSeatCount.textContent = state.reservedSeats;
    if (state.existingRSVP) {
        modalEyebrow.textContent = "Welcome Back";
        modalMessage.innerHTML = "<p>An RSVP has already been submitted.</p><p>You may update your RSVP until January 15, 2027.</p>";
        modalContinueButton.textContent = "Update RSVP";
    } else {
        modalEyebrow.textContent = "Welcome";
        modalMessage.innerHTML = `<p>Thank you for being part of our special day.</p><p>We have reserved <strong>${state.reservedSeats}</strong> ${state.reservedSeats === 1 ? "seat" : "seats"} for your party.</p><p>Please continue below to confirm your attendance.</p>`;
        modalContinueButton.textContent = "Continue";
    }
}

function openModal() {
    welcomeModal.classList.remove("hidden");
    document.body.classList.add("modal-open");
    window.setTimeout(() => modalContinueButton.focus(), 50);
}

function closeModal() {
    welcomeModal.classList.add("hidden");
    document.body.classList.remove("modal-open");
}

function handleModalContinue() {
    if (state.rsvpClosed) return;
    closeModal();
    prepareRsvpForm();
    rsvpSection.classList.remove("hidden");
    thankYouSection.classList.add("hidden");
    rsvpSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function prepareRsvpForm() {
    resetRsvpForm();
    rsvpGuestName.textContent = state.guestName;
    seatSummary.textContent = `${state.reservedSeats} ${state.reservedSeats === 1 ? "seat has" : "seats have"} been reserved for your party.`;
    populateCountOptions(attendingCountSelect, "Select number attending");
    populateCountOptions(hairMakeupCountSelect, "Select number");
    maximumSeatsText.textContent = `Maximum allowed: ${state.reservedSeats}`;
    if (state.existingRSVP && state.existingData) prefillExistingRsvp();
}

function resetRsvpForm() {
    rsvpForm.reset();
    acceptanceFields.classList.add("hidden");
    attendeeNamesSection.classList.add("hidden");
    attendeeFields.innerHTML = "";
    otherDietarySection.classList.add("hidden");
    plateSection.classList.add("hidden");
    hairMakeupSection.classList.add("hidden");
    otherDietaryInput.value = "";
    plateNumberInput.value = "";
    clearFormError();
    submitRsvpButton.disabled = false;
    submitRsvpButton.textContent = state.existingRSVP ? "Update RSVP" : "Submit RSVP";
}

function populateCountOptions(selectElement, placeholder) {
    selectElement.innerHTML = `<option value="">${placeholder}</option>`;
    for (let number = 1; number <= state.reservedSeats; number += 1) {
        selectElement.appendChild(new Option(String(number), String(number)));
    }
}

function prefillExistingRsvp() {
    const existing = state.existingData;
    const attendance = String(existing.attendance || "").toLowerCase() === "accept" ? "Accept" : "Decline";
    const attendanceRadio = document.querySelector(`input[name="attendance"][value="${attendance}"]`);
    if (attendanceRadio) attendanceRadio.checked = true;
    handleAttendanceChange();
    if (attendance !== "Accept") return;

    const count = Math.min(Math.max(Number.parseInt(existing.attendingCount, 10) || 1, 1), state.reservedSeats);
    attendingCountSelect.value = String(count);
    createAttendeeFields(count);
    String(existing.attendeeNames || "").split("|").forEach((name, index) => {
        const input = byId(`attendeeName${index + 1}`);
        if (input) input.value = name.trim();
    });
    prefillDietaryRestrictions(String(existing.dietaryRestrictions || "").split(";").map(v => v.trim()).filter(Boolean));

    const transportation = String(existing.transportation || "");
    const transportRadio = document.querySelector(`input[name="transportation"][value="${transportation}"]`);
    if (transportRadio) transportRadio.checked = true;
    plateNumberInput.value = String(existing.plateNumber || "");
    handleTransportationChange();

    const interest = String(existing.hairMakeupInterested || "No");
    const interestRadio = document.querySelector(`input[name="hairMakeupInterested"][value="${interest}"]`);
    if (interestRadio) interestRadio.checked = true;
    handleHairMakeupInterestChange();
    if (interest === "Yes") {
        hairMakeupCountSelect.value = String(existing.hairMakeupCount || "");
        hairMakeupServiceSelect.value = String(existing.hairMakeupService || "");
    }
}

function prefillDietaryRestrictions(values) {
    const known = new Set(["None","Vegetarian","Vegan","Seafood Allergy","Nut Allergy","Dairy Allergy","Gluten-Free"]);
    const unknown = [];
    values.forEach((value) => {
        const checkbox = Array.from(document.querySelectorAll('input[name="dietary"]')).find(item => item.value === value);
        if (checkbox && checkbox.value !== "Other") checkbox.checked = true;
        else if (!known.has(value)) unknown.push(value);
    });
    if (unknown.length) {
        dietaryOther.checked = true;
        otherDietarySection.classList.remove("hidden");
        otherDietaryInput.value = unknown.join("; ");
    }
    handleDietarySelection();
}

function handleAttendanceChange() {
    const accepted = getCheckedValue("attendance") === "Accept";
    clearFormError();
    acceptanceFields.classList.toggle("hidden", !accepted);
    if (accepted) {
        if (!attendingCountSelect.value) attendingCountSelect.value = "1";
        createAttendeeFields(Number.parseInt(attendingCountSelect.value, 10) || 1);
    } else {
        attendeeNamesSection.classList.add("hidden");
        attendeeFields.innerHTML = "";
        attendingCountSelect.value = "";
        clearDietarySelections();
        plateSection.classList.add("hidden");
        hairMakeupSection.classList.add("hidden");
    }
}

function handleAttendingCountChange() {
    const count = Number.parseInt(attendingCountSelect.value, 10);
    if (!count) {
        attendeeNamesSection.classList.add("hidden");
        attendeeFields.innerHTML = "";
        return;
    }
    createAttendeeFields(count);
    if (Number.parseInt(hairMakeupCountSelect.value, 10) > count) hairMakeupCountSelect.value = "";
}

function createAttendeeFields(count) {
    const current = Array.from(attendeeFields.querySelectorAll(".attendee-name-input")).map(input => input.value);
    attendeeFields.innerHTML = "";
    for (let index = 0; index < count; index += 1) {
        const wrapper = document.createElement("div");
        wrapper.className = "attendee-field";
        wrapper.innerHTML = `<label for="attendeeName${index + 1}">Attendee ${index + 1}</label><input type="text" id="attendeeName${index + 1}" class="attendee-name-input" placeholder="Full name of attendee ${index + 1}" autocomplete="name">`;
        wrapper.querySelector("input").value = current[index] || "";
        attendeeFields.appendChild(wrapper);
    }
    attendeeNamesSection.classList.remove("hidden");
}

function handleDietarySelection(event) {
    const checkboxes = Array.from(document.querySelectorAll('input[name="dietary"]'));
    if (event && event.target === dietaryNone && dietaryNone.checked) {
        checkboxes.forEach(item => { if (item !== dietaryNone) item.checked = false; });
    } else if (event && event.target !== dietaryNone && event.target.checked) {
        dietaryNone.checked = false;
    }
    handleOtherDietaryChange();
}

function handleOtherDietaryChange() {
    otherDietarySection.classList.toggle("hidden", !dietaryOther.checked);
    if (!dietaryOther.checked) otherDietaryInput.value = "";
}

function handleTransportationChange() {
    const privateCar = getCheckedValue("transportation") === "Private car";
    plateSection.classList.toggle("hidden", !privateCar);
    if (!privateCar) plateNumberInput.value = "";
}

function handleHairMakeupInterestChange() {
    const interested = getCheckedValue("hairMakeupInterested") === "Yes";
    hairMakeupSection.classList.toggle("hidden", !interested);
    if (!interested) {
        hairMakeupCountSelect.value = "";
        hairMakeupServiceSelect.value = "";
    }
}

function clearDietarySelections() {
    document.querySelectorAll('input[name="dietary"]').forEach(item => item.checked = false);
    otherDietaryInput.value = "";
    otherDietarySection.classList.add("hidden");
}

async function handleRsvpSubmit(event) {
    event.preventDefault();
    clearFormError();
    const attendance = getCheckedValue("attendance");
    if (!attendance) return showFormError("Please select whether you will be attending.");

    let payload = {
        inviteCode: state.inviteCode,
        guestName: state.guestName,
        attendance,
        attendingCount: 0,
        attendeeNames: "",
        dietaryRestrictions: "",
        transportation: "",
        plateNumber: "",
        hairMakeupInterested: "",
        hairMakeupCount: 0,
        hairMakeupService: ""
    };

    if (attendance === "Accept") {
        const validation = validateAcceptedRsvp();
        if (!validation.valid) return showFormError(validation.message);
        payload = { ...payload, ...validation.data };
    }

    setSubmitLoading(true);
    try {
        const response = await fetch(API_URL, { method: "POST", body: JSON.stringify(payload) });
        if (!response.ok) throw new Error(`Submission failed with status ${response.status}.`);
        const result = await response.json();
        if (result.rsvpClosed) return showFormError("The RSVP period has closed. Please contact Jo or Shayne directly if you need to make changes.");
        if (!result.success) throw new Error(result.message || "The RSVP could not be saved.");
        state.existingRSVP = true;
        state.existingData = payload;
        showThankYouScreen(attendance);
    } catch (error) {
        console.error(error);
        showFormError("We could not save your RSVP. Please check your connection and try again.");
    } finally {
        setSubmitLoading(false);
    }
}

function validateAcceptedRsvp() {
    const count = Number.parseInt(attendingCountSelect.value, 10);
    if (!count || count < 1 || count > state.reservedSeats) return { valid: false, message: `Please select a number between 1 and ${state.reservedSeats}.` };
    const names = Array.from(attendeeFields.querySelectorAll(".attendee-name-input")).map(input => input.value.trim());
    if (names.length !== count || names.some(name => !name)) return { valid: false, message: "Please provide the name of every attendee." };
    if (dietaryOther.checked && !otherDietaryInput.value.trim()) return { valid: false, message: "Please specify the other dietary restriction." };

    const transportation = getCheckedValue("transportation");
    if (!transportation) return { valid: false, message: "Please select how your party will travel to the wedding." };
    if (transportation === "Private car" && !plateNumberInput.value.trim()) return { valid: false, message: "Please enter the vehicle plate number." };

    const interest = getCheckedValue("hairMakeupInterested");
    if (!interest) return { valid: false, message: "Please indicate whether anyone in your party would like hair and makeup service." };
    const hmCount = Number.parseInt(hairMakeupCountSelect.value, 10) || 0;
    if (interest === "Yes" && (!hmCount || hmCount > count || !hairMakeupServiceSelect.value)) return { valid: false, message: "Please complete the hair and makeup details. The number availing cannot exceed the number attending." };

    const diets = Array.from(document.querySelectorAll('input[name="dietary"]:checked')).map(item => item.value).filter(value => value !== "Other");
    if (dietaryOther.checked) diets.push(otherDietaryInput.value.trim());

    return {
        valid: true,
        data: {
            attendingCount: count,
            attendeeNames: names.join("|"),
            dietaryRestrictions: diets.join(";"),
            transportation,
            plateNumber: transportation === "Private car" ? plateNumberInput.value.trim().toUpperCase() : "",
            hairMakeupInterested: interest,
            hairMakeupCount: interest === "Yes" ? hmCount : 0,
            hairMakeupService: interest === "Yes" ? hairMakeupServiceSelect.value : ""
        }
    };
}

function showThankYouScreen(attendance) {
    rsvpSection.classList.add("hidden");
    thankYouMessage.textContent = attendance === "Accept" ? "Your attendance has been confirmed." : "Your response has been received. Thank you for letting us know.";
    thankYouSection.classList.remove("hidden");
    thankYouSection.scrollIntoView({ behavior: "smooth", block: "center" });
}

function setLookupLoading(isLoading) {
    lookupButton.disabled = isLoading;
    inviteCodeInput.disabled = isLoading;
    lookupButton.textContent = isLoading ? "Checking..." : "Continue";
    if (isLoading) showStatusMessage("Checking your invitation code...", "loading");
}

function setSubmitLoading(isLoading) {
    submitRsvpButton.disabled = isLoading;
    submitRsvpButton.textContent = isLoading ? "Saving..." : state.existingRSVP ? "Update RSVP" : "Submit RSVP";
}

function showStatusMessage(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type || ""}`.trim();
}
function clearStatusMessage() { statusMessage.textContent = ""; statusMessage.className = "status-message"; }
function showFormError(message) { formError.textContent = message; formError.classList.remove("hidden"); formError.scrollIntoView({ behavior: "smooth", block: "center" }); }
function clearFormError() { formError.textContent = ""; formError.classList.add("hidden"); }
