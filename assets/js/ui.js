const defaultInputPartylistRepresentativeNum = 150;

window.onload = function() {
  window.onload();
  clearInput();
}

function isInteger(evt) {
  evt = (evt) ? evt : window.event;
  var charCode = evt.which ? evt.which : evt.keyCode;
  return charCode >= 48 && charCode <= 57
}

function clearInput() {
  document.querySelector('input#partyListNum').value = defaultInputPartylistRepresentativeNum;
  //clear
  calculationReset(defaultInputPartylistRepresentativeNum)
}

function createNewPartyUI() {
  let name = document.querySelector('input#newPartyName').value;
  let partylistAppliedNum = parseInt(document.querySelector('input#newPartyNumPartylist').value);
  let partyId = createNewParty(name, partylistAppliedNum).id;
  //create UI
  return false;
}

function createNewDistrictUI() {
  let name = document.querySelector('input#newDistrictName').value;
  let districtId = createNewDistrict(name).id;
  //create UI
  return false;
}