#!/usr/bin/env node

const readline = require("readline");
readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) process.stdin.setRawMode(true);
const CLIENT_ID = "YOUR_CLIENT_KEY";
const CLIENT_SECRET = "YOUR_SECRET_KEY";
const axios = require("axios").default;
axios.defaults.baseURL = "https://openapi.naver.com/v1/papago/n2mt";
axios.defaults.headers["X-Naver-Client-Id"] = CLIENT_ID;
axios.defaults.headers["X-Naver-Client-Secret"] = CLIENT_SECRET;
axios.defaults.headers.post["Content-Type"] =
  "application/x-www-form-urlencoded; charset=UTF-8";

const korean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;

let str = [];
process.stdin.on("keypress", (chunk, key) => {
  if (key.sequence == "\x7F") str.pop();
  else if (key.sequence == "\r" || key.sequence == "\n") str.push("\n");
  else str.push(chunk);
  print();
  chkTimeout(900);
  if (key && key.name == "c" && key.ctrl) process.exit();
});

function toString() {
  return str.join("");
}
function print() {
  console.clear();
  process.stdout.write(`${toString() + "\n" + translated}`);
}

let lastType = null;
let timeout = null;
let translated = "";
function chkTimeout(delay) {
  if (lastType && timeout && Date.now() - lastType < delay) {
    clearInterval(timeout);
  }
  lastType = Date.now();
  timeout = setTimeout(() => {
    const reqTxt = toString();
    const isKorean = korean.test(reqTxt);
    const source = isKorean ? "ko" : "en";
    const target = isKorean ? "en" : "ko";
    axios
      .post(axios.defaults.baseURL, {
        source,
        target,
        text: reqTxt,
      })
      .then((response) => {
        translated = response.data.message.result.translatedText;
        print();
      })
      .catch((err) => {
        translated = "[Error]";
      });
  }, delay);
}
