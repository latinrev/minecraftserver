require("dotenv").config();
//DROPBOX
var Dropbox = require("dropbox").Dropbox;
const fetch = require("isomorphic-fetch");
var dbx = new Dropbox({
	fetch: fetch,
	accessToken: process.env.DROPBOX_TOKEN,
});
//Ngrok
const Ngrok = require("./ngrokManager");
const ngrok = new Ngrok("tcp", process.env.NGROK_TOKEN, "25565");

//KEEPING ALIVE SERVER AND BACKUPS
const Cron = require("cron").CronJob;
const axios = require("axios");
//Initialize Cronjob
var keepAlive = new Cron({
	cronTime: "*/5 * * * *",
	onTick: async () => {
		await BackupServer();
		await axios.get("https://mcserverdmj.herokuapp.com/");
		console.log("Pinging each 5 minutes");
	},
	start: false,
});
//Managers
const { State, STATES } = require("./ServerStateManager");
const CommandManager = require("./CommandManager");
const Eonil = require("eonil");
const MinecraftServerManager = require("./MinecraftServerManager");

//Instances
const state = State();
const app = new Eonil({ port: process.env.PORT, directory: "./public" }).StartServer().GetApp();
const express = require("express");
app.use(express.json({}));
const MSM = new MinecraftServerManager(dbx, ngrok);
let CM;

app.get("/startserver", async (req, res) => {
	const { link: minecraftJarLink } = req.query;
	if (!state.IsOnline(state.CurrentState())) {
		state.ChangeState(STATES.starting);
		await MSM.DownloadMinecraftJar(minecraftJarLink);
		console.log("Finished piping");
		await MSM.DownloadMinecraftWorld();
		console.log("Finished downloading world");
		CM = new CommandManager(await MSM.StartServer());
		console.log("Starting server");
		state.ChangeState(STATES.started);
		keepAlive.start();
	}
});

app.get("/stopserver", async (req, res) => {
	if (state.IsOnline(state.CurrentState())) {
		await CM.StopServer();
		state.ChangeState(STATES.stopped);
		keepAlive.stop();
	}
});
app.get("/saveserver", async (req, res) => {
	if (state.IsOnline(state.CurrentState())) {
		await CM.SaveServer();
	}
});
app.get("/backupserver", async (req, res) => {
	if (state.IsOnline(state.CurrentState())) {
		await CM.SaveServer();
		await MSM.BackupServer();
	}
});
app.get("/command", async (req, res) => {
	const { command, name } = req.query;
	if (state.IsOnline(state.CurrentState())) {
		if (command) await CM.onCommand(command);
		if (name) await CM.opPlayer(name);
	}
});
app.get("/downloadproperties", async (req, res) => {
	const properties = await MSM.DownloadServerProperties();
	res.send(properties);
});
app.post("/uploadproperties", async (req, res) => {
	await MSM.UploadServerProperties(req.body);
});
