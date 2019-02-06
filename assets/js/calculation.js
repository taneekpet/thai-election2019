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

  this.partyListByScore = 0;
  this.sumScore = 0;

  this.applyForDistrict = function(id) {
    if(this.districtAppliedList[id]) return false; //already applied
    if(!listOfDistrict[id]) throw 'District not found'
    this.districtAppliedList[id] = {
      won: false,
    }
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
    wonParty.countLocalWon();
    this.partyWon = winnerId;
  }
}

function triggerCalculate() {
  let numCandidate = localRepresentativeNum + partylistRepresentativeNum;
  let sumScore = 0;
  let partyToConsider = [];
  let sumPartyListNeed = 0;
  let partylistAssignedNum = 0;

  let decimalHandle = [];

  listOfDistrict.forEach((district) => {
    //no vote
    if(district.partyWon === 0) {
      //this district's score is void
      return;
    }
    for(let partyId in district.score) {
      sumScore += district.score[partyId];
    }
  });

  listOfParty.forEach((party) => {
    let candidateByScore = (party.sumScore*numCandidate)/sumScore;
    if(party.localWonNum >= candidateByScore) {
      party.partyListByScore = 0;
      party.partylistWonNum = 0;
    } else {
      partyToConsider.push(party);
      party.partyListByScore = parseInt(Math.floor(candidateByScore - party.localWonNum));
      sumPartyListNeed += party.partyListByScore;

      decimalHandle.push({
        party: party,
        decimal: candidateByScore - party.localWonNum - this.partyListByScore,
        avgScore: party.sumScore/(candidateByScore - party.localWonNum - this.partyListByScore),
        random: Date.now()%1000,
      });
    }
  });

  if(sumPartyListNeed > 150) {
    partyToConsider.forEach((party) => {
      party.partyListByScore = parseInt(Math.floor(
        party.partyListByScore*partylistRepresentativeNum/sumPartyListNeed)
      );
    });
  }
  partyToConsider.forEach((party) => {
    party.partylistWonNum = party.partyListByScore;
    partylistAssignedNum += party.partyListByScore;
  });

  decimalHandle.sort((a,b) => {
    if(a.decimal !== b.decimal) return a.decimal - b.decimal;
    if(a.avgScore !== b.avgScore) return a.avgScore - b.avgScore;
    return a.random - b.random;
  })

  //handle decimal
  let indexDecimal = 0;
  while(partylistAssignedNum < 150) {
    decimalHandle[indexDecimal].party.partylistWonNum++;
    partylistAssignedNum++;
    indexDecimal++;
    indexDecimal %= decimalHandle.length;
  }
}

//=================================================================================

function createNewParty(name, partylistAppliedNum) {
  let newParty = new Party(name, partylistAppliedNum);
  listOfParty.push(newParty);
  return newParty;
}

function createNewDistrict(name) {
  let newDistrict = new District(name);
  applyPartyAtDistrict(novote, newDistrict);
  return newDistrict;
}

function applyPartyAtDistrict(party, district) {
  party.applyForDistrict(district.id);
  district.addParty(party.id);
}

function setScore(party, district, score) {
  if(!district.score[party.id]) throw 'Party did not apply at this district';
  //old score
  party.sumScore -= district.score[party.id];
  //new score
  party.sumScore += score; 
  district.score[party.id] = score;
  district.triggerWon();
  triggerCalculate();
}