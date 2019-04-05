Short guide:

How to run locally:
1. Install node and mongodb
2. Make sure mongodb is running
3. Clone the repo
4. npm install
5. Contact dotkom to get url, client id and client secret for openid
6. Create .env file in root
7. npm start

What you need in .env file:

HOST_URL = FROM DOTKOM

CLIENT_ID = FROM DOTKOM

CLIENT_SECRET = FROM DOTKOM

REDIRECT_URI = http://localhost:8080/auth

SCOPE = 'openid profile onlineweb4 email' // this will give you all required information

COOKIE_SECRET = AnyRandomWord // Just dont use this for safety reasons
