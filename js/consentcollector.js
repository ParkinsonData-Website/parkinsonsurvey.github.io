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

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('consentForm').addEventListener('submit', function(event) {
   
    event.preventDefault(); // Prevent default form submission

    // Clear previous error messages
    clearErrors();

    // Form validation
    var isValid = true;
    var participantName = document.getElementById('participantName').value.trim();
    var participantSignature = document.getElementById('participantSignature').value.trim();
    var consentDate = document.getElementById('consentDate').value;
    var consentCheck = document.getElementById('consentCheck').checked;

    if (!participantName) {
        document.getElementById('nameError').textContent = 'This field is required';
        isValid = false;
    }
    if (!participantSignature) {
        document.getElementById('signatureError').textContent = 'This field is required';
        isValid = false;
    }
    if (!consentDate) {
        document.getElementById('dateError').textContent = 'This field is required';
        isValid = false;
    }
    if (!consentCheck) {
        document.getElementById('consentCheckError').textContent = 'You must agree before submitting';
        isValid = false;
    }

    if (!isValid) {
        return; // Stop the form submission if validation fails
    }

    // Proceed with storing consent information in Firebase if validation passes
    storeConsent(participantName, participantSignature, consentDate, consentCheck);


function clearErrors() {
    document.getElementById('nameError').textContent = '';
    document.getElementById('signatureError').textContent = '';
    document.getElementById('dateError').textContent = '';
    document.getElementById('consentCheckError').textContent = '';
}

function storeConsent(name, signature, date, consentGiven) {
    db.collection("consents").add({
        name: name,
        signature: signature,
        date: date,
        consentGiven: consentGiven
    })
    .then(() => {
        console.log("Document successfully updated");
        window.location.href = '../src/collectinfo.html';
    })
    .catch((error) => {
        console.error("Error updating document:", error);
    });
}

});
});
