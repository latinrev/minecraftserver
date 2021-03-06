const axios = require("axios").default;
const fs = require("fs");
const Zip = require("adm-zip");
const path = require("path");
const { exec } = require("child_process");
var url;
if (!fs.existsSync(path.join(__dirname, "server_data"))) {
	fs.mkdirSync(path.join(__dirname, "server_data"));
}

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
			this.dbx.filesUpload({
				path: "/world.zip",
				contents: zip.toBuffer(),
				mode: { ".tag": "overwrite" },
			});
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
	DownloadMinecraftJar = (linkToVersion) => {
		return new Promise(async (resolve, reject) => {
			const jarFile = await axios.get(linkToVersion, { responseType: "stream" });
			jarFile.data
				.pipe(fs.createWriteStream("mcserver.jar"))
				.on("finish", () => resolve())
				.on("error", () => reject());
		});
	};
	DownloadServerMinecraftWorld = () => {
		return new Promise(async (resolve, reject) => {
			const worldFile = await this.dbx.filesDownload({ path: "/world.zip" });
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
			const serverPropertiesFile = await this.dbx.filesDownload({ path: "/server.properties" });
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
