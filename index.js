const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// ================ 你只需要改这里 4 个 ==================
const COZE_URL = "https://xznyfx4gzp.coze.site/stream_run";
const COZE_TOKEN = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjhkMjgyYTVkLWJlMmUtNDViOS1hODFkLWM4ZGI3MTU5MmExOSJ9.eyJpc3MiOiJodHRwczovL2FwaS5jb3plLmNuIiwiYXVkIjpbInlFNlFhRnJUQTU3TVVMSnhzZEdlTTRxVjdIdzZjMUhWIl0sImV4cCI6ODIxMDI2Njg3Njc5OSwiaWF0IjoxNzc0NDAzMzMwLCJzdWIiOiJzcGlmZmU6Ly9hcGkuY296ZS5jbi93b3JrbG9hZF9pZGVudGl0eS9pZDo3NjE5NTM3NDE0MjU1NTQyMjk5Iiwic3JjIjoiaW5ib3VuZF9hdXRoX2FjY2Vzc190b2tlbl9pZDo3NjIxMDA0Mjc1NTYwMjE4NjY1In0.raKGPybtv5_B0YQlW5IEfLELZi6Gxi2SFOLlcW_sKkwb0LZyywssUZ7Mel90ocQRxSfpNu27apuOAIddzB4sqVnfZacd6OwyYz9k2d_F8J8gS4bkQfNAkhQxfPu9d577grplRR1DUcjappC5k5Nb505QRtbb0LPpk9mnrD_4ygoP45U9-NGnaLrkweodCL-Hr31ElYqVdH5U2B_KMCcpTkINVQnm4SzIsOS9ioBYKH7UFZYJHoIP8OpcHwmv19Vwq2y2rNfupEX3nTStVCj9wHiv0wIPU9UHiCRGDzbKsk2sxh7_fPVoDBbRTsMel8ulgUXB10Vu477s1y8JK9P3mw";
const COZE_PROJECT_ID = "7619532867261349934";

const WECOM_TOKEN = "MQ6KYK3YakXYSIkrfE2w";
const WECOM_AES_KEY = "LFyxiWIbzymOHB9ho7eoutrucTX7xqh8clCfVW2lcHQ";
// ======================================================

// 企业微信URL验证
app.get('/', (req, res) => {
  const echostr = req.query.echostr;
  res.send(echostr);
});

// 接收消息 + 调用Coze + 回复
app.post('/', async (req, res) => {
  try {
    const encrypt = req.body.encrypt;
    const decoded = decrypt(encrypt, WECOM_AES_KEY);
    const question = decoded.Content;

    // 调用Coze
    const cozeRes = await axios.post(COZE_URL, {
      content: { query: { prompt: [{ type: "text", content: { text: question } }] } },
      type: "query",
      session_id: "wechat_bot",
      project_id: COZE_PROJECT_ID
    }, {
      headers: {
        "Authorization": "Bearer " + COZE_TOKEN,
        "Content-Type": "application/json"
      }
    });

    const answer = cozeRes.data?.content || "暂无回答";

    // 回复企业微信
    res.json({ msgtype: "text", text: { content: answer } });

  } catch (err) {
    res.json({ msgtype: "text", text: { content: "服务异常，请稍后再试" } });
  }
});

// AES解密（企业微信专用）
function decrypt(text, encodingAesKey) {
  const aesKey = Buffer.from(encodingAesKey + '=', 'base64');
  const cipher = crypto.createDecipheriv('aes-256-cbc', aesKey, aesKey.slice(0, 16));
  let decrypted = cipher.update(text, 'base64', 'utf8');
  decrypted += cipher.final('utf8');
  return JSON.parse(decrypted);
}

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`服务启动：端口 ${port}`);
});
