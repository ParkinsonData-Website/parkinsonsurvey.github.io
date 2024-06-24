// store pd status
let pd_status = "";
// assign the user an id based on timestamp
let theid = 0;
const firebaseConfig = {
  apiKey: "AIzaSyAnlwmmb-Wc_xDpW1Vli0cEMm7hbPk_tR8",
  authDomain: "pd-website-test.firebaseapp.com",
  projectId: "pd-website-test",
  storageBucket: "pd-website-test.appspot.com",
  messagingSenderId: "497582545475",
  appId: "1:497582545475:web:aaf3986c35bf5ba414d2f6"
};

firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

// Detects the device type
function detectDeviceType() {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return 'iOS Device';
  }
  if (/android/i.test(userAgent)) {
    return 'Android Device';
  }
  if (/windows phone/i.test(userAgent)) {
    return 'Windows Phone';
  }
  if (/Macintosh|MacIntel|MacPPC|Mac68K/.test(userAgent)) {
    return 'Mac Desktop';
  }
  if (/Win32|Win64|Windows|WinCE/.test(userAgent)) {
    return 'Windows Desktop';
  }
  if (/Linux/.test(userAgent)) {
    return 'Linux Desktop';
  }
  return 'Desktop'; // Default to desktop if no match
}

// do the interactivity for the pd status selector
function storestatus(status) {
  pd_status = status; // Update the global variable
  let yesButton = document.getElementById('yesButton');
  let noButton = document.getElementById('noButton');
  let suspectedButton = document.getElementById('suspectedButton');

  // Remove the 'btn-success' class from all buttons
  yesButton.classList.remove('btn-success');
  noButton.classList.remove('btn-success');
  suspectedButton.classList.remove('btn-success');

  // Add the 'btn-success' class to the clicked button
  if (status === 'pd') {
    yesButton.classList.add('btn-success');
  } else if (status === 'suspectedpd') {
    suspectedButton.classList.add('btn-success');
  } else if (status === 'nonpd') {
    noButton.classList.add('btn-success');
  }
}

// Global variable to store the dominant hand
let dominantHand = "Right";

// Function to store the dominant hand selection
function storeHand(hand) {
  dominantHand = hand;
  let leftHandButton = document.getElementById('leftHandButton');
  let rightHandButton = document.getElementById('rightHandButton');

  // Remove the btn-success class from both buttons
  leftHandButton.classList.remove('btn-success');
  rightHandButton.classList.remove('btn-success');

  // Add the btn-success class to the selected button
  if (hand === 'Left') {
    leftHandButton.classList.add('btn-success');
  } else {
    rightHandButton.classList.add('btn-success');
  }
}

// when the user clicks start open verification window and save status
function startverify() {
  document.body.classList.add('modal-open');
  let selectedMedications = $('#medications').val() || [];
  let selectedTherapies = $('#therapies').val() || [];
  senddata(selectedMedications, selectedTherapies);
  // make the background blocker and verification dialogue visible
  let blocker = document.getElementById('blocker');
  let verify = document.getElementById('verify');
  blocker.style.display = 'block';
  blocker.style.opacity = 1;
  verify.style.display = 'block';
  $('.selectpicker').selectpicker('hide');

  let medicationTiming = document.getElementById('medicationTiming').value;
  let isNA = document.getElementById('naCheckbox').checked;
  let timingText = isNA ? "N/A" : medicationTiming + " hours ago";

  let timeSinceDiagnosis = document.getElementById('timeSinceDiagnosis').value;
  let diagnosisNA = document.getElementById('diagnosisNACheckbox').checked;
  let diagnosisText = diagnosisNA ? "N/A" : timeSinceDiagnosis + " years";

  let neuroCondition = document.getElementById('neuroCondition').value;
  let neuroConditionNA = document.getElementById('neuroConditionNA').checked;
  let neuroConditionText = neuroConditionNA ? "N/A" : neuroCondition;

  let otherHealthCondition = document.getElementById('otherHealthCondition').value;
  let otherHealthConditionNA = document.getElementById('otherHealthConditionNA').checked;
  let otherHealthConditionText = otherHealthConditionNA ? "N/A" : otherHealthCondition;

  // display demographics on the verification dialogue
  document.getElementById('aged').textContent = "Age: " + document.getElementById('age').value + " years old";
  document.getElementById('heightd').textContent = "Height: " + document.getElementById('height').value + " cm";
  document.getElementById('gend').textContent = "Gender: " + document.getElementById('gender').value;
  document.getElementById('raced').textContent = "Race: " + document.getElementById('race').value;
  document.getElementById('medicationsDisplay').textContent = "Medications: " + (selectedMedications ? selectedMedications.join(', ') : 'None');
  document.getElementById('therapiesDisplay').textContent = "Therapies: " + (selectedTherapies ? selectedTherapies.join(', ') : 'None');
  document.getElementById('medicationTimingDisplay').textContent = "Last Medication Timing: " + timingText;
  document.getElementById('timeSinceDiagnosisDisplay').textContent = "Time Since Diagnosis: " + diagnosisText;
  document.getElementById('neuroConditionDisplay').textContent = "Neurological or Motor Condition: " + neuroConditionText;
  document.getElementById('otherHealthConditionDisplay').textContent = "Other Health Condition: " + otherHealthConditionText;

  // display pd status on the dialogue
  if (pd_status === 'pd') {
    document.getElementById('pdd').textContent = "PD Status: Has PD";
  } else if (pd_status === 'suspectedpd') {
    document.getElementById('pdd').textContent = "PD Status: Suspected but not Diagnosed";
  } else {
    document.getElementById('pdd').textContent = "PD Status: Does not have PD";
  }
  document.getElementById('dominantHandDisplay').textContent = "Dominant Hand: " + dominantHand;
}

// close the verification dialogue if user wants to change anything
function closeverify() {
  document.body.classList.remove('modal-open');
  let blocker = document.getElementById('blocker');
  let verify = document.getElementById('verify');
  blocker.style.display = 'none';
  blocker.style.opacity = 0;
  verify.style.display = 'none';
  $('.selectpicker').selectpicker('show');
}

// Function to get selected options from a multi-select dropdown
function getSelectedOptions(selectId) {
  let select = document.getElementById(selectId);
  let selected = [];
  for (let option of select.options) {
    if (option.selected) {
      selected.push(option.value);
    }
  }
  return selected;
}

// senddata function to include the dominant hand
async function senddata(medications, therapies) {
  // Assuming 'userid' is already defined and retrieved from sessionStorage
  let deviceType = detectDeviceType();
  let medicationTiming = document.getElementById('medicationTiming').value;
  let isNA = document.getElementById('naCheckbox').checked;
  let timeSinceDiagnosis = document.getElementById('timeSinceDiagnosis').value;
  let diagnosisNA = document.getElementById('diagnosisNACheckbox').checked;

  // Generate a new document ID
  const docid = firebase.firestore().collection('testData').doc().id;

  // Store the docid in sessionStorage for later use
  sessionStorage.setItem('docid', docid);
  let userid = sessionStorage.getItem('userid');

  let data = {
    user: userid,
    age: document.getElementById('age').value,
    Participant_height: document.getElementById('height').value,
    gender: document.getElementById('gender').value,
    race: document.getElementById('race').value,
    medications: medications,
    therapies: therapies,
    medicationTiming: isNA ? "N/A" : medicationTiming,
    timeSinceDiagnosis: diagnosisNA ? "N/A" : timeSinceDiagnosis,
    neuroCondition: document.getElementById('neuroCondition').value,
    otherHealthCondition: document.getElementById('otherHealthCondition').value,
    status: pd_status,
    deviceType: deviceType,
    dominantHand: dominantHand
  };

  console.log('Sending data to Firestore', data);
  db.collection("testData").doc(docid).set(data, { merge: true })
    .then(() => {
      console.log("Document successfully updated");
    })
    .catch((error) => {
      console.error("Error updating document:", error);
    });
}

// redirect user to the mouse test after they verify data
async function commencetests() {
  console.log("Commence Tests is called");

  // Retrieve the userid and docid from sessionStorage
  let userid = sessionStorage.getItem('userid');
  let docid = sessionStorage.getItem('docid');

  let selectedMedications = $('#medications').val() || [];
  let selectedTherapies = $('#therapies').val() || [];

  console.log("Selected Medications: ", selectedMedications);
  console.log("Selected Therapies: ", selectedTherapies);

  document.getElementById('ttrs').textContent = "Launching...";
  // Use template literals correctly to pass userid and docid in the URL
  window.location.href = `../src/mouse.html?userid=${userid}&docid=${docid}`;
}

// Initialize event listeners and form validation
document.addEventListener('DOMContentLoaded', function () {
  $('.selectpicker').selectpicker();

  document.getElementById('submitForm').addEventListener('click', function (event) {
    event.preventDefault(); // Prevent form submission
    if (validateForm()) {
      console.log('Form is valid');
      startverify();
    }
  });

  // Handle button group selection for Parkinson's and Dominant Hand
  document.querySelectorAll('.button-group button').forEach(function (button) {
    button.addEventListener('click', function () {
      let group = this.parentElement.id;
      document.querySelectorAll('#' + group + ' button').forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      document.getElementById(group + 'Error').textContent = '';
    });
  });

  // Handle N/A checkboxes for medication timing and time since diagnosis
  document.getElementById('naCheckbox').addEventListener('change', function () {
    let medicationTimingInput = document.getElementById('medicationTiming');
    medicationTimingInput.disabled = this.checked;
    if (this.checked) {
      medicationTimingInput.value = '';
    }
  });

  document.getElementById('diagnosisNACheckbox').addEventListener('change', function () {
    let timeSinceDiagnosisInput = document.getElementById('timeSinceDiagnosis');
    timeSinceDiagnosisInput.disabled = this.checked;
    if (this.checked) {
      timeSinceDiagnosisInput.value = '';
    }
  });

  document.getElementById('neuroConditionNA').addEventListener('change', function () {
    let neuroConditionInput = document.getElementById('neuroCondition');
    neuroConditionInput.disabled = this.checked;
    if (this.checked) {
      neuroConditionInput.value = '';
    }
  });

  document.getElementById('otherHealthConditionNA').addEventListener('change', function () {
    let otherHealthConditionInput = document.getElementById('otherHealthCondition');
    otherHealthConditionInput.disabled = this.checked;
    if (this.checked) {
      otherHealthConditionInput.value = '';
    }
  });
});

function validateForm() {
  let isValid = true;

  // Validate Age
  if (!$('#age').val().trim()) {
    $('#ageError').text('Please enter your age.');
    isValid = false;
  } else {
    $('#ageError').text('');
  }

  // Validate Height
  if (!$('#height').val().trim()) {
    $('#heightError').text('Please enter your height.');
    isValid = false;
  } else {
    $('#heightError').text('');
  }

  // Validate Gender
  if ($('#gender').val() === '') {
    $('#genderError').text('Please select your gender.');
    isValid = false;
  } else {
    $('#genderError').text('');
  }

  // Validate Race/Ethnicity
  if ($('#race').val() === '') {
    $('#raceError').text('Please select your race/ethnicity.');
    isValid = false;
  } else {
    $('#raceError').text('');
  }

  // Validate Medications
  if ($('#medications').val() === null || $('#medications').val().length === 0) {
    $('#medicationsError').text('Please select your medications.');
    isValid = false;
  } else {
    $('#medicationsError').text('');
  }

  // Validate Therapies
  if ($('#therapies').val() === null || $('#therapies').val().length === 0) {
    $('#therapiesError').text('Please select your therapies.');
    isValid = false;
  } else {
    $('#therapiesError').text('');
  }

  // Validate Last Medication Timing
  if (!$('#naCheckbox').is(':checked') && !$('#medicationTiming').val().trim()) {
    $('#medicationTimingError').text('Please enter the last medication timing.');
    isValid = false;
  } else {
    $('#medicationTimingError').text('');
  }

  // Validate Parkinson's Status
  if ($('#parkinsonsStatus .active').length === 0) {
    $('#parkinsonsError').text('Please select your Parkinson’s status.');
    isValid = false;
  } else {
    $('#parkinsonsError').text('');
  }

  // Validate Time Since Diagnosis
  if (!$('#diagnosisNACheckbox').is(':checked') && !$('#timeSinceDiagnosis').val().trim()) {
    $('#timeSinceDiagnosisError').text('Please enter the time since diagnosis.');
    isValid = false;
  } else {
    $('#timeSinceDiagnosisError').text('');
  }

  // Validate Dominant Hand
  if ($('#dominantHand .active').length === 0) {
    $('#handError').text('Please select your dominant hand.');
    isValid = false;
  } else {
    $('#handError').text('');
  }

  // Validate Neurological or Motor Condition
  if (!$('#neuroConditionNA').is(':checked') && !$('#neuroCondition').val().trim()) {
    $('#neuroConditionError').text('Please enter your neurological or motor condition.');
    isValid = false;
  } else {
    $('#neuroConditionError').text('');
  }

  // Validate Other Health Condition
  if (!$('#otherHealthConditionNA').is(':checked') && !$('#otherHealthCondition').val().trim()) {
    $('#otherHealthConditionError').text('Please enter your other health condition.');
    isValid = false;
  } else {
    $('#otherHealthConditionError').text('');
  }

  return isValid;
}
