<img width="1011" height="609" alt="image" src="https://github.com/user-attachments/assets/85175e0e-1994-418d-acb7-5aba677c13c3" />

1. Environment Setup

   1.1. Manually grabbed `libssl1.1` from the Buster archives because MongoDB 4.4 was refusing to install without it.
   1.2. Forced a Node.js v16 installation because `react-scripts` 4 crashes on Node 17+ with an export error.
   1.3. Pinned `pip` below v24.1 to work around the strict metadata validation errors caused by the outdated `celery==5.0.5` package in the requirements.

2. Backend (`views.py`)

   2.1. Wrote the GET and POST endpoints using pure `pymongo` as requested, completely bypassing Django's models and ORM.
   2.2. To keep the code modular (SRP), moved all database queries (`fetch_all_todos`, `insert_todo`) and BSON serialization outside the `APIView` class so the view only handles HTTP routing.
   2.3. Added targeted `PyMongoError` exception handling so the server doesn't crash on a database disconnect.
   2.4. Ensured the POST route returns the correct `201 Created` status instead of a generic `200 OK`.

3. Frontend (`App.js`)

   3.1. Rebuilt the UI using React Hooks (`useState`, `useEffect`) after removing the hardcoded HTML.
   3.2. Configured the form to POST data to the Django backend and immediately perform a fresh GET request so the UI always stays synchronized with the database.
   3.3. Added defensive state management to disable the input field and submit button while an API request is in progress, preventing accidental duplicate todo submissions.
