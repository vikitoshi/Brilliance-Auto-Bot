require('dotenv').config();
const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const fs = require('fs').promises;

const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  white: '\x1b[37m',
  bold: '\x1b[1m',
};

const logger = {
  info: (msg) => console.log(`${colors.green}[✓] ${msg}${colors.reset}`),
  wallet: (msg) => console.log(`${colors.yellow}[➤] ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}[⚠] ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}[✗] ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}[✅] ${msg}${colors.reset}`),
  loading: (msg) => console.log(`${colors.cyan}[⟳] ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.white}[➤] ${msg}${colors.reset}`),
  banner: () => {
    console.log(`${colors.cyan}${colors.bold}`);
    console.log(`---------------------------------------------`);
    console.log(`  Brilliance Auto Bot - Airdrop Insiders `);
    console.log(`---------------------------------------------${colors.reset}\n`);
  },
};

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
];

const secChUaOptions = [
  '"Chromium";v="136", "Brave";v="136", "Not.A/Brand";v="99"',
  '"Chromium";v="120", "Google Chrome";v="120", "Not.A/Brand";v="99"',
  '"Firefox";v="115", "Gecko";v="20100101", "Not.A/Brand";v="99"',
];

const firstNames = ['John', 'Emma', 'Michael', 'Sophia', 'James', 'Olivia', 'William', 'Ava', 'Carole'];
const randomString = (length) => Math.random().toString(36).substring(2, 2 + length);

const generateUsername = () => {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  return `@${first}${randomString(5)}`;
};

const generateRetweetLink = () =>
  `https://x.com/${randomString(8)}/status/${Math.floor(Math.random() * 1000000000000000)}`;

async function makeRequest(config, proxy, retries = 3) {
  const headers = {
    ...config.headers,
    'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'en-US,en;q=0.6',
    'sec-ch-ua': secChUaOptions[Math.floor(Math.random() * secChUaOptions.length)],
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'sec-gpc': '1',
    'Referer': 'https://brillianceglobal.ltd/',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'priority': 'u=1, i',
  };

  const axiosConfig = {
    ...config,
    headers,
    httpsAgent: proxy ? new HttpsProxyAgent(proxy) : undefined,
    timeout: 10000,
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios(axiosConfig);
      return response.data;
    } catch (err) {
      const errorMsg = err.response
        ? `Request failed with status ${err.response.status}: ${JSON.stringify(err.response.data)}`
        : `Request failed: ${err.message}`;
      if (attempt === retries) {
        logger.error(errorMsg);
        throw new Error(errorMsg);
      }
      logger.warn(`Retrying request (${attempt}/${retries})...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

async function login(email, password, proxy) {
  const boundary = `WebKitFormBoundary${randomString(16)}`;
  const body = [
    `------${boundary}\r\nContent-Disposition: form-data; name="email"\r\n\r\n${email}\r\n`,
    `------${boundary}\r\nContent-Disposition: form-data; name="password"\r\n\r\n${password}\r\n`,
    `------${boundary}--\r\n`,
  ].join('');

  const response = await makeRequest({
    url: 'https://api.brillianceglobal.ltd/login',
    method: 'POST',
    headers: {
      'content-type': `multipart/form-data; boundary=----${boundary}`,
    },
    data: body,
  }, proxy);

  if (!response || !response.token) {
    throw new Error(`Invalid login response: ${JSON.stringify(response)}`);
  }

  return response.token;
}

async function profile(token, proxy) {
  const boundary = `WebKitFormBoundary${randomString(16)}`;
  const body = `------${boundary}\r\nContent-Disposition: form-data; name="token"\r\n\r\n${token}\r\n------${boundary}--\r\n`;

  const response = await makeRequest({
    url: 'https://api.brillianceglobal.ltd/profile',
    method: 'POST',
    headers: {
      'content-type': `multipart/form-data; boundary=----${boundary}`,
    },
    data: body,
  }, proxy);

  if (!response || !Array.isArray(response) || !response[0]) {
    throw new Error(`Invalid profile response: ${JSON.stringify(response)}`);
  }

  return response[0];
}

async function claim(token, proxy) {
  const boundary = `WebKitFormBoundary${randomString(16)}`;
  const body = `------${boundary}\r\nContent-Disposition: form-data; name="token"\r\n\r\n${token}\r\n------${boundary}--\r\n`;

  const response = await makeRequest({
    url: 'https://api.brillianceglobal.ltd/claim',
    method: 'POST',
    headers: {
      'content-type': `multipart/form-data; boundary=----${boundary}`,
    },
    data: body,
  }, proxy);

  if (!response || !response.success) {
    throw new Error(`Invalid claim response: ${JSON.stringify(response)}`);
  }

  return response;
}

async function joinAirdrop(token, twitter, telegram, retweetLink, proxy) {
  const boundary = `WebKitFormBoundary${randomString(16)}`;
  const body = [
    `------${boundary}\r\nContent-Disposition: form-data; name="twitter"\r\n\r\n${twitter}\r\n`,
    `------${boundary}\r\nContent-Disposition: form-data; name="retweet"\r\n\r\n${retweetLink}\r\n`,
    `------${boundary}\r\nContent-Disposition: form-data; name="telegram"\r\n\r\n${telegram}\r\n`,
    `------${boundary}\r\nContent-Disposition: form-data; name="telegram2"\r\n\r\n${telegram}\r\n`,
    `------${boundary}\r\nContent-Disposition: form-data; name="token"\r\n\r\n${token}\r\n`,
    `------${boundary}--\r\n`,
  ].join('');

  const response = await makeRequest({
    url: 'https://api.brillianceglobal.ltd/joinairdrop',
    method: 'POST',
    headers: {
      'content-type': `multipart/form-data; boundary=----${boundary}`,
    },
    data: body,
  }, proxy);

  if (!response || !response.success) {
    throw new Error(`Invalid airdrop response: ${JSON.stringify(response)}`);
  }

  return response;
}

async function mining(token, proxy) {
  const boundary = `WebKitFormBoundary${randomString(16)}`;
  const body = `------${boundary}\r\nContent-Disposition: form-data; name="token"\r\n\r\n${token}\r\n------${boundary}--\r\n`;

  const response = await makeRequest({
    url: 'https://api.brillianceglobal.ltd/mining',
    method: 'POST',
    headers: {
      'content-type': `multipart/form-data; boundary=----${boundary}`,
    },
    data: body,
  }, proxy);

  if (!response) {
    throw new Error(`Invalid mining response: ${JSON.stringify(response)}`);
  }

  return response;
}

function parseTimestamp(timestamp) {
  const [date, time] = timestamp.split(' ');
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, Math.floor(seconds)).getTime();
}

function getNextMiningTime(miningtime) {
  const MINING_INTERVAL = 12 * 60 * 60 * 1000; 
  const miningTimestamp = parseTimestamp(miningtime);
  return miningTimestamp + MINING_INTERVAL;
}

function startCountdown(email, nextClaimTime) {
  const interval = setInterval(() => {
    const now = Date.now();
    const timeLeft = nextClaimTime - now;

    if (timeLeft <= 0) {
      clearInterval(interval);
      logger.info(`Next mining claim available for ${email}`);
      return;
    }

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    process.stdout.write(`\r${colors.cyan}[⟳] ${email}: Next claim in ${hours}h ${minutes}m ${seconds}s${colors.reset}`);
  }, 1000);
}

function loadAccounts() {
  const accounts = [];
  let i = 1;
  while (process.env[`email_${i}`] && process.env[`password_${i}`]) {
    accounts.push({
      email: process.env[`email_${i}`].trim(),
      password: process.env[`password_${i}`].trim(),
    });
    i++;
  }
  return accounts;
}

async function main() {
  logger.banner();

  const accounts = loadAccounts();
  if (accounts.length === 0) {
    logger.error('No accounts found in .env file');
    return;
  }
  logger.info(`Loaded ${accounts.length} accounts`);

  const processedAccounts = [];

  for (let i = 0; i < accounts.length; i++) {
    const { email, password } = accounts[i];
    logger.step(`Processing account ${i + 1}/${accounts.length}: ${email}`);

    try {
      logger.loading(`Logging in to ${email}...`);
      const token = await login(email, password, null);
      logger.success('Logged in successfully');

      logger.loading('Fetching profile...');
      const profileData = await profile(token, null);
      logger.success(`Profile fetched: ${profileData.myrefcode || 'N/A'}`);

      const shouldClaim = profileData.claim === 'No' || !profileData.claimtime;
      if (shouldClaim) {
        logger.loading('Claiming reward...');
        const claimResponse = await claim(token, null);
        logger.success(`Claim: ${claimResponse.success}`);

        logger.loading('Submitting airdrop...');
        const twitter = generateUsername();
        const telegram = generateUsername();
        const retweetLink = generateRetweetLink();
        const airdropResponse = await joinAirdrop(token, twitter, telegram, retweetLink, null);
        logger.success(`Airdrop: ${airdropResponse.success}`);
      } else {
        logger.info(`Skipping claim and airdrop for ${email}: Already completed (claim: ${profileData.claim}, claimtime: ${profileData.claimtime})`);
      }

      logger.loading('Starting mining...');
      const miningResponse = await mining(token, null);

      let nextClaimTime;
      if (miningResponse.success) {
        logger.success(`Mining started: BINC ${miningResponse.binc}`);
        if (miningResponse.nextmining) {
          nextClaimTime = parseTimestamp(miningResponse.nextmining);
        } else if (profileData.miningtime) {
          nextClaimTime = getNextMiningTime(profileData.miningtime);
        } else {
          logger.warn(`No miningtime or nextmining found for ${email}. Using default 12-hour interval.`);
          nextClaimTime = Date.now() + 12 * 60 * 60 * 1000; 
        }
      } else if (miningResponse.error && miningResponse.nextmining) {
        logger.info(`Mining already running for ${email}: Wait ${miningResponse.error.split('Wait ')[1]}`);
        nextClaimTime = parseTimestamp(miningResponse.nextmining);
      } else {
        throw new Error(`Invalid mining response: ${JSON.stringify(miningResponse)}`);
      }

      processedAccounts.push({
        email,
        token,
        nextClaimTime,
      });

      logger.wallet(`Account ${i + 1} completed: ${email}`);
    } catch (err) {
      logger.error(`Error with account ${i + 1} (${email}): ${err.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, 10000)); 
  }

  if (processedAccounts.length > 0) {
    logger.info('Starting countdown for next mining claim...');
    processedAccounts.forEach(({ email, nextClaimTime }) => {
      startCountdown(email, nextClaimTime);
    });
  } else {
    logger.error('No accounts successfully processed for countdown');
  }

  await new Promise(() => {});
}

main().catch(err => {
  logger.error(`Fatal error: ${err.message}`);
  process.exit(1);
});