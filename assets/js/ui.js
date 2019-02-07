const tmpOnload = window.onload;
const defaultInputPartylistRepresentativeNum = 150;

let partyNameColumn, districtNameRow,
    localWonColumn, partylistWonColumn, sumWonColumn;

window.onload = function() {
  if(tmpOnload) tmpOnload();
  partyNameColumn = document.querySelector('thead tr#partyNameColumn');
  districtNameRow = document.querySelector('table tbody#districtNameRow');
  localWonColumn = document.querySelector('tbody tr#localWonColumn');
  partylistWonColumn = document.querySelector('tbody tr#partylistWonColumn');
  sumWonColumn = document.querySelector('tbody tr#sumWonColumn');
  calculationReset(defaultInputPartylistRepresentativeNum);
}

function isInteger(evt) {
  evt = (evt) ? evt : window.event;
  var charCode = evt.which ? evt.which : evt.keyCode;
  return charCode >= 48 && charCode <= 57
}

function updateResultUI() {
  for(let i = 1 ; i < localWonColumn.children.length ; i++) {
    let id = (i-1).toString();
    console.log(id, listOfParty)
    localWonColumn.children[i].innerHTML = listOfParty[id].localWonNum;
  }
  for(let i = 1 ; i < partylistWonColumn.children.length ; i++) {
    let id = (i-1).toString();
    partylistWonColumn.children[i].innerHTML = listOfParty[id].partylistWonNum;
  }
  for(let i = 1 ; i < sumWonColumn.children.length ; i++) {
    let id = (i-1).toString();
    sumWonColumn.children[i].innerHTML = listOfParty[id].localWonNum + listOfParty[id].partylistWonNum;
  }
  for(let i = 0 ; i < districtNameRow.children.length - 3 ; i++) {
    let districtElement = districtNameRow.children[i];
    let districtId = districtElement.id;
    for(let j = 1 ; j < districtElement.children.length ; j++) {
      let partyObject = listOfParty[(j-1).toString()];
      let highlightElement = districtElement.children[j].children[0];
      if(partyObject.districtAppliedList[districtId].won) {
        highlightElement.style = "width: 75px; color: darkgreen; font-weight: bolder; border: 8px solid #ced4da";
      }
      else {
        highlightElement.style = "width: 75px";
      }
    }
  }
}

function clearInput() {
  document.querySelector('input#partyListNum').value = defaultInputPartylistRepresentativeNum;
  //clear
  for(let i = 1 ; i < partyNameColumn.children.length ; i++) {
    const child = partyNameColumn.children[i];
    partyNameColumn.removeChild(child);
  }
  for(let i = 1 ; i < localWonColumn.children.length ; i++) {
    const child = localWonColumn.children[i];
    localWonColumn.removeChild(child);
  }
  for(let i = 1 ; i < partylistWonColumn.children.length ; i++) {
    const child = partylistWonColumn.children[i];
    partylistWonColumn.removeChild(child);
  }
  for(let i = 1 ; i < sumWonColumn.children.length ; i++) {
    const child = sumWonColumn.children[i];
    sumWonColumn.removeChild(child);
  }
  createNewPartyUI(novote.name);
}

function createNewScoreInput(party, district) {
  applyPartyAtDistrict(party, district);
  let newInput = document.createElement('input');
  newInput.type = 'number';
  newInput.className = 'form-control';
  newInput.onkeypress = function(event) {
    return isInteger(event);
  }
  newInput.addEventListener('change', () => {
    setScore(party, district, parseInt(newInput.value));
  });
  newInput.value = 0;
  newInput.style = "width: 75px";
  return newInput;
}

function createNewPartyUI(name, partyId = '0') {
  if(name !== novote.name) {
    name = document.querySelector('input#newPartyName').value;
    let applied = document.querySelector('input#newPartyNumPartylist').value;
    if(applied === '') {
      alert('ใส่จำนวนผู้สมัครสส.บัญชีรายชื่อให้พรรคที่จะเพิ่ม');
      return;
    }
    let partylistAppliedNum = parseInt(applied);
    partyId = createNewParty(name, partylistAppliedNum).id;
  }
  //create UI
  let newPartyUI = document.createElement('th');
  newPartyUI.scope = 'col';
  newPartyUI.id = partyId;
  newPartyUI.innerHTML = name === novote.name ? name : 'พรรค ' + name;
  partyNameColumn.appendChild(newPartyUI);

  for(let i = 0 ; i < districtNameRow.children.length ; i++) {
    let child = districtNameRow.children[i];
    let district = listOfDistrict[child.id];
    let newScore = document.createElement('td');
    if(i < districtNameRow.children.length - 3) {
      newScore.appendChild(createNewScoreInput(listOfParty[partyId], district));
    }
    else newScore.innerHTML = 0;
    child.appendChild(newScore);
  }
  return false;
}

function createNewDistrictUI() {
  let name = document.querySelector('input#newDistrictName').value;
  let districtId = createNewDistrict(name).id;
  //create UI
  let newDistrictUI = document.createElement('tr');
  newDistrictUI.id = districtId;
  let newDistrictInnerUI = document.createElement('th');
  newDistrictInnerUI.scope = 'row';
  newDistrictInnerUI.innerHTML = 'เขต ' + name;
  newDistrictUI.appendChild(newDistrictInnerUI);
  for(let i = 1 ; i < partyNameColumn.children.length ; i++) {
    let party = listOfParty[partyNameColumn.children[i].id];
    let newScore = document.createElement('td');
    newScore.appendChild(createNewScoreInput(party, listOfDistrict[districtId]));
    newDistrictUI.appendChild(newScore);
  }
  districtNameRow.insertBefore(
    newDistrictUI, 
    districtNameRow.children[districtNameRow.children.length - 3]
  );
  return false;
}