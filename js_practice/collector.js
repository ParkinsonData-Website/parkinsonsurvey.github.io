// Store PD status and dominant hand as global variables
let pd_status = "";
let dominantHand = "Right";

// Assign the user an ID based on timestamp
let theid = new Date().getTime().toString();

// Detects the device type
function detectDeviceType() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) return 'iOS Device';
  if (/android/i.test(userAgent)) return 'Android Device';
  if (/windows phone/i.test(userAgent)) return 'Windows Phone';
  if (/Macintosh|MacIntel|MacPPC/.test(userAgent)) return 'Mac Desktop';
  if (/Win32|Win64|Windows|WinCE/.test(userAgent)) return 'Windows Desktop';
  if (/Linux/.test(userAgent)) return 'Linux Desktop';
  return 'Desktop';
}

// Store the PD status selected by the user
function storestatus(status) {
  pd_status = status; 
  document.getElementById('yesButton').classList.toggle('btn-success', status === 'pd');
  document.getElementById('noButton').classList.toggle('btn-success', status === 'nonpd');
  document.getElementById('suspectedButton').classList.toggle('btn-success', status === 'suspectedpd');
}

// Store the dominant hand selected by the user
function storeHand(hand) {
  dominantHand = hand;
  document.getElementById('leftHandButton').classList.toggle('btn-success', hand === 'Left');
  document.getElementById('rightHandButton').classList.toggle('btn-success', hand === 'Right');
}

// When the user clicks start, open the verification window and save status
function startverify() {
  document.body.classList.add('modal-open');
  let selectedMedications = $('#medications').val() || [];
  let selectedTherapies = $('#therapies').val() || [];
  senddata(selectedMedications, selectedTherapies);

  // Make the background blocker and verification dialogue visible
  let blocker = document.getElementById('blocker');
  let verify = document.getElementById('verify');
  blocker.style.display = 'block';
  blocker.style.opacity = 1;
  verify.style.display = 'block';
  $('.selectpicker').selectpicker('hide');

  // Handle medication timing
  let medicationTiming = document.getElementById('medicationTiming').value;
  let isNA = document.getElementById('naCheckbox').checked;
  let timingText = isNA ? "N/A" : medicationTiming + " hours ago";

  // Handle time since diagnosis
  let timeSinceDiagnosis = document.getElementById('timeSinceDiagnosis').value;
  let diagnosisNA = document.getElementById('diagnosisNACheckbox').checked;
  let diagnosisText = diagnosisNA ? "N/A" : timeSinceDiagnosis + " years";

  // Handle neurological or motor condition
  let neuroCondition = document.getElementById('neuroCondition').value;
  let neuroConditionNA = document.getElementById('neuroConditionNA').checked;
  let neuroConditionText = neuroConditionNA ? "N/A" : neuroCondition;

  // Handle other health condition
  let otherHealthCondition = document.getElementById('otherHealthCondition').value;
  let otherHealthConditionNA = document.getElementById('otherHealthConditionNA').checked;
  let otherHealthConditionText = otherHealthConditionNA ? "N/A" : otherHealthCondition;

  // Display demographics on the verification dialogue
  document.getElementById('aged').textContent = "Age: " + document.getElementById('age').value + " years old";
  document.getElementById('heightd').textContent = "Height: " + document.getElementById('height').value + " cm";
  document.getElementById('gend').textContent = "Gender: " + document.getElementById('gender').value;
  document.getElementById('raced').textContent = "Race: " + document.getElementById('race').value;
  document.getElementById('medicationsDisplay').textContent = "Medications: " + (selectedMedications.length ? selectedMedications.join(', ') : 'None');
  document.getElementById('therapiesDisplay').textContent = "Therapies: " + (selectedTherapies.length ? selectedTherapies.join(', ') : 'None');
  document.getElementById('medicationTimingDisplay').textContent = "Last Medication Timing: " + timingText;
  document.getElementById('timeSinceDiagnosisDisplay').textContent = "Time Since Diagnosis: " + diagnosisText;
  document.getElementById('neuroConditionDisplay').textContent = "Neurological or Motor Condition: " + neuroConditionText;
  document.getElementById('otherHealthConditionDisplay').textContent = "Other Health Condition: " + otherHealthConditionText;

  // Display PD status on the dialogue
  if (pd_status === 'pd') {
    document.getElementById('pdd').textContent = "PD Status: Has PD";
  } else if (pd_status === 'suspectedpd') {
    document.getElementById('pdd').textContent = "PD Status: Suspected but not Diagnosed";
  } else {
    document.getElementById('pdd').textContent = "PD Status: Does not have PD";
  }
  document.getElementById('dominantHandDisplay').textContent = "Dominant Hand: " + dominantHand;
}

// Close the verification dialogue if the user wants to change anything
function closeverify() {
  document.body.classList.remove('modal-open');
  let blocker = document.getElementById('blocker');
  let verify = document.getElementById('verify');
  blocker.style.display = 'none';
  blocker.style.opacity = 0;
  verify.style.display = 'none';
  $('.selectpicker').selectpicker('show');
}

// Send data function to include the dominant hand
async function senddata() {
  let userid = new Date().getTime().toString();
  console.log("senddata function called");
}

// Redirect user to the mouse test after they verify data
function commencetests() {
  console.log("commencetests function called");
  document.getElementById('ttrs').textContent = "Launching...";
  window.open('../src_practice/mouse.html?' + theid, '_self');
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
