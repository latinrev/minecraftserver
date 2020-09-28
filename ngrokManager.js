const ngrok = require("ngrok");
class Ngrok {
  constructor(proto, token, port) {
    this.proto = proto;
    this.authtoken = token;
    this.addr = port;
    this.generatedUrl;
  }
  Start = () => {
    return ngrok
      .connect({
        proto: this.proto,
        authtoken: this.authtoken,
        addr: this.addr,
      })
      .then((res) => (this.generatedUrl = res));
  };
  GetUrl = () => {
    return this.generatedUrl;
  };
  Stop = () => {
    return ngrok.disconnect();
  };
}
module.exports = Ngrok;
