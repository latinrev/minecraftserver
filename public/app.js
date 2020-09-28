q(".start-server").addEventListener("click", () =>
	fetch(`/startserver?link=${q("#version").selectedOptions[0].getAttribute("data-url")}`)
);
q(".stop-server").addEventListener("click", () => fetch(`/stopserver`));
q(".make-op-button").addEventListener("click", () => fetch(`/command?name=${q(".make-op").value}`));
q(".save-server").addEventListener("click", () => fetch(`/saveserver`));
q(".backup-server").addEventListener("click", () => fetch(`/backupserver`));
q(".command-button").addEventListener("click", () => fetch(`/command?command=${q(".command").value}`));
const serverProperties = [
	"PVP",
	"SPAWN-NPC",
	"SPAWN-ANIMALS",
	"SPAWN-MONSTERS",
	"ONLINE-MODE",
	"WHITELIST",
	"COMMAND-BLOCKS",
	"BROADCAST-CONSOLE-TO-OPS",
];
q(".properties-server").addEventListener("click", () => {
	const data = JSON.stringify([
		{ name: "motd", value: q("#MOTD").value },
		{ name: "max-players", value: q("#Max").value },
		{ name: "difficulty", value: q("#difficulty").value },
		{ name: "view-distance", value: q("#view-distance").value },
		{ name: "spawn-npcs", value: q("#SPAWN-NPC").value },
		{ name: "spawn-animals", value: q("#SPAWN-ANIMALS").value },
		{ name: "spawn-monsters", value: q("#SPAWN-MONSTERS").value },
		{ name: "online-mode", value: q("#ONLINE-MODE").value },
		{ name: "white-list", value: q("#WHITELIST").value },
		{ name: "enable-command-block", value: q("#COMMAND-BLOCKS").value },
		{ name: "broadcast-console-to-ops", value: q("#BROADCAST-CONSOLE-TO-OPS").value },
	]);
	fetch("/uploadproperties", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: data,
	});
});

document.addEventListener("DOMContentLoaded", async () => {
	createProperties();
	const properties = await (await fetch("/downloadproperties")).json();
	properties.forEach(({ property, value }) => {
		switch (property) {
			case "motd":
				q("#MOTD").value = value;
				break;
			case "max-players":
				q("#Max").value = value;
				break;
			case "difficulty":
				q("#difficulty").value = value;
				break;
			case "view-distance":
				q("#view-distance").value = value;
				break;
			case "pvp":
				q("#PVP").value = value;
				break;
			case "spawn-npcs":
				q("#SPAWN-NPC").value = value;
				break;
			case "spawn-animals":
				q("#SPAWN-ANIMALS").value = value;
				break;
			case "spawn-monsters":
				q("#SPAWN-MONSTERS").value = value;
				break;
			case "online-mode":
				q("#ONLINE-MODE").value = value;
				break;
			case "white-list":
				q("#WHITELIST").value = value;
				break;
			case "enable-command-block":
				q("#COMMAND-BLOCKS").value = value;
				break;
			case "broadcast-console-to-ops":
				q("#BROADCAST-CONSOLE-TO-OPS").value = value;
				break;
			default:
				break;
		}
	});
});

const createProperties = () => {
	serverProperties.forEach((curr) => {
		let selectorContainer = document.querySelector(".server-properties-container");
		let label = document.createElement("label");
		let selector = document.createElement("select");
		let on = document.createElement("option");
		let off = document.createElement("option");
		on.innerHTML = "true";
		off.innerHTML = "false";
		on.value = "true";
		off.value = "false";
		selector.name = curr;
		selector.id = curr;
		selector.className = "server-properties";
		label.setAttribute("for", curr);
		label.innerHTML = curr;
		selector.appendChild(on);
		selector.appendChild(off);
		selectorContainer.appendChild(label);
		selectorContainer.appendChild(selector);
	});
};
/**
 *
 * @param {Element} html
 */
function q(html) {
	return document.querySelector(html);
}
