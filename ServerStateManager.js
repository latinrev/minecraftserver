const STATES = {
	stopped: "0",
	starting: "1",
	started: "2",
};
function State() {
	let currentState = { stopped: "0" };
	return {
		ChangeState: (state) => {
			currentState = state;
		},
		CurrentState: () => {
			return currentState;
		},
		IsOnline: (currentState) => {
			if (currentState !== STATES.started) {
				console.log("The server has to be online to perform actions");
				return false;
			}
			return true;
		},
		isStarting: (currentState) => {
			if (currentState === STATES.starting) {
				console.log("The server is starting");
				return true;
			}
			return false;
		},
	};
}
module.exports = { State, STATES };
