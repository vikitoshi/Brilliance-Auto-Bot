# Brilliance Auto Bot

Automated bot for interacting with the Brilliance Global platform, handling login, claiming rewards, joining airdrops, and managing mining operations.

## Features

- Automated login with multiple accounts
- Reward claiming functionality
- Airdrop participation with generated social media details
- Mining operation management
- Proxy support
- User agent rotation for better anonymity
- Countdown timer for next mining claim

## Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn
- .env file with account credentials

## Installation

1. Clone the repository:
```bash
git clone https://github.com/vikitoshi/Brilliance-Auto-Bot.git
cd Brilliance-Auto-Bot
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your account credentials:
```env
email_1=your_email1@example.com
password_1=your_password1
email_2=your_email2@example.com
password_2=your_password2
# Add more accounts as needed
```

4. (Optional) Add proxies to `proxies.txt` (one per line in format `http://user:pass@host:port`)

## Usage

Run the bot:
```bash
node index.js
```

## Configuration

The bot will automatically:
1. Load accounts from `.env` file
2. Load proxies from `proxies.txt` (if available)
3. Process each account sequentially with:
   - Login
   - Profile check
   - Reward claiming (if available)
   - Airdrop participation
   - Mining start
4. Display countdown timers for next mining claim

## Proxy Support

To use proxies:
1. Create a `proxies.txt` file in the root directory
2. Add your proxies (one per line) in format:
   ```
   http://username:password@host:port
   http://host:port
   ```
3. The bot will automatically rotate through available proxies

## Logging

The bot provides color-coded console output with different log levels:
- ✅ Success messages (green)
- ⚠ Warnings (yellow)
- ✗ Errors (red)
- ⟳ Loading/processing indicators (cyan)
- ➤ Step indicators (white)

## Notes

- The bot includes random delays between operations to appear more human-like
- User agents are rotated automatically
- Social media details are generated randomly for airdrop participation
- Mining operations are automatically tracked with countdown timers

## Disclaimer

This bot is for educational purposes only. Use at your own risk. The maintainers are not responsible for any account restrictions or consequences from using this bot.
