const { Router } = require("express");
const {
  registerVoter,
  loginVoter,
  getVoter,
} = require("../controllers/voterController");


const {
  addElection,
  getElections,
  getElection,
  removeElection,
  updateElection,
  getCandidatesElection,
  getElectionVoters,
} = require("../controllers/electionController");


const {
  addCandidate,
  getCandidate,
  removeCandidate,
  voteCandidate,
} = require("../controllers/candidatesController");


const router = Router();

// Voter Routes
router.post("/voters/register", registerVoter);
router.post("/voters/login", loginVoter);
router.get("/voters/:id", getVoter);

// Election Routes (admin)
router.post("/elections", addElection);
router.patch("/elections/:id", updateElection);
router.delete("/elections/:id", removeElection);

// Election all
router.get("/elections", getElections);
router.get("/elections/:id", getElection);
router.get("/elections/:id/candidates", getCandidatesElection);
router.get("/elections/:id/voters", getElectionVoters);

// Candidates Routes
router.post("/candidates", addCandidate);
router.get("/candidates/:id", getCandidate);
router.delete("/candidates/:id", removeCandidate);
router.patch("/candidates/:id", voteCandidate);


module.exports = router;

