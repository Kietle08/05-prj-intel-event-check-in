// Get the form element
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");

// Track attendance
let count = 0;
const maxConst = 50;
const totalStorageKey = "totalAttendance";
const teamStoragePrefix = "teamCount_";
const attendeeStorageKey = "attendeeList";

// Page elements to update
const attendeeCount = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const greeting = document.getElementById("greeting");
const greetingModal = document.getElementById("greetingModal");
const modalMessage = document.getElementById("modalMessage");
const modalBackdrop = document.getElementById("modalBackdrop");
const attendeeList = document.getElementById("attendeeList");

const teams = [
  { key: "water", label: "Team Water Wise", emoji: "🌊" },
  { key: "zero", label: "Team Net Zero", emoji: "🌿" },
  { key: "power", label: "Team Renewables", emoji: "⚡" },
];
let attendees = [];

// Confetti container
const confettiContainer = document.createElement("div");
confettiContainer.className = "confetti-container";
document.body.appendChild(confettiContainer);

function launchConfetti() {
  const colors = ["#00a3e0", "#00c7fd", "#7ad7ff", "#0b5cab", "#3b82f6"];

  // Clear any existing confetti
  confettiContainer.innerHTML = "";

  for (let i = 0; i < 35; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";

    const left = Math.random() * 100;
    const delay = Math.random() * 0.4;
    const duration = 1.2 + Math.random() * 0.8;
    const colorIndex = Math.floor(Math.random() * colors.length);

    piece.style.left = `${left}%`;
    piece.style.backgroundColor = colors[colorIndex];
    piece.style.animationDelay = `${delay}s`;
    piece.style.animationDuration = `${duration}s`;

    confettiContainer.appendChild(piece);
  }

  setTimeout(function () {
    confettiContainer.innerHTML = "";
  }, 2200);
}

function openModal(message) {
  modalMessage.textContent = message;
  greetingModal.classList.add("is-visible");
  greetingModal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  greetingModal.classList.remove("is-visible");
  greetingModal.setAttribute("aria-hidden", "true");
}

function updateProgress() {
  const percentage = Math.round((count / maxConst) * 100);
  console.log(`Progress: ${percentage}`);
  progressBar.style.width = `${percentage}%`;
}

function loadStoredCounts() {
  const storedTotal = localStorage.getItem(totalStorageKey);

  if (storedTotal !== null) {
    count = parseInt(storedTotal, 10) || 0;
    attendeeCount.textContent = count;
    updateProgress();
  }

  for (let i = 0; i < teams.length; i++) {
    const teamKey = teams[i].key;
    const storedTeam = localStorage.getItem(teamStoragePrefix + teamKey);
    const teamCountElement = document.getElementById(teamKey + "Count");

    if (storedTeam !== null) {
      teamCountElement.textContent = parseInt(storedTeam, 10) || 0;
    }
  }
}

function saveCounts() {
  localStorage.setItem(totalStorageKey, count);

  for (let i = 0; i < teams.length; i++) {
    const teamKey = teams[i].key;
    const teamCountElement = document.getElementById(teamKey + "Count");
    localStorage.setItem(
      teamStoragePrefix + teamKey,
      teamCountElement.textContent,
    );
  }
}

function renderAttendeeList() {
  attendeeList.innerHTML = "";

  for (let i = 0; i < attendees.length; i++) {
    const attendee = attendees[i];
    addAttendeeToList(attendee.name, attendee.teamKey, attendee.teamLabel);
  }
}

function loadStoredAttendees() {
  const storedAttendees = localStorage.getItem(attendeeStorageKey);

  if (storedAttendees) {
    try {
      const parsedAttendees = JSON.parse(storedAttendees);

      if (Array.isArray(parsedAttendees)) {
        attendees = parsedAttendees;
      }
    } catch (error) {
      attendees = [];
    }
  }

  renderAttendeeList();
}

function saveAttendees() {
  localStorage.setItem(attendeeStorageKey, JSON.stringify(attendees));
}

function getTeamCount(teamKey) {
  const element = document.getElementById(teamKey + "Count");
  return parseInt(element.textContent, 10);
}

function getWinningTeams() {
  let highestCount = -1;
  let winners = [];

  for (let i = 0; i < teams.length; i++) {
    const team = teams[i];
    const currentCount = getTeamCount(team.key);

    if (currentCount > highestCount) {
      highestCount = currentCount;
      winners = [team];
    } else if (currentCount === highestCount) {
      winners.push(team);
    }
  }

  return winners;
}

function addAttendeeToList(name, teamKey, teamLabel) {
  const listItem = document.createElement("li");
  listItem.className = `attendee-item ${teamKey}`;

  const nameSpan = document.createElement("span");
  nameSpan.className = "attendee-name";
  nameSpan.textContent = name;

  const teamSpan = document.createElement("span");
  teamSpan.className = "attendee-team";
  teamSpan.textContent = teamLabel;

  listItem.appendChild(nameSpan);
  listItem.appendChild(teamSpan);
  attendeeList.appendChild(listItem);
}

modalBackdrop.addEventListener("click", function () {
  closeModal();
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeModal();
  }
});

// Handle form submission
form.addEventListener("submit", function (event) {
  event.preventDefault();

  //Get form values
  const name = nameInput.value.trim();
  const team = teamSelect.value;
  const teamName = teamSelect.selectedOptions[0].text;

  // Incrememnt count
  count++;
  console.log("Total check-ins:", count);

  console.log(name, team, teamName);

  // Update attendee total
  attendeeCount.textContent = count;

  //Update progress bar
  updateProgress();

  //Update team counter
  const teamCounter = document.getElementById(team + "Count");
  teamCounter.textContent = parseInt(teamCounter.textContent, 10) + 1;

  //Show welcome message
  const message = `🎉 Welcome, ${name} from ${teamName}`;
  console.log(message);
  greeting.textContent = message;

  // Show modal with the greeting
  openModal(message);

  // Add attendee to the list
  attendees.push({ name: name, teamKey: team, teamLabel: teamName });
  addAttendeeToList(name, team, teamName);
  saveAttendees();

  if (count === maxConst) {
    const winners = getWinningTeams();
    let celebrationMessage = "";

    if (winners.length === 1) {
      celebrationMessage = `🏆 Goal reached! ${winners[0].emoji} ${winners[0].label} wins!`;
    } else {
      const winnerNames = winners
        .map(function (winner) {
          return `${winner.emoji} ${winner.label}`;
        })
        .join(" & ");
      celebrationMessage = `🏆 Goal reached! It's a tie between ${winnerNames}!`;
    }

    greeting.textContent = celebrationMessage;
    openModal(celebrationMessage);
  }

  // Show confetti after check-in
  launchConfetti();

  // Save counts to local storage
  saveCounts();

  form.reset();
});

loadStoredCounts();
loadStoredAttendees();
