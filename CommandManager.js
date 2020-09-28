class CommandManager {
	constructor(child) {
		this.child = child;
	}
	SaveServer = () => {
		return new Promise((resolve, reject) => {
			this.child.stdin.write("save-all\n");
			resolve();
		});
	};
	StopServer = async () => {
		return new Promise(async (resolve, reject) => {
			console.log("Stopping server");
			this.child.stdin.write("stop\n");
			resolve("Server Stopped");
		});
	};
	SaveServer = () => {
		return new Promise((resolve, reject) => {
			console.log("Saving server");
			this.child.stdin.write("save-all\n");
			resolve();
		});
	};
	opPlayer = (name) => {
		return new Promise((resolve, reject) => {
			console.log("Opping Player");
			this.child.stdin.write(`op ${name}\n`);
			resolve();
		});
	};
	onCommand = (command) => {
		return new Promise((resolve, reject) => {
			console.log("Issuing Command");
			this.child.stdin.write(command + "\n");
			resolve();
		});
	};
}
module.exports = CommandManager;
