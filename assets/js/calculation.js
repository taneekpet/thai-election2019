alert("JS file loaded...");

const listOfParty = [];
const listOfDistrict = [];

const localRepresentativeNum = 350;
const partylistRepresentativeNum = 150;

const usedPartyName = {};
const usedDistrictName = {};

const novote = createNewParty('NO VOTE', 0);

//=================================================================================

function Party(name, partylistAppliedNum) {
  if(usedPartyName[name]) throw 'Duplicate party name';
  usedPartyName[name] = true;
  this.id = listOfParty.length;
  this.name = name;
  this.districtAppliedList = {};
  this.partylistAppliedNum = partylistAppliedNum;
  this.partylistWonNum = 0;

  this.applyForDistrict = function(id) {
    if(this.districtAppliedList[id]) return false; //already applied
    if(!listOfDistrict[id]) throw 'District not found'
    this.districtAppliedList[id] = {
      won: false,
    }
  }
}

function District(name) {
  if(usedDistrictName[name]) throw 'Duplicate district name';
  usedDistrictName[name] = true;
  this.id = listOfDistrict.length;
  this.name = name;
  this.partyWon = null;
  this.score = { 0: 0 };

  this.addParty = function(id) {
    if(this.score[id]) return; //already applied
    if(!listOfParty[id]) throw 'Party not found';
    this.score[id] = 0;
  }

  this.triggerWon = function() {
    let winnerId = 0;
    let winnerScore = 0;
    for(let id in this.score) {
      listOfParty[id].districtAppliedList[this.id].won = false;
      if(this.score[id] > winnerScore) {
        winnerScore = this.score[id];
        winner = id;
      }
    }
    let wonParty = listOfParty[winnerId];
    wonParty.districtAppliedList[this.id].won = true;
    this.partyWon = winnerId;
  }
}

function triggerCalculate() {
  //to be done
}

//=================================================================================

function createNewParty(name, partylistAppliedNum) {
  let newParty = new Party(name, partylistAppliedNum);
  listOfParty.push(newParty);
  return newParty;
}

function createNewDistrict(name) {
  let newDistrict = new District(name);
  //apply no vote
  applyPartyAtDistrict(novote, newDistrict);
  return newDistrict;
}

function applyPartyAtDistrict(party, district) {
  party.applyForDistrict(district.id);
  district.addParty(party.id);
}

function setScore(party, district, score) {
  if(!district.score[party.id]) throw 'Party did not apply at this district';
  district.score[party.id] = score;
  district.triggerWon();
  triggerCalculate();
}