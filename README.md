# Identity-Reconciliation

This project offers an identity reconciliation service built with Node, Express, TypeORM, and SQLite.

**Setup**

**Prerequisites:**

Node.js installed (Recommended version: 14.x)

Git

**Clone the Repository:**

git clone https://github.com/arnav1408/Identity-Reconciliation.git

cd Identity-Reconciliation

**Install Dependencies:**

npm install

**Environment Configuration:**

Create a .env file in the root directory.

Add necessary environment variables. For example:

PORT=3000

DATABASE_PATH={fluxkartdb.sqlite}

**Running Locally**

**Start the Development Server:**

npm run start

Navigate to http://localhost:3000 or the port you've configured to access the service.

**Endpoints**

POST /identify: Reconcile the identity based on the provided email and/or phone number.

**Hosting**

The project is currently hosted on Render.com. You can access the live service at https://identity-reconciliation-crax.onrender.com/.
