// this file powers the data collector for demographics, and send the data to the database


// store pd status
let pd_status = "";
// assign the user an id based on timestamp
let theid = 0;

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
function startverify(){
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

  // display demographics on the verification dialogue
  document.getElementById('aged').textContent = "Age: "+document.getElementById('age').value+" years old";
  document.getElementById('heightd').textContent = "Height: " + document.getElementById('height').value + " cm";
  document.getElementById('gend').textContent = "Gender: "+document.getElementById('gender').value;
  document.getElementById('raced').textContent = "Race: "+document.getElementById('race').value;
  document.getElementById('medicationsDisplay').textContent = "Medications: " + (selectedMedications ? selectedMedications.join(', ') : 'None');
  document.getElementById('therapiesDisplay').textContent = "Therapies: " + (selectedTherapies ? selectedTherapies.join(', ') : 'None');
  document.getElementById('medicationTimingDisplay').textContent = "Last Medication Timing: " + timingText;

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
function closeverify(){
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


//senddata function to include the dominant hand
async function senddata() {
  let userid = new Date().getTime().toString();
  console.log("senddata function called");
}


// redirect user to the mouse test after they verify data
function commencetests(){
  // nah just send it directly
  //http://localhost:3000/?PDINFO&user=person4&age=65&gender=male&race=asian&status=nonpd
  console.log("commencetests function called");
  
  document.getElementById('ttrs').textContent = "Launching...";
  
  window.open('../src_practice/mouse.html?'+theid,'_self');

}