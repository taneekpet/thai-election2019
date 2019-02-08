const tmpOnload = window.onload;
const defaultInputPartylistRepresentativeNum = 150;

let partyNameColumn, districtNameRow,
    localWonColumn, partylistWonColumn, sumWonColumn, 
    sortedResultDiv, sortedResultRow, sortType;

window.onload = function() {
  if(tmpOnload) tmpOnload();
  partyNameColumn = document.querySelector('thead tr#partyNameColumn');
  districtNameRow = document.querySelector('table tbody#districtNameRow');
  localWonColumn = document.querySelector('tbody tr#localWonColumn');
  partylistWonColumn = document.querySelector('tbody tr#partylistWonColumn');
  sumWonColumn = document.querySelector('tbody tr#sumWonColumn');
  sortedResultDiv = document.querySelector('div#sortedResult');
  sortedResultRow = document.querySelector('tbody#resultRow');
  calculationReset(defaultInputPartylistRepresentativeNum);
  sortType = ['sum',0];
}

function updateSortType(newSortType) {
  if(newSortType === sortType[0]) {
    sortType[1]++;
    sortType[1] %= 2;
  }
  else {
    sortType[0] = newSortType;
    sortType[1] = 0;
  }
  updateSortedResultUI();
}

function isInteger(evt) {
  evt = (evt) ? evt : window.event;
  var charCode = evt.which ? evt.which : evt.keyCode;
  return charCode >= 48 && charCode <= 57
}

function electionVoidUI() {
  for(let i = 1 ; i < localWonColumn.children.length ; i++) {
    localWonColumn.children[i].innerHTML = '-';
  }
  for(let i = 1 ; i < partylistWonColumn.children.length ; i++) {
    partylistWonColumn.children[i].innerHTML = '-';
  }
  for(let i = 1 ; i < sumWonColumn.children.length ; i++) {
    sumWonColumn.children[i].innerHTML = '-';
  }
  sortedResultDiv.style = 'display: none;';
}

function sortParty() {
  let sortedList = [];
  let [ type, desc ] = sortType;
  for(let key in listOfParty) {
    sortedList.push(listOfParty[key]);
  }
  sortedList.sort((a,b) => {
    switch(type) {
      case 'sum':
        return (a.localWonNum + a.partylistWonNum) - (b.localWonNum + b.partylistWonNum);
      case 'local':
        return a.localWonNum - b.localWonNum;
      case 'partylist':
        return a.partylistWonNum - b.partylistWonNum;
    }
  });
  if(desc === 0) sortedList.reverse();
  return sortedList;
}

function updateSortedResultUI() {
  //clear
  const length = sortedResultRow.children.length;
  for(let i = 0 ; i < length ; i++) {
    sortedResultRow.removeChild(sortedResultRow.children[0]);
  }

  let sortedPartiesResult = sortParty();
  sortedPartiesResult.forEach((party) => {
    let tr = document.createElement('tr');
    let th = document.createElement('th');
    th.scope = 'row';
    th.innerHTML = party.name;
    if(party.id !== '0') th.innerHTML = 'พรรค ' + th.innerHTML;
    tr.appendChild(th);

    let localTd = document.createElement('td'); 
    let partylistTd = document.createElement('td'); 
    let sumTd = document.createElement('td'); 

    localTd.innerHTML = party.localWonNum.toString();
    partylistTd.innerHTML = party.partylistWonNum.toString();
    sumTd.innerHTML = (party.localWonNum + party.partylistWonNum).toString();

    if(party.id === '0') {
      partylistTd.innerHTML = '-';
      sumTd.innerHTML = localTd.innerHTML;
    }
    tr.appendChild(localTd);
    tr.appendChild(partylistTd);
    tr.appendChild(sumTd);
    sortedResultRow.appendChild(tr);
  });
  sortedResultDiv.style = '';
}

function updateResultUI() {
  for(let i = 1 ; i < localWonColumn.children.length ; i++) {
    let id = (i-1).toString();
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
        highlightElement.style = "width: 100px; color: darkgreen; font-weight: bolder; border: 8px solid #ced4da";
      }
      else {
        highlightElement.style = "width: 100px";
      }
    }
  }

  updateSortedResultUI();
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
  newInput.style = "width: 100px";
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