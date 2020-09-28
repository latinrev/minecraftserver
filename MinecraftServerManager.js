const axios = require("axios").default;
const fs = require("fs");
const Zip = require("adm-zip");
const path = require("path");
const { exec } = require("child_process");
var url;

const tc = (promise) => {
	return promise.then((data) => [data, undefined]).catch((error) => Promise.resolve([undefined, error]));
};
WriteServerProperties = (binary) => {
	return new Promise(async (resolve, reject) => {
		fs.writeFile(path.join(__dirname, "server_data", "server.properties"), binary, () => resolve());
	});
};

ExecuteServerJar = async () => {
	return new Promise(async (resolve, reject) => {
		console.log("Starting Server");
		console.log(path.join(__dirname, "mcserver.jar"));
		const child = exec("java -Xms32m -Xmx512M -jar " + path.join(__dirname, "mcserver.jar") + " nogui", {
			cwd: path.join(__dirname, "server_data"),
		});
		child.stdout.on("data", (data) => {
			if (data.indexOf("Done") !== -1) {
				resolve(child);
				console.log("Server has started, now joinable");
			}
			console.log(data);
		});
		child.stderr.on("data", (data) => {
			console.log(data);
		});
	});
};
DownloadMinecraftJar = (linkToVersion) => {
	return new Promise(async (resolve, reject) => {
		const [jarFile, err] = tc(await axios.get(linkToVersion, { responseType: "stream" }));
		if (err) reject("Couldn't Download minecraft Jar");
		jarFile.data
			.pipe(fs.createWriteStream("mcserver.jar"))
			.on("finish", () => resolve())
			.on("error", () => reject());
	});
};

class ServerManager {
	constructor(dbx, ngrok) {
		this.dbx = dbx;
		this.ngrok = ngrok;
	}
	StartServer = async () => {
		return new Promise(async (resolve, reject) => {
			await this.ngrok.Start();
			url = this.ngrok.GetUrl();
			console.log(url);
			console.log("Executing server");
			this.createServerConfig();
			const child = await ExecuteServerJar();
			resolve(child);
		});
	};
	BackupServer = () => {
		return new Promise(async (resolve, reject) => {
			console.log("Beginning server backup");
			var zip = new Zip();
			zip.addLocalFolder(path.join(__dirname, "server_data"));
			const [suc, err] = await tc(
				this.dbx.filesUpload({
					path: "/world.zip",
					contents: zip.toBuffer(),
					mode: { ".tag": "overwrite" },
				})
			);
			if (err) reject("Couldn't backup Minecraft World / Server " + err.response);
			resolve("Backup Complete");
		});
	};
	InitializeServerFolder = () => {
		if (!fs.existsSync(path.join(__dirname, "server_data"))) {
			fs.mkdirSync(path.join(__dirname, "server_data"));
		}
	};
	createServerConfig = () => {
		return new Promise(async (resolve, reject) => {
			fs.writeFile(path.join(__dirname, "server_data", "eula.txt"), "eula=true", (err) => {
				if (err) reject(err.response);
			});
			const serverPropertiesFile = await this.dbx.filesDownload({ path: "/server.properties" });
			fs.writeFile(
				path.join(__dirname, "server_data", "server.properties"),
				serverPropertiesFile.fileBinary,
				(err) => {
					if (err) reject(err.response);
					resolve();
				}
			);
		});
	};
	DownloadServerMinecraftWorld = () => {
		return new Promise(async (resolve, reject) => {
			const [worldFile, err] = await tc(this.dbx.filesDownload({ path: "/world.zip" }));
			if (err) reject("Couldn't Download Minecraft World " + err.response);
			var zip = new Zip(worldFile.fileBinary);
			console.log("Extracting world");
			zip.extractAllToAsync(path.join(__dirname, "server_data"), true, (err) => {
				if (err) reject(err.response);
				resolve();
			});
		});
	};
	DownloadServerProperties = () => {
		return new Promise(async (resolve, reject) => {
			const [serverPropertiesFile, err] = await tc(this.dbx.filesDownload({ path: "/server.properties" }));
			if (err) reject("Couldn't Download Properties " + err.response);
			WriteServerProperties(serverPropertiesFile.fileBinary);
			fs.readFile(path.join(__dirname, "server_data", "server.properties"), "utf8", (err, data) => {
				const properties = JSON.stringify(
					data.split("\n").map((propRaw) => {
						const [property, value] = propRaw.split("=");
						return { property, value };
					})
				);
				resolve(properties);
			});
		});
	};

	UploadServerProperties = (properties) => {
		return new Promise(async (resolve, reject) => {
			const basePath = path.join(__dirname, "server.properties");
			let stringProp = "";
			properties.forEach((property) => (stringProp += `${property.name}=${property.value}\n`));
			console.log(properties);
			fs.writeFile(basePath, stringProp, () => {});
			fs.readFile(basePath, "utf8", (err, res) => {
				this.dbx
					.filesUpload({
						path: "/server.properties",
						contents: res,
						mode: { ".tag": "overwrite" },
					})
					.then((res) => {
						console.log("updated properties");
						resolve();
					});
			});
		});
	};
}
module.exports = ServerManager;

/*
}; */
