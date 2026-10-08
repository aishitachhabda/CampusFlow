# Optional Python model service

When the Colab models are trained, deploy them behind FastAPI.

Suggested endpoints:

POST /predict/image
- multipart image
- resource
- returns:
  score
  status
  confidence
  recommendation

POST /predict/future
- resource
- requested_time
- returns:
  score
  status
  recommendation

GET /predict/best-times
- resource
- date

The Node server should call this service from:
server/src/services/predictionService.js

This separation keeps:
React = UI
Node = authentication, DBMS, API/security
Python = Deep Learning inference
MySQL = persistence/audit trail
