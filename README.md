# ATM CASH WITHDRAWAL

- The application must correctly process withdrawals with minimum note dispensing and handle user-selected denominations.
- Users can optionally select a denomination from available options (10, 20, 50, 100, 200, 500, 1000) to withdraw cash.
- React components (Account Input, Pin Input, Amount Input, Receipt, Token Countdown, Cancel Session) manage user interaction and display on UI.
- The application allowed users to check their balance.
- User can generate the transaction receipt after successfully withdrawal.

# Account Details

## Kushal Kumar

- Account Number: 1111 1111 1111 1111
- Balance: 100,000
- PIN: 1111

## Jatin

- Account Number: 2222 2222 2222 2222
- Balance: 10,000
- PIN: 2222

## Jane Smith

- Account Number: 3333 3333 3333 3333
- Balance: 20,000
- PIN: 3333

## John Doe

- Account Number: 4444 4444 4444 4444
- Balance: 15,000
- PIN: 4444

#  Project Setup and MongoDB Connection Guidelines 

## Step 1: Install Node Modules

### 1. Open a Code Folder

- Open your project directory
- Run the command in the terminal npm install

### 2. Install Server Dependencies

- Change to the server directory cd ./server/
- Run the command to install server dependencies npm install

## Step 2: Create a .env File in Root Directory

- Create a .env file in the root directory of your project.
- Add the following lines to the file
  - REACT_APP_API_BASE_URL = <http://localhost:2003>

## Step 3: Create a MongoDB Atlas Account

### 1. Sign Up

- Go to https://www.mongodb.com/cloud/atlas/register and sign up for an account.

## Step 4: Create a New Project in MongoDB Atlas

### 1. Create a Project

- Enter the name of the project.
- Click "Next".
- Click "Create Project".

## Step 5: Create a Cluster

### 1. Build a Cluster

- Choose your cloud provider and region.
- Select a cluster tier (free tier is available for development).
- Click "Create Cluster".

## Step 6: Connect to the Cluster

### 1. Add Database User

- Add a username and password.
- Click "Create Database User".

### 2. Whitelist IP Address

- Add your IP address.

### 3. Get the Connection String

- Choose "Connect your application".
- Copy the connection string.

## Step 7: Add Connection String to Environment File

### 1. Create a .env File in Server Directory

- Create a .env file in the server folder.

- Add the following lines, replacing <username> and <password> with your actual credentials:
  1. MONGODB_URL = mongodb+srv://<username>:<password>@cluster0.dvhygtl.mongodb.net/AtmDB
  2. PORT = 2003
  3. JWT_SECRET = your_key

## Step 8: Connect with MongoDB Compass

### 1. Open MongoDB Compass

- Paste your MongoDB URL into MongoDB Compass.
- Connect with the database.

## Step 9: Run the Application

### 1. Seed the Database

- In the terminal, change to the server directory cd ./server/
- Run the seed command: npm run seed

### 2. Start the Development Server

- Change back to the root directory cd..
- Start the development server: npm run dev