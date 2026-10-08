# CampusFlow Architecture

```text
                         Google
                           │
                     OAuth / Gmail
                           │
                           ▼
React + Vite ───────► Express API ───────► MySQL
    │                    │                    │
    │                    ├── users            │
    │                    ├── login_events     │
    │                    └── prediction_logs  │
    │
    ├── Dashboard
    ├── Check Now
    ├── Plan a Visit
    └── Developer Console
                           │
                           ▼
                  Python Model Service
                           │
              ┌────────────┴────────────┐
              │                         │
          LSTM / GRU                 CNN / MNV2
       future crowd                 image crowd
```

## DBMS role

MySQL stores:
- who accessed the application
- Google account identity metadata
- role
- login count
- login timestamps
- prediction requests
- prediction outputs
- model name
- confidence
- requested future time

## Authentication role

Google returns a credential to the React app.

React sends the credential to Express.

Express verifies it against the configured Google client ID.

Only after verification:
- user is inserted/updated in MySQL
- login event is recorded
- a signed application JWT is returned

The React app then uses the JWT for protected API calls.

## Real model integration

The recommended final deployment is:

Node API → Python FastAPI → TensorFlow/Keras models

This avoids putting Python model code inside the React frontend and keeps model inference separate from authentication and DBMS concerns.
