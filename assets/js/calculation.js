//alert("JS file loaded...");

let listOfParty = {}, listOfDistrict = {};
let partyIdAssigned = 0, districtIdAssigned = 0;

let partylistRepresentativeNum = 3;

let usedPartyName = {},usedDistrictName = {};

const novote = createNewParty('ไม่ออกเสียง', 0);

//=================================================================================

function fillInputFromCSV(inputTxt) {
  try {
    let lines = inputTxt.split('\n');
    for(let i = 0 ; i < lines.length ; i++) {
      let words = lines[i].split(',');
      for(let j = 0 ; j < words.length ; j++) {
        //create party
        if(i === 0) {
          if(j === 0) continue; // # symbol
          let [ partyName, partylistApplied ] = words[j].split(':');
          createNewPartyUI(partyName, null, partylistApplied);
        }
        //create district
        else if(j === 0) {
          createNewDistrictUI(words[j]);
        }
        else {
          let district = listOfDistrict[i.toString()];
          let party = listOfParty[j.toString()];
          //change ui score
          let inputElem = document.querySelector('input#partyId_' + party.id + '_districtId_' + district.id);
          inputElem.value = words[j];
          inputElem.dispatchEvent(new Event('change'));
        }
      }
    }
  } catch(error) {
    alert('ไฟล์ไม่รองรับ');
    console.log(error);
    calculationReset(document.querySelector('input#partyListNum').value);
  }
}

//=================================================================================

function calculationReset(inputPartylistRepresentativeNum) {
  for(let id in listOfDistrict) removeDistrict(id);
  for(let id in listOfParty) removeParty(id);
  partyIdAssigned = 1;
  districtIdAssigned = 1;

  partylistRepresentativeNum = inputPartylistRepresentativeNum;

  usedPartyName = {};
  usedDistrictName = {};
  clearInput();
}

function Party(name, partylistAppliedNum) {
  if(usedPartyName[name]) throw 'Duplicate party name';
  usedPartyName[name] = true;
  this.id = (partyIdAssigned++).toString();
  this.name = name;
  this.districtAppliedList = {};
  this.partylistAppliedNum = partylistAppliedNum;
  this.partylistWonNum = 0;

  this.partyListByScore = 0;
  this.sumScore = 0;

  this.applyForDistrict = function(id) {
    if(this.districtAppliedList[id]) return false; //already applied
    if(listOfDistrict[id] == null) throw 'District not found'
    this.districtAppliedList[id] = {
      won: false,
    }
  }

  this.withdrawFromDistrict = function(id) {
    if(this.districtAppliedList[id] == null) return false; //already NOT applied
    if(listOfDistrict[id] == null) throw 'District not found'
    delete this.districtAppliedList[id];
  }

  this.countLocalWon = function() {
    this.localWonNum = 0;
    for(let districtId in this.districtAppliedList) {
      if(this.districtAppliedList[districtId].won) this.localWonNum++;
    }
  }
}

function District(name) {
  if(usedDistrictName[name]) throw 'Duplicate district name';
  usedDistrictName[name] = true;
  this.id = (districtIdAssigned++).toString();
  this.name = name;
  this.partyWon = null;
  this.score = { 0: 0 };

  this.addParty = function(id) {
    if(this.score[id]) return; //already applied
    if(listOfParty[id] == null) throw 'Party not found';
    this.score[id] = 0;
  }

  this.removeParty = function(id) {
    if(this.score[id] == null) return; //already NOT applied
    if(listOfParty[id] == null) throw 'Party not found';
    listOfParty[id].sumScore -= this.score[id];
    delete this.score[id];
  }

  this.triggerWon = function() {
    let winnerId = 0;
    let winnerScore = 0;
    for(let id in this.score) {
      listOfParty[id].districtAppliedList[this.id].won = false;
    }
    for(let id in this.score) {
      if(this.score[id] > winnerScore) {
        winnerScore = this.score[id];
        winnerId = id;
      }
    }
    let wonParty = listOfParty[winnerId];
    wonParty.districtAppliedList[this.id].won = true;
    for(let id in this.score) {
      listOfParty[id].countLocalWon();
    }
    this.partyWon = winnerId;
  }
}

function calculateResult() {
  console.log('==============');
  partylistRepresentativeNum = parseInt(document.querySelector('input#partyListNum').value);
  let numCandidate = Object.keys(listOfDistrict).length + partylistRepresentativeNum;
  let sumScore = 0;
  let partyToConsider = [];
  let sumPartyListNeed = 0;
  let partylistAssignedNum = 0;

  let decimalHandle = {};

  for(let id in listOfDistrict) {
    const district = listOfDistrict[id];
    //no vote won, discard score
    if(district.partyWon === '0') {
      for(let partyId in district.score) {
        listOfParty[partyId].sumScore -= district.score[partyId];
      }
      continue;
    }
    for(let partyId in district.score) {
      sumScore += district.score[partyId];
      //console.log(district.id,partyId,'--',district.score[partyId])
    }
  }

  if(sumScore === 0) {
    alert('เลือกตั้งเป็นโมฆะทุกเขต');
    electionVoidUI();
    return;
  }
  for(let id in listOfParty) {
    const party = listOfParty[id];
    //reset
    party.partylistWonNum = 0;
    let candidateByScore = (party.sumScore*numCandidate)/sumScore;
    if(party.localWonNum >= candidateByScore) {
      party.partyListByScore = 0;
      party.partylistWonNum = 0;
    } else {
      partyToConsider.push(party);
      //party.partyListByScore = parseInt(Math.floor(candidateByScore - party.localWonNum));
      party.partyListByScore = candidateByScore - party.localWonNum;
      sumPartyListNeed += party.partyListByScore;

      let decimal = candidateByScore - party.localWonNum - parseInt(Math.floor(candidateByScore - party.localWonNum));
      if(decimalHandle[decimal.toString()] == null) decimalHandle[decimal.toString()] = [];
      decimalHandle[decimal.toString()].push(party);
    }
    //console.log(JSON.stringify(party,null,2));
  }

  if(sumPartyListNeed > partylistRepresentativeNum) {
    partyToConsider.forEach((party) => {
      party.partyListByScore = parseInt(Math.floor(
        party.partyListByScore*partylistRepresentativeNum/sumPartyListNeed)
      );
    });
  }

  let toDeleteFromDecimalHandle = [];
  partyToConsider.forEach((party, index) => {
    let partylistNewAssigned = parseInt(
      Math.min(party.partyListByScore, party.partylistAppliedNum)
    );
    party.partylistWonNum = partylistNewAssigned;
    partylistAssignedNum += partylistNewAssigned;
    if(party.partylistWonNum === party.partylistAppliedNum) {
      toDeleteFromDecimalHandle.push(party.id);
    }
  });

  console.log(JSON.stringify(listOfParty,null,2));

  for(let key in decimalHandle) {
    decimalHandle[key].forEach((party, index) => {
      if(toDeleteFromDecimalHandle.indexOf(party.id) !== -1) {
        decimalHandle[key].splice(index,1);
      }
    });
    if(decimalHandle[key].length === 0) delete decimalHandle[key];
  }

  let decimalSort = Object.keys(decimalHandle);
  decimalSort.sort().reverse();

  //handle decimal
  let indexDecimal = 0;
  while(partylistAssignedNum < partylistRepresentativeNum && Object.keys(decimalHandle).length > 0) {
    //console.log(decimalHandle);
    //console.log(decimalSort, indexDecimal)
    let decimalVal = decimalSort[indexDecimal];
    let listOfPartyToReceive = decimalHandle[decimalVal];
    //can be assign
    if(partylistAssignedNum + listOfPartyToReceive.length <= partylistRepresentativeNum) {
      listOfPartyToReceive.forEach((party, index) => {
        party.partylistWonNum++;
        partylistAssignedNum++;
        if(party.partylistWonNum === party.partylistAppliedNum) {
          decimalHandle[decimalVal].splice(index,1);
        }
      });
    }
    else {
      //handle avg score
      let tieBreaker = [];
      listOfPartyToReceive.forEach((party) => {
        tieBreaker.push({
          party,
          avgScoreForOneSeat: party.sumScore/(party.partylistWonNum + party.localWonNum),
          random: Math.random(),
        });
      });
      tieBreaker.sort((a,b) => {
        if(a.avgScoreForOneSeat !== b.avgScoreForOneSeat) {
          return a.avgScoreForOneSeat - b.avgScoreForOneSeat;
        }
        return a.random - b.random;
      });
      let partyIndex = 0;
      while(partylistAssignedNum < partylistRepresentativeNum) {
        tieBreaker[partyIndex].party.partylistWonNum++;
        partylistAssignedNum++;
        partyIndex++;
      }
      break; //should enter this only once
    }
    indexDecimal++;
    indexDecimal %= decimalSort.length;
  }
  if(partylistAssignedNum < partylistRepresentativeNum) {
    alert('ไม่สามารถจัดสรร สส.บัญชีรายชื่อให้ครบได้');
  }
  updateResultUI();
  return false;
}

//=================================================================================

function createNewParty(name, partylistAppliedNum) {
  let newParty = new Party(name, partylistAppliedNum);
  listOfParty[newParty.id] = newParty;
  return newParty;
}

function createNewDistrict(name) {
  let newDistrict = new District(name);
  listOfDistrict[newDistrict.id] = newDistrict;
  applyPartyAtDistrict(novote, newDistrict);
  return newDistrict;
}

function removeParty(partyId) {
  if(partyId === '0') return false; // can not remove no vote

  const party = listOfParty[partyId];
  if(party == null) return false; //no party found
  //all district
  for(let id in listOfDistrict) {
    const district = listOfDistrict[id];
    withdrawPartyFromDistrict(party, district, true);
  }
  delete listOfParty[partyId];
  return true;
}

function removeDistrict(districtId) {
  const district = listOfDistrict[districtId];
  if(district == null) return false; //no district found
  //all party
  for(let id in listOfParty) {
    const party = listOfParty[id];
    withdrawPartyFromDistrict(party, district, true);
  }
  delete listOfDistrict[districtId];
  return true;
}

function applyPartyAtDistrict(party, district) {
  party.applyForDistrict(district.id);
  district.addParty(party.id);
}

function withdrawPartyFromDistrict(party, district) {
  party.withdrawFromDistrict(district.id);
  district.removeParty(party.id);
  triggerCalculate(district);
}

function setScore(party, district, score) {
  if(district.score[party.id] == null) throw 'Party did not apply at this district';
  //old score
  party.sumScore -= district.score[party.id];
  //new score
  party.sumScore += score; 
  //console.log('0000',district.score,district.id,party.id)
  district.score[party.id] = score;
  //console.log('0000',district.score)
  triggerCalculate(district);
}

function triggerCalculate(districtChanged) {
  districtChanged.triggerWon();
  calculateResult();
}

//=================================================================================
/*
//each district has 100 score

let tiger = createNewParty('Tiger', partylistRepresentativeNum);
let lion = createNewParty('Lion', partylistRepresentativeNum);
let gorilla = createNewParty('Gorilla', 0);

//console.log(listOfParty);

let one = createNewDistrict('one');
let two = createNewDistrict('two');
let three = createNewDistrict('three');

//console.log(listOfDistrict);

for(let partyId in listOfParty) {
  const party = listOfParty[partyId];
  for(let districtId in listOfDistrict) {
    const district = listOfDistrict[districtId]
    applyPartyAtDistrict(party, district);
  }
}

//console.log(listOfParty, listOfDistrict)

setScore(tiger,   one, 98);
setScore(lion,    one, 1);
setScore(gorilla, one, 1);

setScore(tiger,   two, 51);
setScore(lion,    two, 24);
setScore(gorilla, two, 25);

setScore(tiger,   three, 51);
setScore(lion,    three, 25);
setScore(gorilla, three, 24);

console.log(JSON.stringify(listOfParty,null,2), '\n', JSON.stringify(listOfDistrict,null,2))
//console.log(tiger.districtAppliedList,    tiger.partylistWonNum);
//console.log(lion.districtAppliedList,     lion.partylistWonNum);
//console.log(gorilla.districtAppliedList,  gorilla.partylistWonNum);
*/